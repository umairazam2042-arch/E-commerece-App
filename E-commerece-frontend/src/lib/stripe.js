import { loadStripe } from '@stripe/stripe-js';

const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Key na ho to card payment band rahe, app crash na ho
export const stripePromise = key ? loadStripe(key) : null;