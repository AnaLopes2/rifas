import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, ShieldCheck } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatDate, pad3 } from '../utils/format';

export function ResultPage() {
  const { id } = useParams();
  const result = useApp().results.find((r) => r.id === id);

  return (
    <div className="container-page py-10 sm:py-16">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
        <ArrowLeft size={15} /> Voltar ao início
      </Link>
      {!result ? (
        <div className="card mx-auto max-w-lg p-8 text-center">
          <h1 className="text-xl font-semibold">Resultado não encontrado</h1>
          <p className="mt-2 text-sm text-slate-400">Ainda não há resultados publicados.</p>
        </div>
      ) : (
        <article className="card overflow-hidden">
          <img src={result.prizeImage} alt={`Prêmio da ${result.campaignName}`} className="h-64 w-full object-cover sm:h-96" />
          <div className="space-y-4 p-6 sm:p-10">
            <p className="eyebrow">{result.campaignName}</p>
            <h1 className="text-4xl font-bold">Número sorteado: {pad3(result.winningNumber)}</h1>
            <p className="text-lg text-slate-200">{result.winnerPublicName}</p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><Calendar size={15} /> {formatDate(result.drawDate)}</span>
              {result.winnerState && <span className="flex items-center gap-1.5"><MapPin size={15} /> {result.winnerState}</span>}
            </div>
            <div className="rounded-xl border border-white/10 bg-navy-950/50 p-4">
              <h2 className="mb-2 flex items-center gap-2 text-base font-semibold"><ShieldCheck size={17} className="text-neon" /> Informações da apuração</h2>
              <p className="text-sm leading-relaxed text-slate-300">{result.verificationDetails}</p>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
