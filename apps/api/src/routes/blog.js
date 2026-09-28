const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getSupabase } = require('../utils/supabase');
const { postSchema } = require('../../../../packages/validation');

const router = express.Router();
const EDITORS = ['SUPER_ADMIN', 'CEO', 'OPERATIONS_MANAGER', 'ADMIN'];

router.get('/', async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    let query = supabase.from('posts').select('*, category:categories(*)', { count: 'exact' });
    if (req.query.admin !== 'true') query = query.eq('status', 'PUBLISHED');
    else if (req.query.status) query = query.eq('status', String(req.query.status));
    if (req.query.category) query = query.eq('category_id', String(req.query.category));
    if (req.query.search) {
      const s = `%${String(req.query.search)}%`;
      query = query.or(`title.ilike.${s},excerpt.ilike.${s}`);
    }
    query = query.order('published_at', { ascending: false, nullsFirst: false }).limit(50);
    const { data, error, count } = await query;
    if (error) throw error;
    return res.json({ success: true, data, count });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const bySlug = req.query.by === 'slug';
    let query = supabase.from('posts').select('*, category:categories(*)');
    query = bySlug ? query.eq('slug', req.params.id) : query.eq('id', req.params.id);
    const { data, error } = await query.single();
    if (error) throw error;
    if (data.status !== 'PUBLISHED' && req.query.admin !== 'true') {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(404).json({ success: false, error: 'Post not found' });
  }
});

router.post('/', authenticate, authorize(...EDITORS), async (req, res) => {
  try {
    const parsed = postSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid post data' });
    const supabase = req.db || getSupabase();
    const payload = { ...parsed.data, author_id: req.user.profile.id };
    if (payload.status === 'PUBLISHED' && !req.body.published_at) payload.published_at = new Date().toISOString();
    const { data, error } = await supabase.from('posts').insert(payload).select().single();
    if (error) throw error;
    await supabase.from('audit_logs').insert({ user_id: req.user.profile.id, action: 'POST_CREATED', resource_type: 'posts', resource_id: String(data.id) });
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id', authenticate, authorize(...EDITORS), async (req, res) => {
  try {
    const supabase = req.db || getSupabase();
    const patch = { ...req.body, updated_at: new Date().toISOString() };
    if (patch.status === 'PUBLISHED' && !patch.published_at) patch.published_at = new Date().toISOString();
    if (patch.status && patch.status !== 'PUBLISHED') patch.published_at = null;
    const { data, error } = await supabase.from('posts').update(patch).eq('id', req.params.id).select().single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
