const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getSupabase } = require('../utils/supabase');

const router = express.Router();
const STAFF = ['SUPER_ADMIN', 'CEO', 'OPERATIONS_MANAGER', 'FINANCE', 'SALES', 'ADMIN'];

router.get('/', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    let query = supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'CLIENT');
    if (req.query.search) {
      // NOTE: profiles has no email column (email lives in auth.users)
      const s = `%${String(req.query.search)}%`;
      query = query.ilike('full_name', s);
    }
    query = query.order('created_at', { ascending: false }).limit(100);
    const { data, error, count } = await query;
    if (error) throw error;
    return res.json({ success: true, data, count });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const isSelf = req.user.profile.id === req.params.id;
    const isStaff = req.user.profile.role !== 'CLIENT';
    if (!isSelf && !isStaff) return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    const { data, error } = await supabase.from('profiles').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(404).json({ success: false, error: 'Client not found' });
  }
});

module.exports = router;
