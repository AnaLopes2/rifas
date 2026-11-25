import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Shield, ShieldAlert } from 'lucide-react';
import { SITE } from '../../config/site';
import { adminLogin } from '../../services/adminApi';
import { startLogin, startRegistration, type Channel, type ChallengeInfo } from '../../services/participantAuth';
import { useApp, type AuthMode } from '../../store/AppContext';
import type { Participant } from '../../types';
import { ageFrom, isValidCPF, isValidEmail, isValidMobile, maskCPF, maskPhone, onlyDigits } from '../../utils/validation';
import { OtpStep } from './OtpStep';

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-[13px] text-red-300" id={`${id}-err`}>{error}</p>}
    </div>
  );
}

function ChannelPicker({ value, onChange }: { value: Channel; onChange: (c: Channel) => void }) {
  const opts: { v: Channel; label: string; icon: ReactNode }[] = [
    { v: 'email', label: 'E-mail', icon: <Mail size={16} /> },
    { v: 'sms', label: 'SMS', icon: <MessageSquare size={16} /> },
  ];
  return (
    <div>
      <p className="label">Receber código por</p>
      <div className="grid grid-cols-2 gap-2">
        {opts.map((o) => (
          <button
            type="button"
            key={o.v}
            onClick={() => onChange(o.v)}
            aria-pressed={value === o.v}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
              value === o.v ? 'border-neon/70 bg-neon/10 text-white' : 'border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {o.icon} {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const maxBirth = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - SITE.minAge);
  return d.toISOString().slice(0, 10);
};

function RegisterForm({ onChallenge, switchToLogin }: { onChallenge: (i: ChallengeInfo, resend: () => ChallengeInfo) => void; switchToLogin: () => void }) {
  const [f, setF] = useState({ name: '', birthDate: '', phone: '', phone2: '', cpf: '', email: '', accept: false });
  const [channel, setChannel] = useState<Channel>('email');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f, v: string | boolean) => {
    setF((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (f.name.trim().split(/\s+/).length < 2) e.name = 'Informe seu nome completo.';
    const age = ageFrom(f.birthDate);
    if (!f.birthDate || age < 0) e.birthDate = 'Informe sua data de nascimento.';
    else if (age < SITE.minAge) e.birthDate = `É necessário ter pelo menos ${SITE.minAge} anos.`;
    else if (age > 120) e.birthDate = 'Data de nascimento inválida.';
    if (!isValidMobile(f.phone)) e.phone = 'Informe um celular válido com DDD.';
    if (onlyDigits(f.phone) !== onlyDigits(f.phone2)) e.phone2 = 'Os números de celular não coincidem.';
    if (!isValidCPF(f.cpf)) e.cpf = 'CPF inválido.';
    if (!isValidEmail(f.email)) e.email = 'E-mail inválido.';
    if (!f.accept) e.accept = 'É necessário aceitar os termos para continuar.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const data: Omit<Participant, 'id' | 'createdAt'> = {
      name: f.name.trim(),
      birthDate: f.birthDate,
      phone: f.phone,
      cpf: f.cpf,
      email: f.email.trim().toLowerCase(),
    };
    const r = startRegistration(data, channel);
    if ('error' in r) return setErrors({ cpf: r.error });
    onChallenge(r, () => {
      const again = startRegistration(data, channel);
      return 'error' in again ? r : again;
    });
  };

  const err = (k: string) => (errors[k] ? 'input-error' : '');

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field id="name" label="Nome completo" error={errors.name}>
        <input id="name" autoComplete="name" className={`input ${err('name')}`} value={f.name} onChange={(e) => set('name', e.target.value)} />
      </Field>
      <Field id="birth" label="Data de nascimento" error={errors.birthDate}>
        <input id="birth" type="date" max={maxBirth()} min="1900-01-01" className={`input ${err('birthDate')}`} value={f.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="phone" label="Celular" error={errors.phone}>
          <input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+55 (11) 91234-5678" className={`input ${err('phone')}`} value={f.phone} onChange={(e) => set('phone', maskPhone(e.target.value))} />
        </Field>
        <Field id="phone2" label="Confirme seu celular" error={errors.phone2}>
          <input
            id="phone2"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            placeholder="+55 (11) 91234-5678"
            className={`input ${err('phone2')}`}
            value={f.phone2}
            onPaste={(e) => e.preventDefault()}
            onChange={(e) => set('phone2', maskPhone(e.target.value))}
          />
        </Field>
      </div>
      <Field id="cpf" label="CPF" error={errors.cpf}>
        <input id="cpf" inputMode="numeric" placeholder="000.000.000-00" className={`input ${err('cpf')}`} value={f.cpf} onChange={(e) => set('cpf', maskCPF(e.target.value))} />
      </Field>
      <Field id="email" label="E-mail" error={errors.email}>
        <input id="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" className={`input ${err('email')}`} value={f.email} onChange={(e) => set('email', e.target.value)} />
      </Field>
      <ChannelPicker value={channel} onChange={setChannel} />
      <div>
        <label className="flex items-start gap-3 text-sm text-slate-300">
          <input type="checkbox" checked={f.accept} onChange={(e) => set('accept', e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#38bdff]" />
          <span>
            Li e aceito os <Link to="/legal/termos" target="_blank" className="text-neon hover:underline">Termos de Uso</Link>, a{' '}
            <Link to="/legal/privacidade" target="_blank" className="text-neon hover:underline">Política de Privacidade</Link> e as{' '}
            <Link to="/legal/regras" target="_blank" className="text-neon hover:underline">Regras da Campanha</Link>.
          </span>
        </label>
        {errors.accept && <p className="mt-1.5 text-[13px] text-red-300">{errors.accept}</p>}
      </div>
      <button className="btn-primary w-full py-3.5">Receber código de verificação</button>
      <p className="text-center text-sm text-slate-400">
        Já tem cadastro?{' '}
        <button type="button" onClick={switchToLogin} className="font-semibold text-neon hover:underline">Entrar com código</button>
      </p>
    </form>
  );
}

function LoginForm({ onChallenge, switchToRegister }: { onChallenge: (i: ChallengeInfo, resend: () => ChallengeInfo) => void; switchToRegister: () => void }) {
  const [cpf, setCpf] = useState('');
  const [channel, setChannel] = useState<Channel>('email');
  const [error, setError] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValidCPF(cpf)) return setError('CPF inválido.');
    onChallenge(startLogin(cpf, channel), () => startLogin(cpf, channel));
  };
  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <p className="text-sm text-slate-400">Sem senha: enviaremos um código para o contato cadastrado.</p>
      <Field id="login-cpf" label="CPF" error={error}>
        <input id="login-cpf" inputMode="numeric" placeholder="000.000.000-00" className={`input ${error ? 'input-error' : ''}`} value={cpf} onChange={(e) => { setCpf(maskCPF(e.target.value)); setError(''); }} />
      </Field>
      <ChannelPicker value={channel} onChange={setChannel} />
      <button className="btn-primary w-full py-3.5">Receber código</button>
      <p className="text-center text-sm text-slate-400">
        Ainda não tem cadastro?{' '}
        <button type="button" onClick={switchToRegister} className="font-semibold text-neon hover:underline">Cadastre-se</button>
      </p>
    </form>
  );
}

export function AdminLoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { setAdmin, toast } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) return setError('Informe usuário e senha.');
    setLoading(true);
    setError('');
    const r = await adminLogin(username, password);
    setLoading(false);
    if (!r.ok) return setError(r.error);
    setPassword('');
    setAdmin(r.data);
    toast('Sessão administrativa iniciada.', 'success');
    onSuccess?.();
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="flex items-start gap-2.5 rounded-xl border border-signal/25 bg-signal/[0.06] px-3.5 py-3 text-[13px] leading-relaxed text-red-100/90">
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-signal" />
        <span>Acesso de teste, disponível apenas localmente. As funções administrativas são somente demonstrativas.</span>
      </div>
      <Field id="adm-user" label="Usuário">
        <input id="adm-user" autoComplete="username" className="input" value={username} onChange={(e) => { setUsername(e.target.value); setError(''); }} />
      </Field>
      <Field id="adm-pass" label="Senha">
        <input id="adm-pass" type="password" autoComplete="current-password" className="input" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} />
      </Field>
      {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
      <button className="btn-primary w-full py-3.5" disabled={loading}>
        <Shield size={17} /> {loading ? 'Verificando…' : 'Entrar como administrador'}
      </button>
    </form>
  );
}

export function AuthContent({ initialMode }: { initialMode: AuthMode }) {
  const { setParticipant, continueAfterAuth, closeModal, toast, authIntent } = useApp();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [challenge, setChallenge] = useState<{ info: ChallengeInfo; resend: () => ChallengeInfo } | null>(null);

  if (challenge) {
    return (
      <OtpStep
        isRegistration={mode === 'register'}
        info={challenge.info}
        onResend={challenge.resend}
        onBack={() => setChallenge(null)}
        onVerified={(p) => {
          setParticipant(p);
          toast(`Bem-vindo(a), ${p.name.split(' ')[0]}!`, 'success');
          continueAfterAuth();
        }}
      />
    );
  }

  const tabs: { m: AuthMode; label: string }[] = [
    { m: 'register', label: 'Cadastrar' },
    { m: 'login', label: 'Entrar' },
  ];

  return (
    <div className="space-y-5">
      {mode !== 'admin' && (
        <>
          {authIntent.after === 'checkout' && (
            <p className="rounded-xl border border-neon/20 bg-neon/5 px-3.5 py-2.5 text-sm text-sky-100">
              Identifique-se para continuar sua participação. Seus números selecionados serão mantidos.
            </p>
          )}
          <div className="grid grid-cols-2 rounded-xl border border-white/10 bg-navy-950/60 p-1">
            {tabs.map((t) => (
              <button
                key={t.m}
                onClick={() => setMode(t.m)}
                className={`rounded-lg py-2 text-sm font-semibold transition ${mode === t.m ? 'bg-navy-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </>
      )}
      {mode === 'register' && <RegisterForm onChallenge={(info, resend) => setChallenge({ info, resend })} switchToLogin={() => setMode('login')} />}
      {mode === 'login' && <LoginForm onChallenge={(info, resend) => setChallenge({ info, resend })} switchToRegister={() => setMode('register')} />}
      {mode === 'admin' && <AdminLoginForm onSuccess={closeModal} />}

      <div className="border-t border-white/5 pt-4 text-center">
        {mode === 'admin' ? (
          <button onClick={() => setMode('login')} className="text-sm text-slate-400 hover:text-white">Voltar ao acesso de participantes</button>
        ) : (
          <button onClick={() => setMode('admin')} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300">
            <Shield size={13} /> Acesso administrativo
          </button>
        )}
      </div>
    </div>
  );
}
