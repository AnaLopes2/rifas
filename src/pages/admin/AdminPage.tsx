import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Car,
  ClipboardList,
  Eye,
  Grid3x3,
  LayoutDashboard,
  Loader2,
  LogOut,
  Settings,
  Shield,
  Trophy,
  Users,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Logo } from '../../components/ui/Logo';
import { AdminLoginForm } from '../../components/modals/AuthModal';
import {
  CampaignsSection,
  DashboardSection,
  NumbersSection,
  ParticipantsSection,
  ReservationsSection,
  ResultsSection,
  SettingsSection,
} from './sections';

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, el: DashboardSection },
  { key: 'campanhas', label: 'Carro e campanhas', icon: Car, el: CampaignsSection },
  { key: 'numeros', label: 'Números e pacotes', icon: Grid3x3, el: NumbersSection },
  { key: 'participantes', label: 'Participantes', icon: Users, el: ParticipantsSection },
  { key: 'reservas', label: 'Reservas e pagamentos', icon: ClipboardList, el: ReservationsSection },
  { key: 'resultados', label: 'Resultados dos Sorteios', icon: Trophy, el: ResultsSection },
  { key: 'config', label: 'Configurações do site', icon: Settings, el: SettingsSection },
] as const;

export function AdminPage() {
  const { admin, refreshAdmin, logoutAdmin } = useApp();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [checking, setChecking] = useState(true);

  // A permissão é sempre revalidada no servidor ao abrir /admin — conhecer o endereço não basta.
  useEffect(() => {
    let alive = true;
    void refreshAdmin().finally(() => alive && setChecking(false));
    return () => {
      alive = false;
    };
  }, [refreshAdmin]);

  if (checking) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Loader2 className="animate-spin text-neon" size={28} aria-label="Verificando sessão" />
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="grid min-h-dvh place-items-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <Logo onClick={() => nav('/')} />
          </div>
          <div className="card relative overflow-hidden p-6 sm:p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon/60 to-transparent" />
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-neon/10 text-neon"><Shield size={20} /></span>
              <div>
                <h1 className="text-lg font-semibold">Área administrativa</h1>
                <p className="text-sm text-slate-400">Acesso restrito a administradores.</p>
              </div>
            </div>
            <AdminLoginForm />
          </div>
          <button onClick={() => nav('/')} className="mx-auto mt-5 block text-sm text-slate-400 hover:text-white">Voltar ao site</button>
        </div>
      </div>
    );
  }

  const current = NAV.find((n) => n.key === params.get('secao')) ?? NAV[0];
  const Section = current.el;

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[264px_1fr]">
      {/* Barra lateral (desktop) / navegação horizontal (celular) */}
      <aside className="sticky top-0 z-30 border-b border-white/[0.06] bg-navy-950/90 backdrop-blur-xl lg:h-dvh lg:border-r lg:border-b-0">
        <div className="flex h-16 items-center justify-between px-4 lg:px-5">
          <Logo onClick={() => nav('/')} />
          <span className="rounded-md border border-neon/30 bg-neon/10 px-2 py-0.5 text-[10px] font-bold tracking-widest text-neon uppercase">Admin</span>
        </div>
        <nav className="scrollbar-thin flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pt-3" aria-label="Painel administrativo">
          {NAV.map(({ key, label, icon: Icon }) => {
            const active = key === current.key;
            return (
              <button
                key={key}
                onClick={() => setParams({ secao: key })}
                aria-current={active ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  active ? 'bg-gradient-to-r from-electric/25 to-neon/10 text-white ring-1 ring-neon/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={17} className={active ? 'text-neon' : ''} /> {label}
              </button>
            );
          })}
        </nav>
        <div className="hidden px-3 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block lg:p-3">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-slate-400">
            <p className="font-semibold text-slate-200">{admin.username}</p>
            <p>Sessão expira {new Date(admin.expiresAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="mt-1 text-slate-500">MFA: preparado, não habilitado</p>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-4 sm:px-8">
          <div>
            <p className="eyebrow mb-1">Painel administrativo</p>
            <h1 className="text-2xl font-semibold">{current.label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-demo max-sm:hidden">Demonstrativo</span>
            <button onClick={() => nav('/')} className="btn-ghost py-2"><Eye size={16} /> Ver site</button>
            <button onClick={() => { void logoutAdmin(); nav('/'); }} className="btn-danger py-2"><LogOut size={16} /> Sair</button>
          </div>
        </header>
        <main className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-[13px] leading-relaxed text-amber-100/90">
            Visualização demonstrativa: nenhuma alteração é persistida e operações sensíveis estão bloqueadas até existir autenticação
            segura no backend. Pré-visualizações valem só para esta aba e ações ficam registradas no histórico de auditoria.
          </div>
          <Section />
        </main>
      </div>
    </div>
  );
}
