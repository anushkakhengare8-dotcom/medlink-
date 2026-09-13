const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { listNotifications, markRead } = require('../controllers/notifications.controller');

router.get('/', requireAuth, listNotifications);
router.patch('/:id/read', requireAuth, markRead);

module.exports = router;
