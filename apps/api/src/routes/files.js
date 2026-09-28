const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getSupabase } = require('../utils/supabase');

const router = express.Router();

// List files for a project (staff or project member via service-role scoping in v1)
router.get('/', authenticate, async (req, res) => {
  try {
    const supabase = getSupabase();
    let query = supabase.from('files').select('*', { count: 'exact' });
    if (req.query.project_id) query = query.eq('project_id', String(req.query.project_id));
    query = query.order('created_at', { ascending: false }).limit(100);
    const { data, error, count } = await query;
    if (error) throw error;
    return res.json({ success: true, data, count });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Record an uploaded file (client uploads via signed URL; metadata recorded here)
router.post('/', authenticate, async (req, res) => {
  try {
    const { project_id, file_name, file_path, file_size, mime_type, bucket } = req.body;
    if (!project_id || !file_name || !file_path) {
      return res.status(400).json({ success: false, error: 'project_id, file_name and file_path are required' });
    }
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('files')
      .insert({ project_id, uploaded_by: req.user.profile.id, file_name, file_path, file_size: file_size ?? null, mime_type: mime_type ?? null, bucket: bucket ?? 'project-assets' })
      .select()
      .single();
    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('files').delete().eq('id', req.params.id).select().single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
