import { useEffect, useState } from 'react';
import { Clock, CreditCard, XCircle } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { brl, formatCountdown, formatDateTime } from '../../utils/format';
import { DemoNotice } from '../ui/SectionHeading';
import { NumberChips, StatusBadge } from '../ui/StatusBadge';

export function PendingList() {
  const { participant, reservations, cancelReservation, setActiveReservationId, openModal } = useApp();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  if (!participant) return null;
  const mine = reservations.filter((r) => r.participantId === participant.id && r.status === 'pendente');

  if (mine.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-slate-400">
          <Clock size={22} />
        </span>
        <p className="font-semibold text-white">Você não tem pagamentos pendentes.</p>
        <p className="mt-1 text-sm text-slate-400">Reservas aguardando pagamento aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {mine.map((r) => (
        <div key={r.id} className="rounded-xl border border-white/10 bg-navy-950/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-white">{r.campaignName}</p>
            <StatusBadge status={r.status} />
          </div>
          <div className="mt-3">
            <NumberChips numbers={r.numbers} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <div><dt className="text-slate-500">Quantidade</dt><dd className="text-slate-200">{r.numbers.length}</dd></div>
            <div><dt className="text-slate-500">Total</dt><dd className="font-semibold text-neon">{brl(r.total)}</dd></div>
            <div><dt className="text-slate-500">Criado em</dt><dd className="text-slate-200">{formatDateTime(r.createdAt)}</dd></div>
            <div><dt className="text-slate-500">Expira em</dt><dd className="font-mono text-amber-300">{formatCountdown(Date.parse(r.expiresAt) - now)}</dd></div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="btn-primary py-2"
              onClick={() => {
                setActiveReservationId(r.id);
                openModal('checkout');
              }}
            >
              <CreditCard size={16} /> Ver pagamento
            </button>
            <button className="btn-danger py-2" onClick={() => cancelReservation(r.id)}>
              <XCircle size={16} /> Cancelar reserva
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PendingContent() {
  return (
    <div className="space-y-4">
      <DemoNotice>Área demonstrativa. As reservas listadas existem só nesta sessão e expiram automaticamente.</DemoNotice>
      <PendingList />
    </div>
  );
}
