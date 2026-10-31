import { useState } from 'react';
import { ACCEPT_IMAGES, MAX_IMAGE_MB, uploadImage } from '../../storage';

const MAX_IMAGES = 5;

const ImageUploader = ({ value = [], onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const full = value.length >= MAX_IMAGES;

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_IMAGES - value.length);
    e.target.value = '';
    if (files.length === 0) return;

    setError('');
    setUploading(true);
    const uploaded = [];
    try {
      for (const file of files) {
        uploaded.push(await uploadImage(file));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      // Jo images kamyab hui hain, wo zaroor rakhein
      if (uploaded.length) onChange([...value, ...uploaded]);
      setUploading(false);
    }
  };

  const remove = (url) => onChange(value.filter((u) => u !== url));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {value.map((url) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-slate-200">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(url)}
              aria-label="Image hatayein"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/70 text-xs text-white opacity-100 hover:bg-rose-600 sm:opacity-0 sm:group-hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}

        {!full && (
          <label
            className={`flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-sm text-slate-500 transition hover:border-indigo-500 hover:text-indigo-600 ${
              uploading ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            <span className="text-2xl leading-none">+</span>
            <span className="mt-1">{uploading ? 'Upload ho rahi hai...' : 'Image add karein'}</span>
            <input type="file" accept={ACCEPT_IMAGES} multiple onChange={handleFiles} className="hidden" />
          </label>
        )}
      </div>

      <p className="text-xs text-slate-500">
        {value.length}/{MAX_IMAGES} images · JPG, PNG ya WEBP · har image {MAX_IMAGE_MB} MB se chhoti
      </p>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default ImageUploader;