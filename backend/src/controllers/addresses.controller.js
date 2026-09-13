const prisma = require('../config/prisma');

async function listAddresses(req, res, next) {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(addresses);
  } catch (err) {
    next(err);
  }
}

async function createAddress(req, res, next) {
  try {
    const { label, line, city, state, pincode, phone } = req.body;
    if (!line || !city || !state || !pincode || !phone) {
      return res.status(400).json({ error: 'line, city, state, pincode, and phone are required' });
    }

    const address = await prisma.address.create({
      data: { label: label || 'Address', line, city, state, pincode, phone, userId: req.user.id },
    });

    res.status(201).json(address);
  } catch (err) {
    next(err);
  }
}

async function deleteAddress(req, res, next) {
  try {
    const { id } = req.params;
    const address = await prisma.address.findUnique({ where: { id } });

    if (!address || address.userId !== req.user.id) {
      return res.status(404).json({ error: 'Address not found' });
    }

    await prisma.address.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listAddresses, createAddress, deleteAddress };
