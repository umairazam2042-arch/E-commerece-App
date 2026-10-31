import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { wishlistApi } from '../api/wishlistApi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useRequireLogin } from '../hooks/useRequireLogin';
import BuyNowButton from '../components/product/BuyNowButton';
import ImageCarousel from '../components/product/ImageCarousel';
import ReviewSection from '../components/product/ReviewSection';
import { formatPrice } from '../utils/formatPrice';
import { getErrorMessage } from '../utils/getErrorMessage';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const requireLogin = useRequireLogin();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Guest ko buttons dikhte hain (click par login), customer ko bhi. Vendor aur admin shopping nahi karte.
  const canShop = !user || user.role === 'customer';

  useEffect(() => {
    productApi.getById(id).then(setProduct).catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      requireLogin();
      return;
    }
    setError('');
    try {
      await addToCart(id, quantity);
      setMessage('Cart mein add ho gaya.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      requireLogin();
      return;
    }
    setError('');
    try {
      await wishlistApi.add(id);
      setMessage('Wishlist mein add ho gaya.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (!product) {
    return error ? (
      <p className="text-center text-red-600">{error}</p>
    ) : (
      <p className="text-center text-slate-500">Loading...</p>
    );
  }

  const outOfStock = product.stock === 0;
  const maxQty = Math.min(10, product.stock || 1);

  return (
    <div className="space-y-10">
      <div className="grid gap-8 md:grid-cols-2">
        <ImageCarousel
          images={product.images}
          alt={product.title}
          className="aspect-[4/3] w-full rounded-2xl shadow-lg"
        />

        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{product.title}</h1>
          <p className="text-2xl font-extrabold text-indigo-600">{formatPrice(product.price)}</p>
          <p className="text-slate-600">{product.description}</p>
          <p className={`text-sm font-semibold ${outOfStock ? 'text-red-600' : 'text-green-700'}`}>
            {outOfStock ? 'Out of stock' : `Stock mein ${product.stock} available`}
          </p>

          {canShop && (
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="number"
                min="1"
                max={maxQty}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(maxQty, Number(e.target.value))))}
                className="w-20 rounded-lg border border-slate-300 px-3 py-2"
              />
              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                Cart mein daalein
              </button>
              <BuyNowButton product={product} className="px-5 py-2" />
              <button
                onClick={handleWishlist}
                className="rounded-lg border border-slate-300 px-5 py-2 hover:bg-slate-100"
              >
                ♡ Wishlist
              </button>
            </div>
          )}

          {!user && (
            <p className="text-sm text-slate-500">
              Cart, wishlist aur buy ke liye pehle login karna zaroori hai.
            </p>
          )}
          {message && <p className="text-sm text-green-700">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      <ReviewSection productId={id} />
    </div>
  );
};

export default ProductDetailPage;