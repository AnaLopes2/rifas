import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Trash2, X } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { brl, pad3 } from '../../utils/format';

export function SelectionSummary() {
  const { campaign, packageSize, selected, toggleNumber, clearSelection, participant, openModal } = useApp();
  const ready = !!packageSize && selected.length === packageSize;
  const missing = packageSize ? packageSize - selected.length : 0;

  const proceed = () => {
    if (!ready) return;
    if (participant) openModal('checkout');
    else openModal('auth', { after: 'checkout' });
  };

  return (
    <section className="container-page pt-6" aria-label="Seus números">
      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Seus números</h2>
          {selected.length > 0 && (
            <button onClick={clearSelection} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
              <Trash2 size={15} /> Limpar seleção
            </button>
          )}
        </div>

        <div className="mt-4 flex min-h-12 flex-wrap gap-2">
          <AnimatePresence initial={false}>
            {selected.map((n) => (
              <motion.button
                key={n}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => toggleNumber(n)}
                className="group inline-flex items-center gap-1.5 rounded-lg border border-neon/50 bg-neon/10 px-3 py-1.5 font-mono text-sm font-semibold text-sky-100"
                aria-label={`Remover número ${pad3(n)}`}
              >
                {pad3(n)}
                <X size={13} className="text-neon/70 group-hover:text-white" />
              </motion.button>
            ))}
          </AnimatePresence>
          {selected.length === 0 && (
            <p className="self-center text-sm text-slate-500">
              {packageSize ? 'Toque nos números disponíveis na grade para selecioná-los.' : 'Escolha um pacote e selecione seus números.'}
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-4 border-t border-white/5 pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-slate-500">Pacote</dt>
              <dd className="font-medium text-white">{packageSize ? `${packageSize} ${packageSize === 1 ? 'número' : 'números'}` : '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Escolhidos</dt>
              <dd className="font-medium text-white">
                {selected.length}
                {packageSize ? ` de ${packageSize}` : ''}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Preço unitário</dt>
              <dd className="font-medium text-white">{brl(campaign.unitPrice)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Total</dt>
              <dd className="font-display text-xl font-bold text-neon">{brl((packageSize ?? 0) * campaign.unitPrice)}</dd>
            </div>
          </dl>
          <div className="flex flex-col items-stretch gap-1.5 sm:items-end">
            <button onClick={proceed} disabled={!ready} className="btn-primary px-8 py-3.5 text-[15px] tracking-wide">
              CONTINUAR <ArrowRight size={17} />
            </button>
            {packageSize && !ready && (
              <p className="text-center text-xs text-slate-500 sm:text-right">
                Falta{missing > 1 ? 'm' : ''} {missing} {missing === 1 ? 'número' : 'números'}.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
