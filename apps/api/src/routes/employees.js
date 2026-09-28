const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getSupabase } = require('../utils/supabase');

const router = express.Router();
const HR = ['SUPER_ADMIN', 'CEO', 'OPERATIONS_MANAGER', 'ADMIN'];

router.get('/', authenticate, authorize(...HR), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    let query = supabase.from('employees').select('*, profile:profiles!employees_user_id_fkey(full_name,avatar_url,role), department:departments(*)', { count: 'exact' });
    if (req.query.department_id) query = query.eq('department_id', String(req.query.department_id));
    if (req.query.status) query = query.eq('employment_status', String(req.query.status));
    query = query.order('created_at', { ascending: false }).limit(100);
    const { data, error, count } = await query;
    if (error) throw error;
    return res.json({ success: true, data, count });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', authenticate, authorize(...HR), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase.from('employees').select('*, profile:profiles!employees_user_id_fkey(full_name,avatar_url,role), department:departments(*)').eq('id', req.params.id).single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(404).json({ success: false, error: 'Employee not found' });
  }
});

router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { user_id, department_id, employee_id, position, start_date, employment_status } = req.body;
    if (!user_id) return res.status(400).json({ success: false, error: 'user_id is required' });
    const { data, error } = await supabase
      .from('employees')
      .insert({ user_id, employee_id: employee_id ?? `EMP-${Date.now()}`, department_id: department_id ?? null, position: position ?? null, employment_status: employment_status ?? 'ACTIVE', start_date: start_date ?? new Date().toISOString().slice(0, 10) })
      .select()
      .single();
    if (error) throw error;
    await supabase.from('audit_logs').insert({ user_id: req.user.profile.id, action: 'EMPLOYEE_CREATED', resource_type: 'employees', resource_id: String(data.id) });
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase.from('employees').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase.from('employees').delete().eq('id', req.params.id).select().single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
