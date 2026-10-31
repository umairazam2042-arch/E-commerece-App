import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItemRow from '../components/cart/CartItemRow';
import { formatPrice } from '../utils/formatPrice';
import { getErrorMessage } from '../utils/getErrorMessage';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  if (!cart) return <p className="text-center text-slate-500">Cart load ho raha hai...</p>;

  // Jo product delete ho chuka ho, use skip karein
  const items = cart.items?.filter((i) => i.product) ?? [];
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const run = async (key, action) => {
    setError('');
    setBusy(key);
    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">Aap ka cart khali hai.</p>
        <Link
          to="/products"
          className="mt-4 inline-block rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-500"
        >
          Shopping karein
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Shopping Cart</h1>
        <button
          onClick={() => run('clear', clearCart)}
          disabled={busy !== null}
          className="text-sm text-red-600 hover:underline disabled:opacity-50"
        >
          Cart khali karein
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <CartItemRow
              key={item.product._id}
              item={item}
              busy={busy === item.product._id}
              onQuantity={(qty) =>
                run(item.product._id, () => updateQuantity(item.product._id, qty))
              }
              onRemove={() => run(item.product._id, () => removeFromCart(item.product._id))}
            />
          ))}
        </div>

        <aside className="h-fit space-y-4 rounded-xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="font-semibold text-slate-800">Order summary</h2>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>
          <p className="text-xs text-slate-500">Final amount checkout par confirm hoga.</p>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-500"
          >
            Checkout karein
          </button>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;