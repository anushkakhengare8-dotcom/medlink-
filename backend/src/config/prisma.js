const { PrismaClient } = require('@prisma/client');

// A single shared Prisma client for the whole app, instead of creating a new
// connection pool in every file that needs the database.
const prisma = new PrismaClient();

module.exports = prisma;
