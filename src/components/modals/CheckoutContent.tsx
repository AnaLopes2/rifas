import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Copy, CreditCard, Lock, QrCode, TimerOff } from 'lucide-react';
import { SITE } from '../../config/site';
import { useApp } from '../../store/AppContext';
import type { Reservation } from '../../types';
import { brl, formatCountdown, pad3 } from '../../utils/format';
import { DemoNotice } from '../ui/SectionHeading';
import { NumberChips } from '../ui/StatusBadge';

/** QR Code ilustrativo (não codifica nenhuma cobrança). */
function FakeQr({ seed }: { seed: string }) {
  const size = 25;
  const cells = useMemo(() => {
    let h = 2166136261;
    for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    const out: boolean[] = [];
    for (let i = 0; i < size * size; i++) {
      h ^= h << 13;
      h ^= h >>> 17;
      h ^= h << 5;
      out.push((h >>> 0) % 2 === 0);
    }
    return out;
  }, [seed]);
  const finder = (x: number, y: number) => {
    const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    for (const [ox, oy] of [[0, 0], [size - 7, 0], [0, size - 7]]) {
      if (inBox(ox, oy)) {
        const dx = x - ox, dy = y - oy;
        return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) ? 1 : 0;
      }
    }
    return -1;
  };
  return (
    <div className="relative mx-auto w-48 rounded-2xl bg-white p-3">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full opacity-30" shapeRendering="crispEdges" aria-hidden>
        {cells.map((on, i) => {
          const x = i % size, y = Math.floor(i / size);
          const f = finder(x, y);
          return (f === 1 || (f === -1 && on)) && <rect key={i} x={x} y={y} width={1} height={1} fill="#04060c" />;
        })}
      </svg>
      <span className="absolute inset-0 grid place-items-center">
        <span className="rounded-md bg-ink px-2.5 py-1 text-xs font-bold tracking-widest text-amber-300">DEMONSTRAÇÃO</span>
      </span>
    </div>
  );
}

type PixState = 'aguardando' | 'confirmado' | 'expirado';

function PaymentStep({ reservation }: { reservation: Reservation }) {
  const { toast } = useApp();
  const [method, setMethod] = useState<'pix' | 'card'>('pix');
  const [now, setNow] = useState(Date.now());
  const [preview, setPreview] = useState<PixState | null>(null);
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const remaining = Date.parse(reservation.expiresAt) - now;
  const realState: PixState = reservation.status === 'expirada' || remaining <= 0 ? 'expirado' : 'aguardando';
  const state = preview ?? realState;
  const pixCode = `DEMONSTRACAO-SEM-VALOR-NAO-PAGAR-${reservation.id.toUpperCase()}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      toast('Código copiado. Lembre-se: é apenas demonstrativo.', 'info');
    } catch {
      toast('Não foi possível copiar automaticamente.', 'warning');
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 rounded-xl border border-white/10 bg-navy-950/60 p-1">
        {[
          { k: 'pix' as const, label: 'Pix', icon: <QrCode size={16} /> },
          { k: 'card' as const, label: 'Cartão', icon: <CreditCard size={16} /> },
        ].map((m) => (
          <button
            key={m.k}
            onClick={() => setMethod(m.k)}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition ${method === m.k ? 'bg-navy-700 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {method === 'pix' ? (
        <div className="space-y-4">
          {state === 'aguardando' && (
            <div className="flex items-center justify-center gap-2 text-sm text-amber-200">
              <Clock size={16} /> Aguardando pagamento · expira em <span className="font-mono">{formatCountdown(remaining)}</span>
            </div>
          )}
          {state === 'confirmado' && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
              <CheckCircle2 size={16} /> Pagamento confirmado (pré-visualização do estado)
            </div>
          )}
          {state === 'expirado' && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
              <TimerOff size={16} /> Reserva expirada — os números foram liberados
            </div>
          )}
          <FakeQr seed={reservation.id} />
          <div>
            <p className="label">Pix copia e cola</p>
            <div className="flex gap-2">
              <input readOnly value={pixCode} className="input font-mono text-xs" aria-label="Código Pix demonstrativo" />
              <button onClick={copy} className="btn-ghost shrink-0" aria-label="Copiar código">
                <Copy size={16} /> <span className="max-sm:hidden">Copiar</span>
              </button>
            </div>
          </div>
          <div>
            <p className="label">Pré-visualizar estados da interface</p>
            <div className="grid grid-cols-3 gap-1.5">
              {(['aguardando', 'confirmado', 'expirado'] as PixState[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setPreview(s === realState ? null : s)}
                  className={`rounded-lg border px-2 py-1.5 text-xs capitalize transition ${state === s ? 'border-neon/60 bg-neon/10 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">
              Só altera a aparência. Uma confirmação real virá exclusivamente do provedor de pagamento via webhook assinado.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-3 rounded-2xl border border-dashed border-white/15 p-4" aria-disabled>
            {['Número do cartão', 'Nome do titular'].map((l) => (
              <div key={l}>
                <p className="label">{l}</p>
                <div className="input cursor-not-allowed text-slate-600 select-none">Campo seguro do processador</div>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              {['Validade', 'Código de segurança'].map((l) => (
                <div key={l}>
                  <p className="label">{l}</p>
                  <div className="input cursor-not-allowed text-slate-600 select-none">—</div>
                </div>
              ))}
            </div>
          </div>
          <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-400">
            <Lock size={14} className="mt-0.5 shrink-0 text-neon" />
            Estes campos serão fornecidos por um processador de pagamentos autorizado (campos hospedados). Dados de cartão nunca
            passarão nem serão armazenados no nosso servidor.
          </p>
          <button className="btn-primary w-full" disabled>Pagar com cartão — indisponível</button>
        </div>
      )}
      <DemoNotice>Pagamentos reais estão desativados. Nenhuma cobrança é gerada e nenhum valor deve ser transferido.</DemoNotice>
    </div>
  );
}

export function CheckoutContent() {
  const { campaign, selected, packageSize, participant, createReservation, reservations, activeReservationId, setActiveReservationId, toast } = useApp();
  const [error, setError] = useState('');
  const reservation = reservations.find((r) => r.id === activeReservationId) ?? null;

  const numbers = reservation ? reservation.numbers : selected;
  const total = reservation ? reservation.total : (packageSize ?? 0) * campaign.unitPrice;
  const ready = !!reservation || (!!packageSize && selected.length === packageSize);

  const reserve = () => {
    const r = createReservation();
    if (!r.ok) return setError(r.error);
    setActiveReservationId(r.reservation.id);
    toast(`Reserva demonstrativa criada: ${r.reservation.numbers.map(pad3).join(', ')}.`, 'success');
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-navy-950/50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">{campaign.name}</p>
            <p className="mt-1 font-display text-lg font-semibold text-white">{campaign.car.model}</p>
          </div>
          <img src={campaign.heroImages[0]} alt="" className="h-14 w-20 rounded-lg object-cover" />
        </div>
        <div className="mt-4">
          {numbers.length ? <NumberChips numbers={numbers} max={50} /> : <p className="text-sm text-slate-500">Nenhum número selecionado.</p>}
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-sm">
          <div><dt className="text-xs text-slate-500">Quantidade</dt><dd className="text-white">{numbers.length}</dd></div>
          <div><dt className="text-xs text-slate-500">Unitário</dt><dd className="text-white">{brl(reservation?.unitPrice ?? campaign.unitPrice)}</dd></div>
          <div><dt className="text-xs text-slate-500">Total</dt><dd className="font-display text-lg font-bold text-neon">{brl(total)}</dd></div>
        </dl>
        {participant && <p className="mt-3 text-xs text-slate-500">Participante: {participant.name}</p>}
      </div>

      {reservation ? (
        <PaymentStep reservation={reservation} />
      ) : (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-slate-400">
            Ao continuar, o servidor revalida preço e disponibilidade e reserva seus números por {SITE.reservationMinutes} minutos.
            Consulte também a{' '}
            <Link to="/legal/pagamentos" target="_blank" className="text-neon hover:underline">Política de Pagamentos e Reembolsos</Link> e as{' '}
            <Link to="/legal/regras" target="_blank" className="text-neon hover:underline">Regras da Campanha</Link>.
          </p>
          {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
          <button onClick={reserve} disabled={!ready} className="btn-primary w-full py-3.5">
            Reservar números (demonstração)
          </button>
          <DemoNotice>A reserva é apenas ilustrativa: fica nesta sessão, expira sozinha e não gera cobrança.</DemoNotice>
        </div>
      )}
    </div>
  );
}
