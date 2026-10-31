import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wishlistApi } from '../api/wishlistApi';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { getErrorMessage } from '../utils/getErrorMessage';

const WishlistPage = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(
    () =>
      wishlistApi
        .list()
        .then(setProducts)
        .catch((err) => setError(getErrorMessage(err))),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleRemove = async (productId) => {
    setError('');
    try {
      await wishlistApi.remove(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleAddToCart = async (productId) => {
    setError('');
    setMessage('');
    try {
      await addToCart(productId, 1);
      setMessage('Cart mein add ho gaya.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (error && !products) return <p className="text-center text-red-600">{error}</p>;
  if (!products) return <p className="text-center text-slate-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Wishlist</h1>

      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {products.length === 0 ? (
        <p className="text-center text-slate-500">Aap ki wishlist khali hai.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <div
              key={p._id}
              className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200"
            >
              <img
                src={p.images?.[0] || 'https://placehold.co/400x300?text=No+Image'}
                alt={p.title}
                className="h-44 w-full object-cover"
              />
              <div className="space-y-3 p-4">
                <Link
                  to={`/products/${p._id}`}
                  className="block truncate font-semibold text-slate-800 hover:text-indigo-600"
                >
                  {p.title}
                </Link>
                <p className="font-bold text-indigo-600">{formatPrice(p.price)}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(p._id)}
                    disabled={p.stock === 0}
                    className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    Cart mein daalein
                  </button>
                  <button
                    onClick={() => handleRemove(p._id)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;