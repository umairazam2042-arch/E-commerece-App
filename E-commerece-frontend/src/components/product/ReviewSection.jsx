import { useCallback, useEffect, useState } from 'react';
import { reviewApi } from '../../api/reviewApi';
import StarRating from '../common/StarRating';
import Pagination from '../common/Pagination';
import ReviewForm from './ReviewForm';
import { getErrorMessage } from '../../utils/getErrorMessage';

const ReviewSection = ({ productId }) => {
  const [data, setData] = useState(null);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    reviewApi
      .list(productId, { sort, page, limit: 5 })
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)));
  }, [productId, sort, page]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p className="text-slate-500">Reviews load ho rahe hain...</p>;

  const { summary, items, totalPages } = data;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">Reviews</h2>
        <StarRating value={summary.ratingAverage} />
        <span className="text-sm text-slate-500">({summary.ratingCount} reviews)</span>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="ml-auto rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="highest">Highest rating</option>
          <option value="lowest">Lowest rating</option>
        </select>
      </div>

      {items.length === 0 && <p className="text-slate-500">Abhi koi review nahi hai.</p>}

      <ul className="space-y-4">
        {items.map((r) => (
          <li key={r._id} className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">{r.user?.name || 'Customer'}</span>
              <StarRating value={r.rating} />
            </div>
            {r.title && <p className="mt-2 font-medium text-slate-800">{r.title}</p>}
            {r.comment && <p className="mt-1 text-sm text-slate-600">{r.comment}</p>}
            {r.vendorReply?.text && (
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
                <span className="font-semibold">Seller:</span> {r.vendorReply.text}
              </div>
            )}
          </li>
        ))}
      </ul>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <ReviewForm productId={productId} onCreated={load} />
    </section>
  );
};

export default ReviewSection;