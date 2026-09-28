const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getSupabase } = require('../utils/supabase');

const router = express.Router();
const STAFF = ['SUPER_ADMIN', 'CEO', 'OPERATIONS_MANAGER', 'PROJECT_MANAGER', 'SALES', 'FINANCE', 'HR', 'ADMIN'];

// Lightweight user lookup for assignment pickers (never returns sensitive fields)
router.get('/', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    let query = supabase.from('profiles').select('id,full_name,email,role');
    if (req.query.role) query = query.eq('role', String(req.query.role));
    if (req.query.q) {
      const s = `%${String(req.query.q)}%`;
      query = query.or(`full_name.ilike.${s},email.ilike.${s}`);
    }
    query = query.order('full_name', { ascending: true }).limit(50);
    const { data, error } = await query;
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
