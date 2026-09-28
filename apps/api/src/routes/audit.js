const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getSupabase } = require('../utils/supabase');

const router = express.Router();
const STAFF = ['SUPER_ADMIN', 'CEO', 'OPERATIONS_MANAGER', 'FINANCE', 'ADMIN'];

router.get('/', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    let query = supabase.from('audit_logs').select('*, actor:profiles!audit_logs_user_id_fkey(full_name)', { count: 'exact' });
    if (req.query.action) query = query.eq('action', String(req.query.action));
    if (req.query.resource_type) query = query.eq('resource_type', String(req.query.resource_type));
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '30'), 10) || 30));
    query = query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1);
    const { data, error, count } = await query;
    if (error) throw error;
    return res.json({ success: true, data, pagination: { page, limit, total: count ?? 0 } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
