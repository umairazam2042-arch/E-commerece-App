// Ye file har test file se pehle chalti hai, app ke load hone se pehle.
// .env load nahi hota, is liye asli keys ya database use nahi honge.
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.JWT_ACCESS_EXPIRES = '15m';
process.env.JWT_REFRESH_EXPIRES = '7d';
process.env.CLIENT_URL = 'http://localhost:3000';

delete process.env.STRIPE_SECRET_KEY;
delete process.env.REDIS_URL;
delete process.env.SMTP_HOST;