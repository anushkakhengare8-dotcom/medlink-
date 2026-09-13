const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt');

const VALID_ROLES = ['PHARMACY_OWNER', 'DISTRIBUTOR'];

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    businessName: user.businessName,
  };
}

async function signup(req, res, next) {
  try {
    const { name, email, password, role, businessName, licenseNumber } = req.body;

    if (!name || !email || !password || !role || !businessName || !licenseNumber) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Role must be PHARMACY_OWNER or DISTRIBUTOR' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, businessName, licenseNumber },
    });

    const token = signToken({ id: user.id, role: user.role });
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({ id: user.id, role: user.role });
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login };
