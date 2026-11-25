import { useState, type FormEvent } from 'react';
import { Ticket } from 'lucide-react';
import { startLogin, type ChallengeInfo } from '../../services/participantAuth';
import { useApp } from '../../store/AppContext';
import type { Participant, Reservation } from '../../types';
import { formatDateTime } from '../../utils/format';
import { isValidCPF, maskCPF, onlyDigits } from '../../utils/validation';
import { NumberChips, StatusBadge } from '../ui/StatusBadge';
import { OtpStep } from './OtpStep';

export function TitlesList({ items }: { items: Reservation[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-slate-400">
          <Ticket size={22} />
        </span>
        <p className="font-semibold text-white">Nenhum título encontrado para sua conta.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((r) => (
        <div key={r.id} className="rounded-xl border border-white/10 bg-navy-950/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-white">{r.campaignName}</p>
            <StatusBadge status={r.status} />
          </div>
          <div className="mt-3">
            <NumberChips numbers={r.numbers} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            <div><dt className="text-slate-500">Quantidade</dt><dd className="text-slate-200">{r.numbers.length}</dd></div>
            <div><dt className="text-slate-500">Data</dt><dd className="text-slate-200">{formatDateTime(r.createdAt)}</dd></div>
            <div><dt className="text-slate-500">Sorteio</dt><dd className="text-slate-200">Aguardando apuração</dd></div>
          </dl>
          {r.demo && <p className="mt-2 text-[11px] text-amber-300/80">Registro demonstrativo — nenhum pagamento real.</p>}
        </div>
      ))}
    </div>
  );
}

export function TitlesContent() {
  const { participant, reservations, setParticipant } = useApp();
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const [challenge, setChallenge] = useState<ChallengeInfo | null>(null);
  const [verified, setVerified] = useState<Participant | null>(null);

  const owner = verified;
  if (owner) {
    const mine = reservations.filter((r) => r.participantId === owner.id);
    return <TitlesList items={mine} />;
  }

  if (challenge) {
    return (
      <OtpStep
        info={challenge}
        onBack={() => setChallenge(null)}
        onResend={() => startLogin(cpf, 'email')}
        onVerified={(p) => {
          setParticipant(p);
          setVerified(p);
        }}
      />
    );
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValidCPF(cpf)) return setError('CPF inválido.');
    // Já autenticado com o mesmo CPF: não pedir o código novamente.
    if (participant && participant.cpf === onlyDigits(cpf)) return setVerified(participant);
    setChallenge(startLogin(cpf, 'email'));
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <p className="text-sm leading-relaxed text-slate-400">
        Para proteger seus dados, depois de informar o CPF você confirmará sua identidade com um código enviado ao contato cadastrado.
      </p>
      <div>
        <label htmlFor="titles-cpf" className="label">CPF</label>
        <input
          id="titles-cpf"
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(e) => {
            setCpf(maskCPF(e.target.value));
            setError('');
          }}
          className={`input ${error ? 'input-error' : ''}`}
        />
        {error && <p className="mt-1.5 text-[13px] text-red-300">{error}</p>}
      </div>
      <button className="btn-primary w-full py-3.5">Buscar</button>
    </form>
  );
}
