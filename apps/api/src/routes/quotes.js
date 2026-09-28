const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getSupabase } = require('../utils/supabase');
const { quoteSchema } = require('../../../../packages/validation');

const router = express.Router();
const STAFF = ['SUPER_ADMIN', 'CEO', 'OPERATIONS_MANAGER', 'SALES', 'PROJECT_MANAGER', 'ADMIN'];

router.get('/', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    let query = supabase.from('quotes').select('*, items:quote_items(*)', { count: 'exact' });
    if (req.query.status) query = query.eq('status', String(req.query.status));
    if (req.query.lead_id) query = query.eq('lead_id', String(req.query.lead_id));
    query = query.order('created_at', { ascending: false }).limit(100);
    const { data, error, count } = await query;
    if (error) throw error;
    return res.json({ success: true, data, count });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase.from('quotes').select('*, items:quote_items(*)').eq('id', req.params.id).single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(404).json({ success: false, error: 'Quote not found' });
  }
});

router.post('/', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const parsed = quoteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid quote data' });
    const supabase = req.db || getSupabase();
    const { items, ...quote } = parsed.data;
    const { data, error } = await supabase.from('quotes').insert(quote).select().single();
    if (error) throw error;
    if (items && items.length > 0) {
      const { error: itemError } = await supabase.from('quote_items').insert(items.map((i) => ({ quote_id: data.id, ...i })));
      if (itemError) throw itemError;
    }
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id/status', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { data, error } = await supabase.from('quotes').update({ status: req.body.status, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:id/convert', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const { data: quote, error: qErr } = await supabase
      .from('quotes')
      .select('*, items:quote_items(*)')
      .eq('id', req.params.id)
      .single();
    if (qErr) throw qErr;
    if (quote.status === 'ACCEPTED') {
      return res.status(400).json({ success: false, error: 'Quote already converted' });
    }
    const title = String(req.body.title ?? `Project from ${quote.quote_number}`).trim();
    const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'project';
    const slug = `${slugBase}-${Date.now().toString(36)}`;
    const itemLines = (quote.items ?? []).map((i) => `- ${i.description} (x${i.quantity})`).join('\n');
    const { data: project, error: pErr } = await supabase
      .from('projects')
      .insert({
        title,
        slug,
        short_description: quote.notes ?? null,
        full_description: itemLines || null,
        status: 'IN_PROGRESS',
        client: req.body.client ?? null,
        technologies: []
      })
      .select()
      .single();
    if (pErr) throw pErr;
    const { data: updated, error: uErr } = await supabase
      .from('quotes')
      .update({ status: 'ACCEPTED', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (uErr) throw uErr;
    await supabase.from('audit_logs').insert({
      user_id: req.user.profile.id,
      action: 'QUOTE_CONVERTED',
      resource_type: 'quotes',
      resource_id: String(req.params.id),
      metadata: { project_id: project.id }
    });
    return res.status(201).json({ success: true, data: { project, quote: updated } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
