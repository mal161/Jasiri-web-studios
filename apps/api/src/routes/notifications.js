const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getSupabase } = require('../utils/supabase');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    let query = supabase.from('notifications').select('*').eq('recipient_id', req.user.profile.id);
    if (req.query.read !== undefined) query = query.eq('read', String(req.query.read) === 'true');
    query = query.order('created_at', { ascending: false }).limit(100);
    const { data, error } = await query;
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { count, error } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('recipient_id', req.user.profile.id).eq('read', false);
    if (error) throw error;
    return res.json({ success: true, data: { unread_count: count ?? 0 } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/read-all', authenticate, async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { error } = await supabase.from('notifications').update({ read: true }).eq('recipient_id', req.user.profile.id).eq('read', false);
    if (error) throw error;
    return res.json({ success: true, data: { marked_all: true } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase.from('notifications').update({ read: true }).eq('id', req.params.id).eq('recipient_id', req.user.profile.id).select().single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', authenticate, authorize('SUPER_ADMIN', 'CEO', 'OPERATIONS_MANAGER', 'PROJECT_MANAGER', 'SALES', 'ADMIN'), async (req, res) => {
  try {
    const { recipient_id, type, title, message, link } = req.body;
    if (!recipient_id || !type || !title) return res.status(400).json({ success: false, error: 'recipient_id, type and title are required' });
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase.from('notifications').insert({ recipient_id, type, title, message: message ?? null, link: link ?? null }).select().single();
    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
