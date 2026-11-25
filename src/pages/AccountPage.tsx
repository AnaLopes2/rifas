import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, LogIn, Ticket, Trophy, UserRound } from 'lucide-react';
import { useApp } from '../store/AppContext';
import type { ReservationStatus } from '../types';
import { brl, formatDate, formatDateTime } from '../utils/format';
import { hideCPF } from '../utils/validation';
import { TitlesList } from '../components/modals/TitlesContent';
import { NumberChips, StatusBadge } from '../components/ui/StatusBadge';

const TABS = [
  { key: 'titulos', label: 'Meus títulos', icon: Ticket },
  { key: 'pagamentos', label: 'Meus pagamentos', icon: CreditCard },
  { key: 'dados', label: 'Meus dados', icon: UserRound },
  { key: 'resultados', label: 'Resultados', icon: Trophy },
] as const;
type TabKey = (typeof TABS)[number]['key'];

const PAY_FILTERS: { key: ReservationStatus[]; label: string }[] = [
  { key: ['pendente'], label: 'Pendentes' },
  { key: ['confirmada'], label: 'Confirmados' },
  { key: ['cancelada', 'expirada'], label: 'Cancelados' },
];

export function AccountPage() {
  const { participant, reservations, results, openModal } = useApp();
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find((t) => t.key === params.get('aba'))?.key ?? 'titulos') as TabKey;
  const [payFilter, setPayFilter] = useState(0);

  if (!participant) {
    return (
      <div className="container-page py-20">
        <div className="card mx-auto max-w-md p-8 text-center">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-neon/10 text-neon">
            <LogIn size={22} />
          </span>
          <h1 className="text-xl font-semibold">Minha conta</h1>
          <p className="mt-2 text-sm text-slate-400">Entre com seu CPF e um código de verificação para acessar sua área.</p>
          <button className="btn-primary mt-6 w-full" onClick={() => openModal('auth', { mode: 'login' })}>Entrar</button>
        </div>
      </div>
    );
  }

  const mine = reservations.filter((r) => r.participantId === participant.id);
  const payments = mine.filter((r) => PAY_FILTERS[payFilter].key.includes(r.status));

  return (
    <div className="container-page py-10 sm:py-14">
      <p className="eyebrow mb-2">Área do participante</p>
      <h1 className="text-3xl font-semibold tracking-tight">Olá, {participant.name.split(' ')[0]}</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="scrollbar-thin -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0" aria-label="Minha conta">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setParams({ aba: key })}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                tab === key ? 'bg-neon/10 text-white ring-1 ring-neon/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={17} className={tab === key ? 'text-neon' : ''} /> {label}
            </button>
          ))}
        </nav>

        <div className="card p-5 sm:p-6">
          {tab === 'titulos' && (
            <>
              <h2 className="mb-4 text-lg font-semibold">Meus títulos</h2>
              <TitlesList items={mine} />
            </>
          )}

          {tab === 'pagamentos' && (
            <>
              <h2 className="mb-4 text-lg font-semibold">Meus pagamentos</h2>
              <div className="mb-4 flex flex-wrap gap-2">
                {PAY_FILTERS.map((f, i) => (
                  <button
                    key={f.label}
                    onClick={() => setPayFilter(i)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition ${payFilter === i ? 'border-neon/60 bg-neon/10 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {payments.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">Nenhum pagamento nesta categoria.</p>
              ) : (
                <div className="space-y-3">
                  {payments.map((r) => (
                    <div key={r.id} className="rounded-xl border border-white/10 bg-navy-950/50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-white">{r.campaignName}</p>
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="mt-3"><NumberChips numbers={r.numbers} /></div>
                      <p className="mt-3 text-xs text-slate-400">
                        {r.numbers.length} números · {brl(r.total)} · {formatDateTime(r.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-4 text-xs text-amber-300/80">Pagamentos reais estão desativados. Itens listados são demonstrativos.</p>
            </>
          )}

          {tab === 'dados' && (
            <>
              <h2 className="mb-4 text-lg font-semibold">Meus dados</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                {[
                  ['Nome', participant.name],
                  ['E-mail', participant.email],
                  ['Celular', participant.phone],
                  ['Data de nascimento', formatDate(participant.birthDate)],
                  ['CPF', hideCPF(participant.cpf)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-white/5 bg-navy-950/40 p-4">
                    <dt className="text-xs tracking-wider text-slate-500 uppercase">{k}</dt>
                    <dd className="mt-1 text-white">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs text-slate-500">
                Para alterar seus dados ou exercer seus direitos previstos na LGPD, entre em contato pelo canal de suporte.
              </p>
            </>
          )}

          {tab === 'resultados' && (
            <>
              <h2 className="mb-4 text-lg font-semibold">Resultados</h2>
              {results.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">Ainda não há campanhas encerradas nem resultados publicados.</p>
              ) : (
                <ul className="space-y-2">
                  {results.map((r) => (
                    <li key={r.id} className="text-sm text-slate-300">{r.campaignName} — {formatDate(r.drawDate)}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
