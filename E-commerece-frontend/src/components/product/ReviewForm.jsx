import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { reviewApi } from '../../api/reviewApi';
import { getErrorMessage } from '../../utils/getErrorMessage';

const EMPTY_FORM = { rating: 5, title: '', comment: '' };

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none';

const ReviewForm = ({ productId, onCreated }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="rounded-xl bg-white p-5 text-sm text-slate-600 ring-1 ring-slate-200">
        Review dene ke liye{' '}
        <Link
          to="/login"
          state={{ from: location.pathname }}
          className="font-semibold text-indigo-600 hover:underline"
        >
          login karein
        </Link>
        .
      </div>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await reviewApi.create(productId, { ...form, rating: Number(form.rating) });
      setSuccess('Shukriya! Aap ka review save ho gaya.');
      setForm(EMPTY_FORM);
      onCreated();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl bg-white p-5 ring-1 ring-slate-200">
      <h3 className="font-semibold text-slate-800">Apna review likhein</h3>

      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      {success && <p className="rounded-lg bg-green-50 p-2 text-sm text-green-700">{success}</p>}

      <select name="rating" value={form.rating} onChange={handleChange} className={inputCls}>
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {n} star
          </option>
        ))}
      </select>
      <input
        name="title"
        placeholder="Title (optional)"
        value={form.title}
        onChange={handleChange}
        className={inputCls}
      />
      <textarea
        name="comment"
        rows={3}
        placeholder="Comment (optional)"
        value={form.comment}
        onChange={handleChange}
        className={inputCls}
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {submitting ? 'Submit ho raha hai...' : 'Review submit karein'}
      </button>
    </form>
  );
};

export default ReviewForm;