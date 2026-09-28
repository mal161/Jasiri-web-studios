const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getSupabase } = require('../utils/supabase');
const { leadSchema } = require('../../../../packages/validation');

const router = express.Router();
const STAFF = ['SUPER_ADMIN', 'CEO', 'OPERATIONS_MANAGER', 'PROJECT_MANAGER', 'SALES', 'ADMIN'];

router.get('/', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    let query = supabase.from('leads').select('*, assignee:profiles!leads_assigned_to_fkey(full_name)', { count: 'exact' });
    if (req.query.status) query = query.eq('status', String(req.query.status));
    if (req.query.assigned_to) query = query.eq('assigned_to', String(req.query.assigned_to));
    if (req.query.source) query = query.eq('source', String(req.query.source));
    if (req.query.search) {
      const s = `%${String(req.query.search)}%`;
      query = query.or(`name.ilike.${s},company.ilike.${s},email.ilike.${s}`);
    }
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20));
    query = query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1);
    const { data, error, count } = await query;
    if (error) throw error;
    return res.json({ success: true, data, pagination: { page, limit, total: count ?? 0 } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase
      .from('leads')
      .select('*, assignee:profiles!leads_assigned_to_fkey(full_name), notes:lead_notes(*, author:profiles!lead_notes_user_id_fkey(full_name))')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const parsed = leadSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid lead data' });
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase.from('leads').insert(parsed.data).select().single();
    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase
      .from('leads')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    await supabase.from('audit_logs').insert({
      user_id: req.user.profile.id,
      action: 'LEAD_STATUS_CHANGED',
      resource_type: 'leads',
      resource_id: String(req.params.id),
      metadata: { patch: req.body }
    });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:id/notes', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const message = String(req.body.message ?? '').trim();
    if (!message) return res.status(400).json({ success: false, error: 'Message is required' });
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase
      .from('lead_notes')
      .insert({ lead_id: req.params.id, user_id: req.user.profile.id, message })
      .select()
      .single();
    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
