const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { listMedicines, createMedicine, updateMedicine, createMedicinesBulk } = require('../controllers/medicines.controller');

router.get('/', requireAuth, listMedicines);
router.post('/', requireAuth, requireRole('DISTRIBUTOR'), createMedicine);
router.post('/bulk', requireAuth, requireRole('DISTRIBUTOR'), createMedicinesBulk);
router.patch('/:id', requireAuth, requireRole('DISTRIBUTOR'), updateMedicine);

module.exports = router;
