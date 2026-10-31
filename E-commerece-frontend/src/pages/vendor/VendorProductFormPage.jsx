import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import { reviewApi } from '../../api/reviewApi';
import { vendorApi } from '../../api/vendorApi';
import ProductForm, { EMPTY_FORM, toFormValues } from '../../components/vendor/ProductForm';
import ReviewReplyBox from '../../components/vendor/ReviewReplyBox';
import StarRating from '../../components/common/StarRating';
import { getErrorMessage } from '../../utils/getErrorMessage';

const VendorProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(() => {
    if (!id) return;
    reviewApi
      .list(id, { limit: 20 })
      .then((d) => setReviews(d.items ?? []))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    vendorApi.categories().then(setCategories).catch(() => {});
    if (isEdit) {
      productApi.getById(id).then(setProduct).catch((err) => setError(getErrorMessage(err)));
      loadReviews();
    }
  }, [id, isEdit, loadReviews]);

   const handleSubmit = async (payload) => {
    setError('');
    setSubmitting(true);
    const body = { ...payload, status: payload.status || 'published' };
    try {
      if (isEdit) await vendorApi.updateProduct(id, body);
      else await vendorApi.createProduct(body);
      navigate('/vendor/products');
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  if (isEdit && !product && !error) {
    return <p className="text-center text-slate-500">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">
        {isEdit ? 'Product edit karein' : 'Naya product'}
      </h1>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <ProductForm
        key={product?._id ?? 'new'}
        initial={product ? toFormValues(product) : EMPTY_FORM}
        categories={categories}
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      {isEdit && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Reviews</h2>
          {reviews.length === 0 && <p className="text-slate-500">Abhi koi review nahi hai.</p>}
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r._id} className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{r.user?.name || 'Customer'}</span>
                  <StarRating value={r.rating} />
                </div>
                {r.comment && <p className="mt-2 text-sm text-slate-600">{r.comment}</p>}
                <ReviewReplyBox review={r} onReplied={loadReviews} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default VendorProductFormPage;