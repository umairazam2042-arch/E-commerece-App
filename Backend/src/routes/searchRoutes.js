const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const ctrl = require('../controllers/searchController');

// Suggest bahut zyada call hota hai (har keystroke par), is liye limit lagayi hai
const suggestLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/search/products', ctrl.search);
router.get('/search/suggest', suggestLimiter, ctrl.suggest);

module.exports = router;