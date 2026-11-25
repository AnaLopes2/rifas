import { memo, useMemo, useState, type FormEvent } from 'react';
import { CheckCircle2, Clock, Hash, LayoutGrid, Lock, Search, Timer } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { NUMBER_STATUS, type NumberFilter, type NumberStatusCode } from '../../types';
import { formatInt, pad3 } from '../../utils/format';
import { SectionHeading } from '../ui/SectionHeading';

const FILTERS: { key: NumberFilter; label: string; icon: typeof Hash; tone: string; dot: string }[] = [
  { key: 'all', label: 'Todos', icon: LayoutGrid, tone: 'text-neon', dot: 'bg-neon' },
  { key: 'available', label: 'Disponíveis', icon: CheckCircle2, tone: 'text-emerald-400', dot: 'bg-avail' },
  { key: 'reserved', label: 'Reservados', icon: Timer, tone: 'text-amber-400', dot: 'bg-reserved' },
  { key: 'paid', label: 'Pagos', icon: Lock, tone: 'text-paid', dot: 'bg-paid' },
];

const matches = (status: number, f: NumberFilter) =>
  f === 'all' ||
  (f === 'available' && status === NUMBER_STATUS.available) ||
  (f === 'reserved' && status === NUMBER_STATUS.reserved) ||
  (f === 'paid' && status === NUMBER_STATUS.paid);

interface CellProps {
  n: number;
  status: NumberStatusCode;
  selected: boolean;
  dimmed: boolean;
  highlight: boolean;
  onToggle: (n: number) => void;
}

const NumberCell = memo(function NumberCell({ n, status, selected, dimmed, highlight, onToggle }: CellProps) {
  let cls =
    'border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-300 hover:border-emerald-400/60 hover:bg-emerald-500/20';
  let label = 'disponível';
  if (status === NUMBER_STATUS.reserved) {
    cls = 'border-amber-500/30 bg-amber-500/10 text-amber-300/90 cursor-not-allowed';
    label = 'reservado';
  } else if (status === NUMBER_STATUS.paid) {
    cls = 'border-paid/20 bg-paid/[0.07] text-paid/70 cursor-not-allowed';
    label = 'pago';
  } else if (selected) {
    cls = 'border-neon bg-neon text-ink shadow-[0_0_18px_-2px_rgb(56_189_255/0.85)] font-bold';
    label = 'selecionado';
  } else if (dimmed) {
    cls = 'border-white/5 bg-white/[0.02] text-slate-500';
  }
  return (
    <button
      type="button"
      onClick={() => onToggle(n)}
      disabled={status !== NUMBER_STATUS.available}
      aria-pressed={selected}
      aria-label={`Número ${pad3(n)}, ${label}`}
      className={`h-11 rounded-lg border font-mono text-[15px] tabular-nums transition-[background-color,border-color,box-shadow,transform] duration-150 active:scale-95 sm:h-10 sm:text-sm ${cls} ${
        highlight ? 'ring-2 ring-white ring-offset-2 ring-offset-ink' : ''
      }`}
    >
      {pad3(n)}
    </button>
  );
});

export function NumberSection() {
  const { numbers, counts, packageSize, selected, toggleNumber, openModal, participant } = useApp();
  const [filter, setFilter] = useState<NumberFilter>('all');
  const [range, setRange] = useState(0);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState<number | null>(null);

  const total = numbers.length;
  const rangeCount = Math.ceil(total / 100);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const limitReached = !!packageSize && selected.length >= packageSize;

  const perRange = useMemo(() => {
    const arr = new Array<number>(rangeCount).fill(0);
    for (let i = 0; i < total; i++) if (matches(numbers[i], filter)) arr[Math.floor(i / 100)]++;
    return arr;
  }, [numbers, filter, rangeCount, total]);

  const visible = useMemo(() => {
    const out: number[] = [];
    const start = range * 100;
    const end = Math.min(total, start + 100);
    for (let i = start; i < end; i++) if (matches(numbers[i], filter)) out.push(i);
    return out;
  }, [numbers, filter, range, total]);

  const countFor = (f: NumberFilter) => (f === 'all' ? counts.all : counts[f]);

  const goTo = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(query);
    if (!query || Number.isNaN(n) || n < 0 || n >= total) return;
    setFilter('all');
    setRange(Math.floor(n / 100));
    setHighlight(n);
    window.setTimeout(() => setHighlight(null), 2200);
  };

  const pendingAction = () => (participant ? openModal('pending') : openModal('auth', { after: 'pending', mode: 'login' }));

  return (
    <section id="numeros" className="container-page scroll-mt-20 pt-16 sm:pt-20" aria-label="Escolha seus números">
      <SectionHeading title="Escolha seus números" subtitle={`${formatInt(total)} números, de ${pad3(0)} a ${pad3(total - 1)}.`} />

      {/* Filtros de status */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" role="tablist" aria-label="Filtrar números por status">
        {FILTERS.map(({ key, label, icon: Icon, tone }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(key)}
              className={`card flex items-center justify-between gap-3 px-4 py-3.5 text-left transition ${
                active ? 'card-glow bg-navy-800/90' : 'hover:border-white/15'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={18} className={tone} />
                <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">{label}</span>
              </span>
              <span className="font-display text-xl font-bold text-white tabular-nums">{formatInt(countFor(key))}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => openModal('titles')} className="btn-ghost py-2 text-[13px]">
          <Search size={15} /> Consultar meu número
        </button>
        <button onClick={pendingAction} className="btn-ghost py-2 text-[13px]">
          <Clock size={15} /> Pagamentos pendentes
        </button>
      </div>

      {/* Grade */}
      <div className="card mt-6 p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-[15px] text-slate-300" aria-live="polite">
            {packageSize ? (
              <>
                Você selecionou{' '}
                <strong className={`font-display text-lg ${limitReached ? 'text-neon' : 'text-white'}`}>{selected.length}</strong> de{' '}
                <strong className="font-display text-lg text-white">{packageSize}</strong> {packageSize === 1 ? 'número' : 'números'}.
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => document.getElementById('pacotes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="font-semibold text-neon underline-offset-4 hover:underline"
                >
                  Escolha um pacote
                </button>{' '}
                para começar a selecionar.
              </>
            )}
          </p>
          <form onSubmit={goTo} className="flex gap-2">
            <label htmlFor="goto" className="sr-only">Ir para o número</label>
            <input
              id="goto"
              inputMode="numeric"
              maxLength={3}
              placeholder="Ir para nº"
              value={query}
              onChange={(e) => setQuery(e.target.value.replace(/\D/g, ''))}
              className="input w-32 py-2"
            />
            <button className="btn-ghost py-2" aria-label="Localizar número">
              <Search size={16} />
            </button>
          </form>
        </div>

        {/* Intervalos */}
        <div className="scrollbar-thin -mx-4 mt-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Intervalos">
          {Array.from({ length: rangeCount }, (_, i) => {
            const active = i === range;
            return (
              <button
                key={i}
                role="tab"
                aria-selected={active}
                onClick={() => setRange(i)}
                className={`shrink-0 rounded-lg border px-3 py-2 font-mono text-xs tabular-nums transition ${
                  active ? 'border-neon/70 bg-neon/15 text-white' : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {pad3(i * 100)}–{pad3(Math.min(total - 1, i * 100 + 99))}
                <span className={`ml-1.5 ${active ? 'text-neon' : 'text-slate-600'}`}>{perRange[i]}</span>
              </button>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400">
          {[
            ['bg-avail', 'Disponível'],
            ['bg-reserved', 'Reservado'],
            ['bg-paid', 'Pago'],
            ['bg-neon', 'Selecionado'],
          ].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${c}`} /> {l}
            </span>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-5 gap-1.5 min-[420px]:grid-cols-6 sm:grid-cols-10 sm:gap-2">
          {visible.map((n) => (
            <NumberCell
              key={n}
              n={n}
              status={numbers[n] as NumberStatusCode}
              selected={selectedSet.has(n)}
              dimmed={limitReached && !selectedSet.has(n)}
              highlight={highlight === n}
              onToggle={toggleNumber}
            />
          ))}
        </div>
        {visible.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">
            Nenhum número {FILTERS.find((f) => f.key === filter)?.label.toLowerCase()} neste intervalo.
          </p>
        )}
      </div>
    </section>
  );
}
