const express = require('express');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

router.use('/auth', require('./auth'));
router.use('/analytics', require('./analytics'));
router.use('/leads', require('./leads'));
router.use('/projects', require('./projects'));
router.use('/clients', require('./clients'));
router.use('/tasks', require('./tasks'));
router.use('/invoices', require('./invoices'));
router.use('/quotes', require('./quotes'));
router.use('/posts', require('./blog'));
router.use('/blog', require('./blog'));
router.use('/notifications', require('./notifications'));
router.use('/employees', require('./employees'));
router.use('/departments', require('./departments'));
router.use('/files', require('./files'));
router.use('/messages', require('./messages'));
router.use('/milestones', require('./milestones'));
router.use('/settings', require('./settings'));
router.use('/audit-logs', require('./audit'));
router.use('/search', require('./search'));
router.use('/users', require('./users'));

module.exports = router;
