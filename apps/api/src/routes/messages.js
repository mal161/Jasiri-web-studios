const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getSupabase } = require('../utils/supabase');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    let query = supabase.from('messages').select('*');
    if (req.query.project_id) query = query.eq('project_id', String(req.query.project_id));
    if (req.query.mine === 'true') query = query.or(`sender_id.eq.${req.user.profile.id},recipient_id.eq.${req.user.profile.id}`);
    query = query.order('created_at', { ascending: false }).limit(100);
    const { data, error } = await query;
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { project_id, recipient_id, subject, body } = req.body;
    if (!body) return res.status(400).json({ success: false, error: 'body is required' });
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase
      .from('messages')
      .insert({ project_id: project_id ?? null, sender_id: req.user.profile.id, recipient_id: recipient_id ?? null, subject: subject ?? null, body })
      .select()
      .single();
    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase.from('messages').update({ read: true }).eq('id', req.params.id).select().single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
