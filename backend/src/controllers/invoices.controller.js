const prisma = require('../config/prisma');

async function listInvoices(req, res, next) {
  try {
    const where = req.user.role === 'DISTRIBUTOR'
      ? { order: { items: { some: { medicine: { distributorId: req.user.id } } } } }
      : { order: { buyerId: req.user.id } };

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        order: {
          include: {
            items: { include: { medicine: true } },
            buyer: { select: { businessName: true } },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    res.json(invoices);
  } catch (err) {
    next(err);
  }
}

module.exports = { listInvoices };
