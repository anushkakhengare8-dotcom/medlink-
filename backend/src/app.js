require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const medicineRoutes = require('./routes/medicines.routes');
const orderRoutes = require('./routes/orders.routes');
const addressRoutes = require('./routes/addresses.routes');
const notificationRoutes = require('./routes/notifications.routes');
const invoiceRoutes = require('./routes/invoices.routes');
const paymentMethodRoutes = require('./routes/paymentMethods.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Simple check to confirm the server is up — visit http://localhost:4000/api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/feedback', feedbackRoutes);

// Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
