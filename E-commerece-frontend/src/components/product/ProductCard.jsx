import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';
import StarRating from '../common/StarRating';
import BuyNowButton from './BuyNowButton';
import ImageCarousel from './ImageCarousel';

const ProductCard = ({ product }) => (
  <div className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
    <Link to={`/products/${product._id}`} className="block flex-1">
      <div className="relative h-52">
        <ImageCarousel images={product.images} alt={product.title} className="h-full w-full" />
        {product.stock === 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="p-4 pb-2">
        <h3 className="truncate font-semibold text-slate-800 transition group-hover:text-indigo-600">
          {product.title}
        </h3>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-indigo-600">{formatPrice(product.price)}</span>
          <StarRating value={product.ratingAverage} />
        </div>
      </div>
    </Link>

    <div className="px-4 pb-4 pt-2">
      <BuyNowButton product={product} className="w-full" />
    </div>
  </div>
);

export default ProductCard;