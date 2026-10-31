import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRequireLogin } from '../../hooks/useRequireLogin';
import BuyNowModal from './BuyNowModal';

const BuyNowButton = ({ product, className = '' }) => {
  const { user } = useAuth();
  const requireLogin = useRequireLogin();
  const [open, setOpen] = useState(false);
  const outOfStock = product.stock <= 0;
     if (user && user.role !== 'customer') return null;

  const handleClick = (e) => {
    // Card agar link ho to product page par na chala jaye
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      requireLogin();
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={outOfStock}
        className={`btn-sheen rounded-full px-4 py-2 text-sm font-bold disabled:opacity-50 ${className}`}
      >
        {outOfStock ? 'Stock khatam' : 'Buy now'}
      </button>
      {open && <BuyNowModal product={product} onClose={() => setOpen(false)} />}
    </>
  );
};

export default BuyNowButton;