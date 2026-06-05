import Stripe from 'stripe';

export const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is missing in environment variables.');
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
};
