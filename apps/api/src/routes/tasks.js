const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getSupabase } = require('../utils/supabase');

const router = express.Router();
const MANAGERS = ['SUPER_ADMIN', 'CEO', 'OPERATIONS_MANAGER', 'PROJECT_MANAGER', 'ADMIN'];

router.get('/', authenticate, async (req, res) => {
  try {
    const supabase = getSupabase();
    let query = supabase.from('tasks').select('*, project:projects!tasks_project_id_fkey(title,slug)');
    if (req.query.status) query = query.eq('status', String(req.query.status));
    if (req.query.project_id) query = query.eq('project_id', String(req.query.project_id));
    if (req.query.assignee_id) query = query.eq('assignee_id', String(req.query.assignee_id));
    if (req.query.priority) query = query.eq('priority', String(req.query.priority));
    if (req.query.mine === 'true') query = query.eq('assignee_id', req.user.profile.id);
    query = query.order('created_at', { ascending: false }).limit(200);
    const { data, error } = await query;
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('tasks')
      .select('*, project:projects(title,slug), comments:task_comments(*, author:profiles!task_comments_user_id_fkey(full_name))')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }
});

router.post('/', authenticate, authorize(...MANAGERS), async (req, res) => {
  try {
    const supabase = getSupabase();
    const { title, description, project_id, assignee_id, due_date, priority } = req.body;
    if (!title || !project_id) return res.status(400).json({ success: false, error: 'title and project_id are required' });
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, description: description ?? null, project_id, assignee_id: assignee_id ?? null, due_date: due_date ?? null, priority: priority ?? 'MEDIUM', status: 'TODO' })
      .select()
      .single();
    if (error) throw error;
    await supabase.from('audit_logs').insert({ user_id: req.user.profile.id, action: 'TASK_CREATED', resource_type: 'tasks', resource_id: String(data.id) });
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id', authenticate, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (req.body.status) {
      await supabase.from('audit_logs').insert({ user_id: req.user.profile.id, action: 'TASK_STATUS_CHANGED', resource_type: 'tasks', resource_id: String(data.id), metadata: { new_status: req.body.status } });
    }
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const message = String(req.body.message ?? '').trim();
    if (!message) return res.status(400).json({ success: false, error: 'Message is required' });
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('task_comments')
      .insert({ task_id: req.params.id, user_id: req.user.profile.id, message })
      .select()
      .single();
    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
