const prisma = require('../config/prisma');

function publicMethod(pm) {
  return {
    id: pm.id,
    cardHolderName: pm.cardHolderName,
    last4: pm.last4,
    expiryMonth: pm.expiryMonth,
    expiryYear: pm.expiryYear,
  };
}

async function listPaymentMethods(req, res, next) {
  try {
    const methods = await prisma.paymentMethod.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(methods.map(publicMethod));
  } catch (err) {
    next(err);
  }
}

async function addPaymentMethod(req, res, next) {
  try {
    const { cardHolderName, last4, expiryMonth, expiryYear } = req.body;

    if (!cardHolderName || !last4 || !expiryMonth || !expiryYear) {
      return res.status(400).json({ error: 'cardHolderName, last4, expiryMonth, and expiryYear are required' });
    }
    if (!/^\d{4}$/.test(last4)) {
      return res.status(400).json({ error: 'last4 must be exactly 4 digits' });
    }

    const method = await prisma.paymentMethod.create({
      data: {
        cardHolderName,
        last4,
        expiryMonth: Number(expiryMonth),
        expiryYear: Number(expiryYear),
        userId: req.user.id,
      },
    });

    res.status(201).json(publicMethod(method));
  } catch (err) {
    next(err);
  }
}

async function deletePaymentMethod(req, res, next) {
  try {
    const { id } = req.params;
    const method = await prisma.paymentMethod.findUnique({ where: { id } });

    if (!method || method.userId !== req.user.id) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    await prisma.paymentMethod.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listPaymentMethods, addPaymentMethod, deletePaymentMethod };
