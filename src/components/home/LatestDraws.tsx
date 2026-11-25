import { Link } from 'react-router-dom';
import { Calendar, MapPin, Trophy } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { formatDate, pad3 } from '../../utils/format';
import { SectionHeading } from '../ui/SectionHeading';

export function LatestDraws() {
  const results = [...useApp().results].sort((a, b) => Date.parse(b.drawDate) - Date.parse(a.drawDate)).slice(0, 3);

  return (
    <section className="container-page pt-20 sm:pt-24" aria-label="Últimos sorteios realizados">
      <SectionHeading title="Últimos sorteios realizados" subtitle="Conheça os resultados e vencedores das nossas campanhas." />

      {results.length === 0 ? (
        <div className="card relative mx-auto flex max-w-2xl flex-col items-center overflow-hidden px-6 py-12 text-center">
          <div className="pointer-events-none absolute -top-24 h-48 w-48 rounded-full bg-neon/20 blur-3xl" aria-hidden />
          <span className="relative mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-neon/30 bg-gradient-to-br from-electric/20 to-neon/10 text-neon shadow-[0_0_40px_-10px_rgb(56_189_255/0.8)]">
            <Trophy size={30} />
          </span>
          <h3 className="relative text-xl font-semibold">Ainda não realizamos nenhum sorteio</h3>
          <p className="relative mt-2 max-w-md text-sm text-slate-400">
            Estamos preparando nossa primeira campanha. Quando tivermos resultados, eles aparecerão aqui!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {results.map((r) => (
            <article key={r.id} className="card overflow-hidden">
              <img src={r.prizeImage} alt={`Prêmio da ${r.campaignName}`} className="h-44 w-full object-cover" loading="lazy" />
              <div className="space-y-2 p-5">
                <p className="eyebrow">{r.campaignName}</p>
                <p className="font-display text-3xl font-bold text-white">Nº {pad3(r.winningNumber)}</p>
                <p className="text-sm text-slate-300">{r.winnerPublicName}</p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Calendar size={13} /> {formatDate(r.drawDate)}</span>
                  {r.winnerState && <span className="flex items-center gap-1"><MapPin size={13} /> {r.winnerState}</span>}
                </div>
                <Link to={`/resultado/${r.id}`} className="btn-ghost mt-2 w-full">Ver resultado</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
