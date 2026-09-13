const { verifyToken } = require('../utils/jwt');

// Checks for a valid "Authorization: Bearer <token>" header on every
// protected route, and attaches the decoded user (id, role) to req.user.
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = header.split(' ')[1];
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Restricts a route to one account type, e.g. only distributors can add
// medicines, only pharmacy owners can place orders.
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Forbidden: this action requires a ${role} account` });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
