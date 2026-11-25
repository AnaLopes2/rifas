import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useApp } from '../../store/AppContext';

const tones = {
  info: { icon: Info, cls: 'border-neon/30 text-sky-100' },
  success: { icon: CheckCircle2, cls: 'border-emerald-400/30 text-emerald-100' },
  warning: { icon: AlertTriangle, cls: 'border-amber-400/30 text-amber-100' },
  error: { icon: XCircle, cls: 'border-signal/40 text-red-100' },
};

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => {
          const { icon: Icon, cls } = tones[t.tone];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border bg-navy-900/95 px-4 py-3 text-sm shadow-2xl backdrop-blur ${cls}`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <p className="flex-1 leading-snug">{t.message}</p>
              <button onClick={() => dismissToast(t.id)} className="text-slate-400 hover:text-white" aria-label="Fechar aviso">
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
