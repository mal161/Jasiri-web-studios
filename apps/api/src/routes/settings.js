const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getSupabase } = require('../utils/supabase');

const router = express.Router();
const STAFF = ['SUPER_ADMIN', 'CEO', 'OPERATIONS_MANAGER', 'ADMIN'];
const ADMINS = ['SUPER_ADMIN', 'CEO', 'ADMIN'];

router.get('/', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const supabase = getSupabase();
    let query = supabase.from('settings').select('*');
    if (req.query.category) query = query.eq('category', String(req.query.category));
    query = query.order('key', { ascending: true });
    const { data, error } = await query;
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:key', authenticate, authorize(...ADMINS), async (req, res) => {
  try {
    const supabase = getSupabase();
    const { value, category } = req.body;
    const { data, error } = await supabase
      .from('settings')
      .upsert({ key: req.params.key, value: value ?? {}, category: category ?? 'general', updated_at: new Date().toISOString() }, { onConflict: 'key' })
      .select()
      .single();
    if (error) throw error;
    await supabase.from('audit_logs').insert({ user_id: req.user.profile.id, action: 'SETTINGS_CHANGED', resource_type: 'settings', resource_id: req.params.key });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
