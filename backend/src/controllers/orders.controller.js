const prisma = require('../config/prisma');

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

// Only pharmacy owners place orders. Runs inside a transaction so stock is
// checked and decremented atomically — two people can't both buy the last
// unit of something.
async function placeOrder(req, res, next) {
  try {
    const { items, addressId, paymentMethod } = req.body; // [{ medicineId, quantity }, ...]

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    if (!addressId) {
      return res.status(400).json({ error: 'Please select a delivery address before placing an order' });
    }

    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== req.user.id) {
      return res.status(400).json({ error: 'Delivery address not found' });
    }
    const deliveryAddress = `${address.line}, ${address.city}, ${address.state} - ${address.pincode}`;

    const validMethods = ['UPI', 'CARD', 'COD'];
    const method = validMethods.includes(paymentMethod) ? paymentMethod : 'COD';

    const order = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of items) {
        const medicine = await tx.medicine.findUnique({ where: { id: item.medicineId } });

        if (!medicine) {
          const err = new Error(`Medicine ${item.medicineId} no longer exists`);
          err.status = 404;
          throw err;
        }
        if (medicine.stock < item.quantity) {
          const err = new Error(`Not enough stock for ${medicine.name} (only ${medicine.stock} left)`);
          err.status = 409;
          throw err;
        }

        await tx.medicine.update({
          where: { id: medicine.id },
          data: { stock: medicine.stock - item.quantity },
        });

        totalAmount += Number(medicine.price) * item.quantity;
        orderItemsData.push({
          medicineId: medicine.id,
          quantity: item.quantity,
          priceAtOrder: medicine.price,
        });
      }

      return tx.order.create({
        data: {
          buyerId: req.user.id,
          totalAmount,
          paymentMethod: method,
          deliveryAddress,
          items: { create: orderItemsData },
        },
        include: { items: { include: { medicine: true } } },
      });
    });

    // Notify every distinct distributor involved in this order.
    const distributorIds = [...new Set(order.items.map(i => i.medicine.distributorId))];
    await prisma.notification.createMany({
      data: distributorIds.map(distributorId => ({
        userId: distributorId,
        message: `New order received — ${order.items.length} item(s), total ₹${Number(order.totalAmount).toFixed(2)}.`,
      })),
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

// Pharmacy owners see orders they placed; distributors see orders that
// include at least one of their own medicines.
async function listMyOrders(req, res, next) {
  try {
    const where = req.user.role === 'DISTRIBUTOR'
      ? { items: { some: { medicine: { distributorId: req.user.id } } } }
      : { buyerId: req.user.id };

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { medicine: true } },
        buyer: { select: { businessName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (err) {
    next(err);
  }
}

// Only distributors move an order through its lifecycle.
async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const order = await prisma.order.update({ where: { id }, data: { status } });

    // Notify the buyer their order status changed.
    await prisma.notification.create({
      data: {
        userId: order.buyerId,
        message: `Your order #${order.id.slice(0, 8)} is now ${status}.`,
      },
    });

    // The moment an order is delivered, generate its invoice automatically.
    if (status === 'DELIVERED') {
      const existingInvoice = await prisma.invoice.findUnique({ where: { orderId: order.id } });
      if (!existingInvoice) {
        await prisma.invoice.create({
          data: { orderId: order.id, amount: order.totalAmount },
        });
        await prisma.notification.create({
          data: {
            userId: order.buyerId,
            message: `Invoice generated for order #${order.id.slice(0, 8)} — ₹${Number(order.totalAmount).toFixed(2)}.`,
          },
        });
      }
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = { placeOrder, listMyOrders, updateOrderStatus };
