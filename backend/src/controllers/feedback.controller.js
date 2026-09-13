const prisma = require('../config/prisma');

async function submitFeedback(req, res, next) {
  try {
    const { rating, message } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const feedback = await prisma.feedback.create({
      data: { rating: Number(rating), message: (message || '').trim(), userId: req.user.id },
    });

    res.status(201).json(feedback);
  } catch (err) {
    next(err);
  }
}

async function listMyFeedback(req, res, next) {
  try {
    const feedback = await prisma.feedback.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(feedback);
  } catch (err) {
    next(err);
  }
}

module.exports = { submitFeedback, listMyFeedback };
