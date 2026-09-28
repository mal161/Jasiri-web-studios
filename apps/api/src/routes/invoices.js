const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getSupabase } = require('../utils/supabase');
const { invoiceSchema } = require('../../../../packages/validation');

const router = express.Router();
const FINANCE = ['SUPER_ADMIN', 'CEO', 'FINANCE', 'OPERATIONS_MANAGER', 'ADMIN'];

router.get('/', authenticate, authorize(...FINANCE), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    let query = supabase.from('invoices').select('*, items:invoice_items(*)', { count: 'exact' });
    if (req.query.status) query = query.eq('status', String(req.query.status));
    if (req.query.project_id) query = query.eq('project_id', String(req.query.project_id));
    query = query.order('issued_date', { ascending: false }).limit(100);
    const { data, error, count } = await query;
    if (error) throw error;
    return res.json({ success: true, data, count });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Client-scoped invoices: only invoices for projects the caller belongs to
router.get('/mine', authenticate, async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { data: memberships, error: mErr } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', req.user.profile.id);
    if (mErr) throw mErr;
    const ids = (memberships ?? []).map((m) => m.project_id);
    if (ids.length === 0) return res.json({ success: true, data: [] });
    const { data, error } = await supabase
      .from('invoices')
      .select('*, items:invoice_items(*)')
      .in('project_id', ids)
      .order('issued_date', { ascending: false })
      .limit(50);
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase
      .from('invoices')
      .select('*, items:invoice_items(*), payments(*)')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    if (req.user.profile.role === 'CLIENT') {
      if (!data.project_id) return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      const { count, error: mErr } = await supabase
        .from('project_members')
        .select('project_id', { count: 'exact', head: true })
        .eq('project_id', data.project_id)
        .eq('user_id', req.user.profile.id);
      if (mErr) throw mErr;
      if (!count) return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(404).json({ success: false, error: 'Invoice not found' });
  }
});

router.post('/', authenticate, authorize(...FINANCE), async (req, res) => {
  try {
    const parsed = invoiceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid invoice data' });
    const supabase = req.db || getSupabase();
    const { items, ...invoice } = parsed.data;
    const { data, error } = await supabase.from('invoices').insert(invoice).select().single();
    if (error) throw error;
    if (items && items.length > 0) {
      const { error: itemError } = await supabase
        .from('invoice_items')
        .insert(items.map((i) => ({ invoice_id: data.id, ...i })));
      if (itemError) throw itemError;
    }
    await supabase.from('audit_logs').insert({ user_id: req.user.profile.id, action: 'INVOICE_CREATED', resource_type: 'invoices', resource_id: String(data.id) });
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id/status', authenticate, authorize(...FINANCE), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { status, ...payment } = req.body;
    if (!status) return res.status(400).json({ success: false, error: 'status is required' });
    const { data, error } = await supabase.from('invoices').update({ status, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (status === 'PAID' && payment.amount) {
      await supabase.from('payments').insert({ invoice_id: req.params.id, amount: payment.amount, payment_method: payment.payment_method ?? 'Bank Transfer', reference: payment.reference ?? null, notes: payment.notes ?? null });
      await supabase.from('audit_logs').insert({ user_id: req.user.profile.id, action: 'PAYMENT_RECORDED', resource_type: 'payments', resource_id: String(req.params.id), metadata: { amount: payment.amount } });
    }
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
