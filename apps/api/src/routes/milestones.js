const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getSupabase } = require('../utils/supabase');

const router = express.Router();
const MANAGERS = ['SUPER_ADMIN', 'CEO', 'OPERATIONS_MANAGER', 'PROJECT_MANAGER', 'ADMIN'];

router.get('/', authenticate, async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    let query = supabase.from('milestones').select('*');
    if (req.query.project_id) query = query.eq('project_id', String(req.query.project_id));
    if (req.query.status) query = query.eq('status', String(req.query.status));
    query = query.order('due_date', { ascending: true, nullsFirst: false }).limit(200);
    const { data, error } = await query;
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', authenticate, authorize(...MANAGERS), async (req, res) => {
  try {
    const { project_id, title, description, due_date, status } = req.body;
    if (!project_id || !title) {
      return res.status(400).json({ success: false, error: 'project_id and title are required' });
    }
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase
      .from('milestones')
      .insert({ project_id, title, description: description ?? null, due_date: due_date ?? null, status: status ?? 'TODO' })
      .select()
      .single();
    if (error) throw error;
    await supabase.from('audit_logs').insert({ user_id: req.user.profile.id, action: 'MILESTONE_CREATED', resource_type: 'milestones', resource_id: String(data.id) });
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id', authenticate, authorize(...MANAGERS), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase
      .from('milestones')
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

router.delete('/:id', authenticate, authorize(...MANAGERS), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase.from('milestones').delete().eq('id', req.params.id).select().single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
