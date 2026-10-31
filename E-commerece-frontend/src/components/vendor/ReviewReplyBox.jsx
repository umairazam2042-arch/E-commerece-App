import { useState } from 'react';
import { vendorApi } from '../../api/vendorApi';
import { getErrorMessage } from '../../utils/getErrorMessage';

const ReviewReplyBox = ({ review, onReplied }) => {
  const [text, setText] = useState(review.vendorReply?.text ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    setError('');
    try {
      await vendorApi.replyToReview(review._id, text.trim());
      onReplied();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <textarea
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Reply likhein..."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={handleSave}
        disabled={saving || !text.trim()}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50"
      >
        {saving ? 'Save ho raha hai...' : 'Reply save karein'}
      </button>
    </div>
  );
};

export default ReviewReplyBox;