const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getSupabase } = require('../utils/supabase');
const { projectSchema } = require('../../../../packages/validation');

const router = express.Router();
const MANAGERS = ['SUPER_ADMIN', 'CEO', 'OPERATIONS_MANAGER', 'PROJECT_MANAGER', 'ADMIN'];

router.get('/', async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const publicOnly = req.query.admin !== 'true';
    let query = supabase.from('projects').select('*, category:categories(*)', { count: 'exact' });
    if (publicOnly) query = query.neq('status', 'ARCHIVED');
    if (req.query.status) query = query.eq('status', String(req.query.status));
    if (req.query.featured) query = query.eq('featured', String(req.query.featured) === 'true');
    if (req.query.category) query = query.eq('category_id', String(req.query.category));
    if (req.query.search) {
      const s = `%${String(req.query.search)}%`;
      query = query.or(`title.ilike.${s},client.ilike.${s}`);
    }
    if (req.query.member) {
      const { data: memberships, error: mErr } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', String(req.query.member));
      if (mErr) throw mErr;
      const ids = (memberships ?? []).map((m) => m.project_id);
      if (ids.length === 0) return res.json({ success: true, data: [], pagination: { page: 1, limit: 12, total: 0 } });
      query = query.in('id', ids);
    }
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? '12'), 10) || 12));
    query = query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1);
    const { data, error, count } = await query;
    if (error) throw error;
    return res.json({ success: true, data, pagination: { page, limit, total: count ?? 0 } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const bySlug = req.query.by === 'slug';
    let query = supabase.from('projects').select('*, category:categories(*), members:project_members(user:profiles!project_members_user_id_fkey(full_name,avatar_url),role), milestones(*), tasks(id,title,status,priority,due_date)');
    query = bySlug ? query.eq('slug', req.params.id) : query.eq('id', req.params.id);
    const { data, error } = await query.single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }
});

router.post('/', authenticate, authorize(...MANAGERS), async (req, res) => {
  try {
    const parsed = projectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid project data' });
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase.from('projects').insert(parsed.data).select().single();
    if (error) throw error;
    await supabase.from('project_members').insert({ project_id: data.id, user_id: req.user.profile.id, role: 'PROJECT_MANAGER' });
    await supabase.from('audit_logs').insert({ user_id: req.user.profile.id, action: 'PROJECT_CREATED', resource_type: 'projects', resource_id: String(data.id) });
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id', authenticate, authorize(...MANAGERS), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase
      .from('projects')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { count } = await supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('project_id', req.params.id);
    if ((count ?? 0) > 0) {
      return res.status(400).json({ success: false, error: 'Cannot delete project with existing tasks. Archive instead.' });
    }
    const { data, error } = await supabase.from('projects').delete().eq('id', req.params.id).select().single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
