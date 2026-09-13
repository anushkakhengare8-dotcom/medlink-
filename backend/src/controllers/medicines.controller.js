const prisma = require('../config/prisma');

// Any logged-in user can search the catalog (pharmacy owners searching to buy,
// distributors checking their own listings).
async function listMedicines(req, res, next) {
  try {
    const { search } = req.query;

    const medicines = await prisma.medicine.findMany({
      where: search
        ? { name: { contains: search, mode: 'insensitive' } }
        : undefined,
      include: {
        distributor: {
          select: {
            businessName: true,
            addresses: { take: 1, orderBy: { createdAt: 'desc' }, select: { city: true, state: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(medicines);
  } catch (err) {
    next(err);
  }
}

// Only distributors can add to their own catalog.
async function createMedicine(req, res, next) {
  try {
    const { name, manufacturer, price, stock, expiryDate } = req.body;

    if (!name || !manufacturer || price == null || stock == null || !expiryDate) {
      return res.status(400).json({ error: 'name, manufacturer, price, stock, and expiryDate are required' });
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        manufacturer,
        price,
        stock,
        expiryDate: new Date(expiryDate),
        distributorId: req.user.id,
      },
    });

    res.status(201).json(medicine);
  } catch (err) {
    next(err);
  }
}

// Only the distributor who owns a listing can edit it.
async function updateMedicine(req, res, next) {
  try {
    const { id } = req.params;

    const medicine = await prisma.medicine.findUnique({ where: { id } });
    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    if (medicine.distributorId !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own listings' });
    }

    const { name, manufacturer, price, stock, expiryDate } = req.body;
    const updated = await prisma.medicine.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(manufacturer !== undefined && { manufacturer }),
        ...(price !== undefined && { price }),
        ...(stock !== undefined && { stock }),
        ...(expiryDate !== undefined && { expiryDate: new Date(expiryDate) }),
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// Distributors can submit several medicines at once instead of one form per medicine.
async function createMedicinesBulk(req, res, next) {
  try {
    const { medicines } = req.body; // [{ name, manufacturer, price, stock, expiryDate }, ...]

    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ error: 'Provide at least one medicine' });
    }

    for (const m of medicines) {
      if (!m.name || !m.manufacturer || m.price == null || m.stock == null || !m.expiryDate) {
        return res.status(400).json({ error: 'Every row needs name, manufacturer, price, stock, and expiry date' });
      }
    }

    const result = await prisma.medicine.createMany({
      data: medicines.map(m => ({
        name: m.name,
        manufacturer: m.manufacturer,
        price: m.price,
        stock: m.stock,
        expiryDate: new Date(m.expiryDate),
        distributorId: req.user.id,
      })),
    });

    res.status(201).json({ count: result.count });
  } catch (err) {
    next(err);
  }
}

module.exports = { listMedicines, createMedicine, updateMedicine, createMedicinesBulk };
