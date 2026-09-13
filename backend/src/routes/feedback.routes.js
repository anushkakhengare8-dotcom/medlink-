const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { submitFeedback, listMyFeedback } = require('../controllers/feedback.controller');

router.post('/', requireAuth, submitFeedback);
router.get('/', requireAuth, listMyFeedback);

module.exports = router;
