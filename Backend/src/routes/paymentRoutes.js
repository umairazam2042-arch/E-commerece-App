const router = require('express').Router();
const { webhook } = require('../controllers/paymentController');

// Stripe is route ko call karta hai. Login ki zaroorat nahi, signature check hota hai.
router.post('/webhook', webhook);

module.exports = router;