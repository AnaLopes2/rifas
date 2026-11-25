import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { SITE } from '../../config/site';
import { verifyChallenge, type ChallengeInfo } from '../../services/participantAuth';
import type { Participant } from '../../types';
import { formatCountdown } from '../../utils/format';
import { DemoNotice } from '../ui/SectionHeading';

interface Props {
  info: ChallengeInfo;
  onVerified: (p: Participant) => void;
  onResend: () => ChallengeInfo;
  onBack: () => void;
  missingHint?: string;
  isRegistration?: boolean;
}

export function OtpStep({ info: initial, onVerified, onResend, onBack, missingHint, isRegistration }: Props) {
  const [info, setInfo] = useState(initial);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [cooldownUntil, setCooldownUntil] = useState(Date.now() + SITE.otp.resendCooldownSeconds * 1000);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const expired = now > info.expiresAt;
  const cooldown = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (code.length !== SITE.otp.length) return setError(`Digite os ${SITE.otp.length} dígitos.`);
    const r = verifyChallenge(info.challengeId, code);
    if (r.ok) return onVerified(r.participant);
    setError(r.error);
    if (r.remaining <= 0) setLocked(true);
  };

  const resend = () => {
    setInfo(onResend());
    setCode('');
    setError(null);
    setLocked(false);
    setCooldownUntil(Date.now() + SITE.otp.resendCooldownSeconds * 1000);
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
        <ArrowLeft size={15} /> Voltar
      </button>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neon/10 text-neon">
          <KeyRound size={19} />
        </span>
        <p className="text-sm leading-relaxed text-slate-300">
          {isRegistration ? 'Enviamos' : 'Se houver um cadastro correspondente, enviamos'} um código de {SITE.otp.length} dígitos para{' '}
          <strong className="text-white">{info.sentTo}</strong>.
          {!expired && <> Ele expira em <span className="font-mono text-neon">{formatCountdown(info.expiresAt - now)}</span>.</>}
        </p>
      </div>

      <DemoNotice>
        Nenhum e-mail ou SMS é enviado no protótipo.{' '}
        {info.demoCode ? (
          <>Use o código <strong className="font-mono tracking-widest text-white">{info.demoCode}</strong>.</>
        ) : (
          missingHint ?? 'Nenhum cadastro de demonstração corresponde a esses dados nesta sessão.'
        )}
      </DemoNotice>

      <div>
        <label htmlFor="otp" className="label">Código de verificação</label>
        <input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={SITE.otp.length}
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, ''));
            setError(null);
          }}
          className={`input text-center font-mono text-2xl tracking-[0.5em] ${error ? 'input-error' : ''}`}
          placeholder="••••••"
          disabled={expired || locked}
        />
        {error && <p className="mt-1.5 text-sm text-red-300">{error}</p>}
        {expired && <p className="mt-1.5 text-sm text-amber-300">Código expirado. Solicite um novo.</p>}
      </div>

      <button className="btn-primary w-full py-3.5" disabled={expired || locked || code.length !== SITE.otp.length}>
        Confirmar código
      </button>
      <button type="button" onClick={resend} disabled={cooldown > 0} className="w-full text-sm text-slate-400 hover:text-white disabled:opacity-50">
        {cooldown > 0 ? `Reenviar código em ${cooldown}s` : 'Reenviar código'}
      </button>
    </form>
  );
}
