const router = require('express').Router();
const rateLimit = require('express-rate-limit');

const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const { register, login, refresh, logout, me } = require('../controllers/authController');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later' },
});

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, me);

module.exports = router;