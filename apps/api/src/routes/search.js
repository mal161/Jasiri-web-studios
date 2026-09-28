const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getSupabase } = require('../utils/supabase');

const router = express.Router();
const STAFF = ['SUPER_ADMIN', 'CEO', 'OPERATIONS_MANAGER', 'PROJECT_MANAGER', 'SALES', 'FINANCE', 'HR', 'CUSTOMER_SUPPORT', 'ADMIN', 'DEVELOPER', 'DESIGNER'];

router.get('/', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const q = String(req.query.q ?? '').trim();
    if (q.length < 2) return res.json({ success: true, data: { projects: [], leads: [], posts: [], tasks: [], invoices: [] } });
    const s = `%${q}%`;
    const supabase = req.db || getSupabase();
    const [projects, leads, posts, tasks, invoices] = await Promise.all([
      supabase.from('projects').select('id,title,slug,status').or(`title.ilike.${s},client.ilike.${s}`).limit(5),
      supabase.from('leads').select('id,name,email,company,status').or(`name.ilike.${s},email.ilike.${s},company.ilike.${s}`).limit(5),
      supabase.from('posts').select('id,title,slug,status').ilike('title', s).limit(5),
      supabase.from('tasks').select('id,title,status,project_id').ilike('title', s).limit(5),
      supabase.from('invoices').select('id,invoice_number,status,total').ilike('invoice_number', s).limit(5)
    ]);
    for (const r of [projects, leads, posts, tasks, invoices]) {
      if (r.error) throw r.error;
    }
    return res.json({
      success: true,
      data: { projects: projects.data ?? [], leads: leads.data ?? [], posts: posts.data ?? [], tasks: tasks.data ?? [], invoices: invoices.data ?? [] }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
