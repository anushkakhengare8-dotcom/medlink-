const request = require('supertest');
const app = require('../src/app');

describe('GET /api/health', () => {
  it('returns a 200 status and ok message', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// Note: signup/login/medicines/orders tests need a real (or test) database
// connection to run, since they hit Prisma. Once DATABASE_URL is set in .env,
// more tests can be added here following this same pattern.
