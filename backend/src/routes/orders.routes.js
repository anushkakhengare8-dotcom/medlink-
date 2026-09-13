const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { placeOrder, listMyOrders, updateOrderStatus } = require('../controllers/orders.controller');

router.post('/', requireAuth, requireRole('PHARMACY_OWNER'), placeOrder);
router.get('/', requireAuth, listMyOrders);
router.patch('/:id/status', requireAuth, requireRole('DISTRIBUTOR'), updateOrderStatus);

module.exports = router;
