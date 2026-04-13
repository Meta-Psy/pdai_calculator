import { useCallback, useRef } from 'react';

export default function ScoreButtons({ scores, value, onChange, disabled = false }) {
  const groupRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (disabled) return;
    const idx = scores.indexOf(value);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = scores[Math.min(idx + 1, scores.length - 1)];
      onChange(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = scores[Math.max(idx - 1, 0)];
      onChange(prev);
    } else {
      const num = parseInt(e.key);
      if (!isNaN(num) && scores.includes(num)) {
        e.preventDefault();
        onChange(num);
      }
    }
  }, [scores, value, onChange, disabled]);

  return (
    <div
      ref={groupRef}
      className={`flex gap-1.5 md:gap-1 justify-center items-center${disabled ? ' opacity-40' : ''}`}
      role="radiogroup"
      onKeyDown={handleKeyDown}
    >
      {scores.map(s => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          tabIndex={disabled ? -1 : (value === s ? 0 : -1)}
          disabled={disabled}
          onClick={() => onChange(s)}
          className={`min-w-[36px] min-h-[36px] md:min-w-[24px] md:min-h-[24px] px-2 md:px-1.5 py-2 md:py-1 text-xs rounded transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            disabled
              ? 'cursor-not-allowed bg-gray-100'
              : value === s
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
