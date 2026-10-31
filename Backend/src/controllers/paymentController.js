const asyncHandler = require('../utils/asyncHandler');
const { constructWebhookEvent } = require('../config/stripe');
const paymentService = require('../services/paymentService');

const webhook = asyncHandler(async (req, res) => {
  let event;
  try {
    event = constructWebhookEvent(req.body, req.headers['stripe-signature']);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  await paymentService.handleWebhookEvent(event);
  res.json({ received: true });
});

module.exports = { webhook };