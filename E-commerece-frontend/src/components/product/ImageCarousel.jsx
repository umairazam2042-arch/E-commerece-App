import { useState } from 'react';

const PLACEHOLDER = 'https://placehold.co/400x300?text=No+Image';

// Parent jo size dega (className) wahi box ka size hoga, image ke size se nahi badlega
const ImageCarousel = ({ images = [], alt = '', className = '' }) => {
  const list = images.length ? images : [PLACEHOLDER];
  const count = list.length;
  const [index, setIndex] = useState(0);
  const current = Math.min(index, count - 1);

  // Click card ka link na chalaye, sirf image badle
  const go = (e, step) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + step + count) % count);
  };

  return (
    <div className={`group/carousel relative overflow-hidden bg-slate-100 ${className}`}>
      <img
        key={list[current]}
        src={list[current]}
        alt={alt}
        loading="lazy"
        className="animate-reveal h-full w-full object-cover"
      />

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => go(e, -1)}
            aria-label="Pichli image"
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-lg text-slate-800 shadow transition hover:bg-white sm:opacity-0 sm:group-hover/carousel:opacity-100"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => go(e, 1)}
            aria-label="Agli image"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-lg text-slate-800 shadow transition hover:bg-white sm:opacity-0 sm:group-hover/carousel:opacity-100"
          >
            ›
          </button>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {list.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full bg-white shadow transition-all duration-300 ${
                  i === current ? 'w-4' : 'w-1.5 opacity-60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;