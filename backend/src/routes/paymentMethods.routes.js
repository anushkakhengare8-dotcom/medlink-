const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { listPaymentMethods, addPaymentMethod, deletePaymentMethod } = require('../controllers/paymentMethods.controller');

router.get('/', requireAuth, listPaymentMethods);
router.post('/', requireAuth, addPaymentMethod);
router.delete('/:id', requireAuth, deletePaymentMethod);

module.exports = router;
