import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import AddressForm, { ADDRESS_FIELDS, EMPTY_ADDRESS } from '../checkout/AddressForm';
import StripePaymentForm from '../checkout/StripePaymentForm';
import { formatPrice } from '../../utils/formatPrice';
import { getErrorMessage } from '../../utils/getErrorMessage';

const MAX_QTY = 20;
const stop = (e) => e.stopPropagation();

const PAYMENT_OPTIONS = [
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'stripe', label: 'Card (Stripe)' },
];

const BuyNowModal = ({ product, onClose }) => {
  const navigate = useNavigate();
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  // Stripe payment step: { order, clientSecret }
  const [pending, setPending] = useState(null);

  const maxQty = Math.min(product.stock, MAX_QTY);
  const changeQty = (n) => setQuantity(Math.max(1, Math.min(maxQty, n)));

  const goToOrder = (order) => {
    onClose();
       navigate('/order-placed', {
      replace: true,
      state: { orderNumber: order.orderNumber, orderId: order._id },
    });
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
      const { order, clientSecret } = await orderApi.buyNow({
        productId: product._id,
        quantity,
        paymentMethod,
        shippingAddress: address,
      });

      if (paymentMethod === 'stripe') {
        setPending({ order, clientSecret });
        setSubmitting(false);
        return;
      }
      goToOrder(order._id);
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => {
        stop(e);
        onClose();
      }}
    >
      <div
        onClick={stop}
        className="animate-reveal max-h-[90vh] w-full space-y-5 overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            {pending ? 'Payment' : 'Abhi buy karein'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Band karein"
            className="rounded-full px-2 py-1 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {pending ? (
          <>
            <p className="text-sm text-slate-600">
              Order {pending.order.orderNumber} · {formatPrice(pending.order.total)}
            </p>
            <StripePaymentForm
              clientSecret={pending.clientSecret}
              onPaid={() => goToOrder(pending.order)}
            />
            <button
              type="button"
              onClick={() => goToOrder(pending.order)}
              className="block w-full text-center text-sm text-slate-500 underline"
            >
              Baad mein payment karein
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-3">
              {product.images?.[0] && (
                <img src={product.images[0]} alt="" className="h-16 w-16 rounded-lg object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-800">{product.title}</p>
                <p className="text-sm text-indigo-600">{formatPrice(product.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeQty(quantity - 1)}
                  disabled={quantity <= 1}
                  className="h-8 w-8 rounded-full border border-slate-300 text-lg leading-none hover:bg-slate-100 disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => changeQty(quantity + 1)}
                  disabled={quantity >= maxQty}
                  className="h-8 w-8 rounded-full border border-slate-300 text-lg leading-none hover:bg-slate-100 disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            <section className="space-y-3">
              <h3 className="font-semibold text-slate-800">Shipping address</h3>
              <AddressForm value={address} onChange={setAddress} />
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-slate-800">Payment</h3>
              {PAYMENT_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 text-sm">
                  <input
                    type="radio"
                    name="buy-now-payment"
                    value={opt.value}
                    checked={paymentMethod === opt.value}
                    onChange={() => setPaymentMethod(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </section>

            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

            <div className="flex items-center justify-between gap-4 border-t pt-4">
              <div>
                <p className="text-xs text-slate-500">Total (shipping alag lag sakti hai)</p>
                <p className="text-lg font-bold text-indigo-600">
                  {formatPrice(product.price * quantity)}
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-sheen rounded-full px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                {submitting
                  ? 'Ruk jayein...'
                  : paymentMethod === 'stripe'
                    ? 'Aage: payment'
                    : 'Order place karein'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};

export default BuyNowModal;