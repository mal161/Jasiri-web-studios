const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getSupabase } = require('../utils/supabase');

const router = express.Router();
const ADMINS = ['SUPER_ADMIN', 'CEO', 'OPERATIONS_MANAGER', 'ADMIN'];

router.get('/', authenticate, authorize(...ADMINS), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { data, error, count } = await supabase.from('departments').select('*', { count: 'exact' }).order('name', { ascending: true });
    if (error) throw error;
    return res.json({ success: true, data, count });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', authenticate, authorize(...ADMINS), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase.from('departments').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    const { count } = await supabase.from('employees').select('id', { count: 'exact', head: true }).eq('department_id', req.params.id);
    return res.json({ success: true, data: { ...data, employee_count: count ?? 0 } });
  } catch (err) {
    return res.status(404).json({ success: false, error: 'Department not found' });
  }
});

router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { name, code, description, parent_id } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'name is required' });
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase
      .from('departments')
      .insert({ name, code: code ?? name.toUpperCase().replace(/\s+/g, '_'), description: description ?? null, parent_id: parent_id ?? null })
      .select()
      .single();
    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase.from('departments').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { count } = await supabase.from('employees').select('id', { count: 'exact', head: true }).eq('department_id', req.params.id);
    if ((count ?? 0) > 0) return res.status(400).json({ success: false, error: 'Cannot delete department with existing employees. Reassign first.' });
    const { data, error } = await supabase.from('departments').delete().eq('id', req.params.id).select().single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
