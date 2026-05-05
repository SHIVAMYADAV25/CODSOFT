const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

// @desc    Create Stripe payment intent
// @route   POST /api/payment/intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  const { amount, currency = 'usd' } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // convert to cents
    currency,
    metadata: { userId: req.user._id.toString() },
  });

  res.json({ clientSecret: paymentIntent.client_secret });
};

// @desc    Stripe webhook handler
// @route   POST /api/payment/webhook
// @access  Public (Stripe signed)
const webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
    // You can update order status here using paymentIntent.metadata.orderId
  }

  res.json({ received: true });
};

module.exports = { createPaymentIntent, webhook };
