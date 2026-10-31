const request = require('supertest');
const app = require('../src/app');

describe('Health aur auth', () => {
  test('health check 200 deta hai', async () => {
    const res = await request(app).get('/api/v1/health').expect(200);
    expect(res.body.status).toBe('ok');
  });

  test('bina token ke protected route 401 deta hai', async () => {
    await request(app).get('/api/v1/auth/me').expect(401);
  });

  test('register aur login kaam karte hain', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Ali', email: 'ali@test.com', password: 'Password123' })
      .expect(201);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ali@test.com', password: 'Password123' })
      .expect(200);

    const token = res.body.data?.accessToken || res.body.accessToken;
    expect(token).toBeTruthy();
  });
});

describe('Search validation', () => {
  test('minPrice maxPrice se zyada ho to 400', async () => {
    await request(app)
      .get('/api/v1/search/products?minPrice=500000&maxPrice=100000')
      .expect(400);
  });

  test('suggest mein 2 harf se kam ho to 400', async () => {
    await request(app).get('/api/v1/search/suggest?q=s').expect(400);
  });

  test('search khali database par bhi 200 deta hai', async () => {
    const res = await request(app).get('/api/v1/search/products?q=shirt').expect(200);
    expect(res.body.data.total).toBe(0);
  });
});