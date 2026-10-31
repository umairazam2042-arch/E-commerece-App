import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';

const CartItemRow = ({ item, busy, onQuantity, onRemove }) => {
  const product = item.product;
  const maxQty = Math.max(item.quantity, Math.min(10, product.stock ?? 10));

  return (
    <div className="flex gap-4 rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <img
        src={product.images?.[0] || 'https://placehold.co/120x120?text=No+Image'}
        alt={product.title}
        className="h-24 w-24 rounded-lg object-cover"
      />

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            to={`/products/${product._id}`}
            className="font-semibold text-slate-800 hover:text-indigo-600"
          >
            {product.title}
          </Link>
          <p className="text-sm text-slate-500">{formatPrice(product.price)} each</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={item.quantity}
            disabled={busy}
            onChange={(e) => onQuantity(Number(e.target.value))}
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
          >
            {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <button
            onClick={onRemove}
            disabled={busy}
            className="text-sm text-red-600 hover:underline disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>

      <p className="font-bold text-slate-800">{formatPrice(product.price * item.quantity)}</p>
    </div>
  );
};

export default CartItemRow;