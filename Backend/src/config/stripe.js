const Stripe = require('stripe');
const AppError = require('../utils/AppError');

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const requireStripe = () => {
  if (!stripe) {
    throw new AppError('Online payment is not configured on this server', 503);
  }
  return stripe;
};

// amount smallest unit mein hona chahiye (paisa / cents)
const createPaymentIntent = ({ amount, currency, metadata }) =>
  requireStripe().paymentIntents.create({
    amount,
    currency: currency.toLowerCase(),
    automatic_payment_methods: { enabled: true },
    metadata,
  });

// amount na diya jaye to baqi (unrefunded) poori raqam wapas hoti hai
const refundPayment = (paymentIntentId, amount) =>
  requireStripe().refunds.create({
    payment_intent: paymentIntentId,
    ...(amount ? { amount } : {}),
  });

const constructWebhookEvent = (rawBody, signature) =>
  requireStripe().webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

module.exports = { createPaymentIntent, refundPayment, constructWebhookEvent };