import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../store/AppContext';

/** Tempo de cada foto no slide automático (lento). */
const SLIDE_MS = 7000;

export function Hero() {
  const { campaign } = useApp();
  const reduceMotion = useReducedMotion();
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const images = campaign.heroImages.filter((src) => !failed.has(src));
  const count = images.length;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // `tick` reinicia o temporizador sempre que a pessoa navega manualmente.
  const [tick, setTick] = useState(0);
  const touchX = useRef<number | null>(null);

  const current = count ? index % count : 0;

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
      setIndex((i) => (((i + delta) % count) + count) % count);
      setTick((t) => t + 1);
    },
    [count],
  );

  // Slide automático lento (desligado se o dispositivo prefere movimento reduzido ou se está pausado).
  useEffect(() => {
    if (count < 2 || paused || reduceMotion) return;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [count, paused, reduceMotion, current, tick]);

  // Pausa quando a aba não está visível.
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Pré-carrega a próxima foto para a troca ficar suave.
  useEffect(() => {
    if (count < 2) return;
    const img = new Image();
    img.src = images[(current + 1) % count];
  }, [current, count, images]);

  const src = images[current];

  return (
    <section
      className="relative isolate overflow-hidden"
      aria-label="Carro em destaque"
      aria-roledescription="carrossel"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(-1);
        if (e.key === 'ArrowRight') go(1);
      }}
    >
      <div
        className="relative h-[68svh] min-h-[440px] w-full sm:h-[78vh] sm:max-h-[860px]"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {src ? (
          <AnimatePresence initial={false}>
            <motion.img
              key={src}
              src={src}
              alt={`${campaign.car.model} — foto ${current + 1} de ${count} (imagem provisória)`}
              className="absolute inset-0 h-full w-full object-cover object-center"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 1.2, ease: 'easeInOut' }, scale: { duration: SLIDE_MS / 1000 + 1.2, ease: 'linear' } }}
              onError={() => setFailed((f) => new Set(f).add(src))}
              loading="eager"
              decoding="async"
            />
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_at_center,rgb(31_111_255/0.35),transparent_65%)]">
            <p className="text-sm text-slate-400">Imagem do carro indisponível</p>
          </div>
        )}

        {/* Gradientes para legibilidade e transição para o fundo */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/10" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon/50 to-transparent" />

        {count > 1 && (
          <>
            {(['prev', 'next'] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => go(dir === 'prev' ? -1 : 1)}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                aria-label={dir === 'prev' ? 'Foto anterior' : 'Próxima foto'}
                className={`absolute top-[42%] z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-ink/50 text-white backdrop-blur-md transition hover:border-neon/60 hover:bg-ink/70 hover:text-neon active:scale-95 sm:h-12 sm:w-12 ${
                  dir === 'prev' ? 'left-3 sm:left-6' : 'right-3 sm:right-6'
                }`}
              >
                {dir === 'prev' ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
              </button>
            ))}
          </>
        )}

        <div className="container-page relative flex h-full flex-col justify-end pb-12 sm:pb-16">
          <div className="flex items-end justify-between gap-6">
            <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25, duration: 0.7 }}>
              <p className="eyebrow mb-3">{campaign.name}</p>
              {/* O modelo vem da configuração da campanha (editável pelo administrador). */}
              <h1 className="max-w-3xl text-3xl leading-none text-balance font-extrabold tracking-tight uppercase sm:text-4xl lg:text-5xl">
                <span className="text-gradient">{campaign.car.model}</span>
              </h1>
              <p className="mt-3 text-base font-medium text-slate-200 sm:text-lg">Concorra a um carro incrível!</p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => document.getElementById('pacotes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="btn-primary px-6 py-3.5 text-[15px]"
                >
                  Escolher meus números <ArrowDown size={17} />
                </button>
              </div>
            </motion.div>

            {count > 1 && (
              <div className="mb-3 flex shrink-0 items-center gap-2 max-sm:hidden" role="tablist" aria-label="Fotos">
                {images.map((img, i) => (
                  <button
                    key={img}
                    role="tab"
                    aria-selected={i === current}
                    aria-label={`Ver foto ${i + 1}`}
                    onClick={() => {
                      setIndex(i);
                      setTick((t) => t + 1);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? 'w-8 bg-neon' : 'w-3 bg-white/35 hover:bg-white/60'}`}
                  />
                ))}
              </div>
            )}
          </div>
          {count > 1 && (
            <p className="mt-4 font-mono text-xs text-slate-400 sm:hidden" aria-live="polite">
              {current + 1} / {count}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
