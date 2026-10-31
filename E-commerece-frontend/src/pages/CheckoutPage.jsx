import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import { useCart } from '../context/CartContext';
import AddressForm, { ADDRESS_FIELDS, EMPTY_ADDRESS } from '../components/checkout/AddressForm';
import CouponBox from '../components/checkout/CouponBox';
import StripePaymentForm from '../components/checkout/StripePaymentForm';
import { formatPrice } from '../utils/formatPrice';
import { getErrorMessage } from '../utils/getErrorMessage';

const PAYMENT_OPTIONS = [
  { value: 'cod', label: 'Cash on Delivery (COD)' },
  { value: 'stripe', label: 'Card / Online payment (Stripe)' },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  // Stripe ke liye payment step: { order, clientSecret }
  const [pending, setPending] = useState(null);

  if (!cart && !pending) return <p className="text-center text-slate-500">Loading...</p>;

  const items = cart?.items?.filter((i) => i.product) ?? [];
  if (!pending && items.length === 0) return <Navigate to="/cart" replace />;

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const finishPayment = () => {
                 navigate('/order-placed', {
      replace: true,
      state: { orderNumber: pending.order.orderNumber, orderId: pending.order._id },
    });
    refreshCart();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const missing = ADDRESS_FIELDS.find((f) => !address[f.name].trim());
    if (missing) {
      setError(`${missing.label} zaroori hai.`);
      return;
    }

    setSubmitting(true);
    try {
      const { order, clientSecret } = await orderApi.checkout({
        shippingAddress: address,
        paymentMethod,
        ...(couponCode.trim() && { couponCode: couponCode.trim() }),
      });

      if (paymentMethod === 'stripe') {
        setPending({ order, clientSecret });
        setSubmitting(false);
        return;
      }

                navigate('/order-placed', {
        replace: true,
        state: { orderNumber: order.orderNumber, orderId: order._id },
      });
      refreshCart();
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  if (pending) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Payment</h1>
        <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Order {pending.order.orderNumber}</p>
          <p className="text-lg font-bold text-indigo-600">{formatPrice(pending.order.total)}</p>
        </div>
        <div className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
          <StripePaymentForm clientSecret={pending.clientSecret} onPaid={finishPayment} />
        </div>
        <Link
                    to="/order-placed"
        state={{ orderNumber: pending.order.orderNumber, orderId: pending.order._id }}
          onClick={() => refreshCart()}
          className="block text-center text-sm text-slate-500 underline"
        >
          Baad mein payment karein
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <h1 className="text-2xl font-bold text-slate-800">Checkout</h1>

        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <section className="space-y-3 rounded-xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="font-semibold text-slate-800">Shipping address</h2>
          <AddressForm value={address} onChange={setAddress} />
        </section>

        <section className="space-y-3 rounded-xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="font-semibold text-slate-800">Payment</h2>
          {PAYMENT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 text-sm">
              <input
                type="radio"
                name="payment"
                value={opt.value}
                checked={paymentMethod === opt.value}
                onChange={() => setPaymentMethod(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </section>
      </div>

      <aside className="h-fit space-y-4 rounded-xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="font-semibold text-slate-800">Order summary</h2>
        <ul className="space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.product._id} className="flex justify-between gap-2">
              <span className="truncate text-slate-600">
                {i.product.title} × {i.quantity}
              </span>
              <span>{formatPrice(i.product.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t pt-3 text-sm font-semibold">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <p className="text-xs text-slate-500">Shipping aur discount order place hone par final hogi.</p>

        <CouponBox value={couponCode} onChange={setCouponCode} />

        <button
          type="submit"
          disabled={submitting}
          className="btn-sheen w-full rounded-lg py-2.5 font-bold  disabled:opacity-50"
        >
          {submitting
            ? 'Order place ho raha hai...'
            : paymentMethod === 'stripe'
              ? 'Aage: payment'
              : 'Order place karein'}
        </button>
      </aside>
    </form>
  );
};

export default CheckoutPage;