const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { listInvoices } = require('../controllers/invoices.controller');

router.get('/', requireAuth, listInvoices);

module.exports = router;
