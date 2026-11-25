import { useCallback, type ReactNode } from 'react';
import { logAdminAction } from '../../services/adminApi';
import { useApp } from '../../store/AppContext';

export function Panel({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Stat({ label, value, hint, tone = 'text-white' }: { label: string; value: ReactNode; hint?: string; tone?: string }) {
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-xs tracking-wider text-slate-500 uppercase">{label}</p>
      <p className={`mt-2 font-display text-2xl font-bold tabular-nums ${tone}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  disabled,
  hint,
  textarea,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  disabled?: boolean;
  hint?: string;
  textarea?: boolean;
}) {
  const id = 'f-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {textarea ? (
        <textarea id={id} rows={3} className="input resize-y" value={value} disabled={disabled} onChange={(e) => onChange?.(e.target.value)} />
      ) : (
        <input id={id} type={type} className="input disabled:opacity-50" value={value} disabled={disabled} onChange={(e) => onChange?.(e.target.value)} />
      )}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty?: string | false }) {
  return (
    <div className="scrollbar-thin -mx-5 overflow-x-auto sm:mx-0">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs tracking-wider text-slate-500 uppercase">
            {head.map((h) => (
              <th key={h} className="px-5 py-3 font-medium sm:px-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">{children}</tbody>
      </table>
      {empty && <p className="py-10 text-center text-sm text-slate-400">{empty}</p>}
    </div>
  );
}

/** Ação administrativa demonstrativa: registra na auditoria do servidor e avisa que nada foi persistido. */
export function useDemoAction() {
  const { toast } = useApp();
  return useCallback(
    (action: string, details?: string, message = 'Modo demonstrativo: alteração não persistida. Requer backend com autenticação segura.') => {
      void logAdminAction(action, details);
      toast(message, 'warning');
    },
    [toast],
  );
}
