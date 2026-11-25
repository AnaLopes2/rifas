import type { ReservationStatus } from '../../types';

const map: Record<ReservationStatus, { label: string; cls: string }> = {
  pendente: { label: 'Pendente', cls: 'border-amber-400/30 bg-amber-400/10 text-amber-200' },
  confirmada: { label: 'Confirmado', cls: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' },
  expirada: { label: 'Expirado', cls: 'border-white/10 bg-white/5 text-slate-400' },
  cancelada: { label: 'Cancelado', cls: 'border-signal/30 bg-signal/10 text-red-200' },
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const { label, cls } = map[status];
  return <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}

export function NumberChips({ numbers, max = 30 }: { numbers: number[]; max?: number }) {
  const shown = numbers.slice(0, max);
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((n) => (
        <span key={n} className="rounded-md border border-white/10 bg-navy-950/70 px-2 py-0.5 font-mono text-xs text-slate-200">
          {String(n).padStart(3, '0')}
        </span>
      ))}
      {numbers.length > max && <span className="px-1 text-xs text-slate-500">+{numbers.length - max}</span>}
    </div>
  );
}
