import { useMemo, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripe';

const PayForm = ({ onPaid }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setBusy(true);
    setError('');
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
           confirmParams: { return_url: `${window.location.origin}/order-placed` },
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message);
      setBusy(false);
      return;
    }
    onPaid(paymentIntent);
  };

  return (
    <form onSubmit={pay} className="space-y-4">
      <PaymentElement />
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy || !stripe}
        className="btn-sheen w-full rounded-lg py-2.5 text-sm font-bold text-white disabled:opacity-50"
      >
        {busy ? 'Payment ho rahi hai...' : 'Payment karein'}
      </button>
    </form>
  );
};

const StripePaymentForm = ({ clientSecret, onPaid }) => {
  const options = useMemo(() => ({ clientSecret }), [clientSecret]);

  if (!stripePromise) {
    return (
      <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
        Card payment abhi configure nahi hai. COD se order karein.
      </p>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PayForm onPaid={onPaid} />
    </Elements>
  );
};

export default StripePaymentForm;