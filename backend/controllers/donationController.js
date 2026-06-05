import Donation from '../models/Donation.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getStripe } from '../config/stripe.js';
import Subscription from '../models/Subscription.js';

const stripeAmountMultiplier = (currency) => {
  // Stripe uses minor units. THB, USD, CAD are all 2-decimal currencies in Stripe.
  return 100;
};

const hasUsableStripeKey = () =>
  process.env.STRIPE_SECRET_KEY &&
  process.env.STRIPE_SECRET_KEY.startsWith('sk_') &&
  !process.env.STRIPE_SECRET_KEY.includes('replace');

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { amount, currency, donorName, donorEmail } = req.body;
  const normalizedCurrency = currency.toUpperCase();
  const amountInCents = Math.round(amount * stripeAmountMultiplier(normalizedCurrency));

  const minimums = { USD: 50, CAD: 50, THB: 2000 };
  if (amountInCents < minimums[normalizedCurrency]) {
    return res.status(400).json({ error: `Minimum amount not met for ${normalizedCurrency}.` });
  }

  const donation = await Donation.create({
    donorName,
    donorEmail,
    currency: normalizedCurrency,
    amount,
    amountInCents,
    status: 'pending',
    ipAddress: req.ip,
  });

  if (!hasUsableStripeKey()) {
    return res.status(503).json({
      error: 'Stripe is not configured yet.',
      donationId: donation._id,
    });
  }

  const stripe = getStripe();
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: normalizedCurrency.toLowerCase(),
            product_data: {
              name: 'Support BungJack Official',
              description: 'Independent media platform',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      customer_email: donorEmail || undefined,
      metadata: {
        donationId: donation._id.toString(),
        donorName: donorName || 'Anonymous',
      },
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donate/cancel`,
    });

    donation.stripeSessionId = session.id;
    await donation.save();

    return res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    return res.status(503).json({
      error: 'Stripe checkout is not available with the current configuration.',
      donationId: donation._id,
    });
  }
});

export const handleWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Stripe webhook secret is not configured.' });
  }

  const stripe = getStripe();
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).json({ error: `Webhook error: ${error.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await Donation.findOneAndUpdate(
      { stripeSessionId: session.id },
      { status: 'paid', stripePaymentId: session.payment_intent }
    );
    await Subscription.findOneAndUpdate(
      { stripeSessionId: session.id },
      { status: 'active', stripePaymentId: session.payment_intent, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    );
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    await Donation.findOneAndUpdate({ stripeSessionId: session.id }, { status: 'cancelled' });
    await Subscription.findOneAndUpdate({ stripeSessionId: session.id }, { status: 'cancelled' });
  }

  res.json({ received: true });
});

export const verifyDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findOne({ stripeSessionId: req.params.sessionId });
  if (!donation) return res.status(404).json({ error: 'Donation not found.' });
  res.json(donation);
});

export const getDonations = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const filters = {};
  if (req.query.status) filters.status = req.query.status;
  if (req.query.currency) filters.currency = req.query.currency;

  const [items, total] = await Promise.all([
    Donation.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Donation.countDocuments(filters),
  ]);

  res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
});
