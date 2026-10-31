import { useEffect, useState } from 'react';
import { api } from '../api/axiosClient';
import ProductCard from '../components/product/ProductCard';
import { getErrorMessage } from '../utils/getErrorMessage';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/search/products', { params: { sort: 'newest' } })
      .then((res) => setProducts(res.data.data.items))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center text-slate-500">Products load ho rahe hain...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;
  if (products.length === 0) return <p className="text-center text-slate-500">Abhi koi product nahi hai.</p>;

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Latest Products</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
};

export default HomePage;