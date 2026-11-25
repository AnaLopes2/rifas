import { SITE } from '../../config/site';

export function Logo({ onClick, compact = false }: { onClick?: () => void; compact?: boolean }) {
  const [first, ...rest] = SITE.name.split(' ');
  return (
    <button onClick={onClick} className="group flex items-center gap-2.5" aria-label={`${SITE.name} — início`}>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl border border-neon/30 bg-navy-900 shadow-[0_0_20px_-4px_rgb(56_189_255/0.6)]">
        <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden>
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#38bdff" />
              <stop offset="1" stopColor="#1f6fff" />
            </linearGradient>
          </defs>
          <path d="M12 42c4-11 11-17 20-17s16 6 20 17" fill="none" stroke="url(#lg)" strokeWidth="6" strokeLinecap="round" />
          <circle cx="32" cy="42" r="6" fill="url(#lg)" />
        </svg>
      </span>
      {!compact && (
        <span className="font-display text-[17px] font-bold tracking-tight whitespace-nowrap text-white max-[420px]:hidden">
          {first} <span className="text-gradient">{rest.join(' ')}</span>
        </span>
      )}
    </button>
  );
}
