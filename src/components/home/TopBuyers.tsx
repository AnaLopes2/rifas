import { Medal } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { formatInt } from '../../utils/format';
import { SectionHeading } from '../ui/SectionHeading';

const medal = [
  'from-amber-300 to-yellow-600 text-amber-950 shadow-[0_0_24px_-6px_rgb(251_191_36/0.8)]',
  'from-slate-200 to-slate-400 text-slate-900',
  'from-orange-300 to-amber-800 text-orange-950',
  'from-navy-700 to-navy-800 text-slate-300',
  'from-navy-700 to-navy-800 text-slate-300',
];

export function TopBuyers() {
  // Ranking vem do backend: somente participações com pagamento CONFIRMADO, já ordenado e com nomes mascarados.
  const ranking = [...useApp().topBuyers].sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  // Sem compradores confirmados, a seção fica oculta. Ela reaparece automaticamente quando o ranking tiver dados.
  if (ranking.length === 0) return null;

  return (
    <section className="container-page pt-16 sm:pt-20" aria-label="Maiores compradores">
      <SectionHeading title="Maiores compradores" />
      <div className="scrollbar-thin -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
          {ranking.map((b, i) => (
            <div key={b.position} className="card flex min-w-[210px] snap-start items-center gap-3 p-4">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br ${medal[i]} font-bold`}>
                {i < 3 ? <Medal size={20} /> : `${i + 1}º`}
              </span>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">{i + 1}º lugar</p>
                <p className="truncate font-semibold text-white">{b.displayName}</p>
                <p className="text-sm text-neon">{formatInt(b.quantity)} números</p>
              </div>
            </div>
          ))}
        </div>
    </section>
  );
}
