const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { listAddresses, createAddress, deleteAddress } = require('../controllers/addresses.controller');

router.get('/', requireAuth, listAddresses);
router.post('/', requireAuth, createAddress);
router.delete('/:id', requireAuth, deleteAddress);

module.exports = router;
