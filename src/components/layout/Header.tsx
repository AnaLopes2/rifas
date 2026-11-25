import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Clock, Eye, HelpCircle, LifeBuoy, Home, LayoutDashboard, LogOut, Menu, Search, Shield, Ticket, User, X } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Logo } from '../ui/Logo';
import { Dropdown, MenuItem } from '../ui/Dropdown';

function AdminMenu() {
  const { logoutAdmin } = useApp();
  const nav = useNavigate();
  return (
    <Dropdown
      trigger={({ open, toggle }) => (
        <button
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          className="inline-flex items-center gap-2 rounded-xl border border-neon/40 bg-neon/10 px-3 py-2 text-sm font-semibold text-sky-100 shadow-[0_0_24px_-8px_rgb(56_189_255/0.8)] transition hover:bg-neon/15"
        >
          <Shield size={17} className="text-neon" />
          Admin
          <ChevronDown size={15} className={`transition ${open ? 'rotate-180' : ''}`} />
        </button>
      )}
    >
      {(close) => (
        <>
          <MenuItem icon={<LayoutDashboard size={17} />} onClick={() => { close(); nav('/admin'); }}>
            Painel administrativo
          </MenuItem>
          <MenuItem icon={<Eye size={17} />} onClick={() => { close(); nav('/'); }}>
            Ver site
          </MenuItem>
          <div className="my-1 h-px bg-white/5" />
          <MenuItem icon={<LogOut size={17} />} tone="danger" onClick={() => { close(); void logoutAdmin(); nav('/'); }}>
            Sair
          </MenuItem>
        </>
      )}
    </Dropdown>
  );
}

function ParticipantMenu() {
  const { participant, logoutParticipant, openModal } = useApp();
  const nav = useNavigate();
  if (!participant) return null;
  const initials = participant.name.split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  return (
    <Dropdown
      trigger={({ open, toggle }) => (
        <button
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Minha conta"
          className="grid h-10 w-10 place-items-center rounded-full border border-neon/40 bg-gradient-to-br from-electric/40 to-neon/20 text-sm font-bold text-white"
        >
          {initials || <User size={18} />}
        </button>
      )}
    >
      {(close) => (
        <>
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-white">{participant.name}</p>
            <p className="truncate text-xs text-slate-400">{participant.email}</p>
          </div>
          <div className="my-1 h-px bg-white/5" />
          <MenuItem icon={<User size={17} />} onClick={() => { close(); nav('/conta'); }}>Minha conta</MenuItem>
          <MenuItem icon={<Ticket size={17} />} onClick={() => { close(); nav('/conta?aba=titulos'); }}>Meus títulos</MenuItem>
          <MenuItem icon={<Clock size={17} />} onClick={() => { close(); openModal('pending'); }}>Pagamentos pendentes</MenuItem>
          <div className="my-1 h-px bg-white/5" />
          <MenuItem icon={<LogOut size={17} />} tone="danger" onClick={() => { close(); logoutParticipant(); }}>Sair</MenuItem>
        </>
      )}
    </Dropdown>
  );
}

function AuthSlot() {
  const { admin, participant, openModal } = useApp();
  if (admin) return <AdminMenu />;
  if (participant) return <ParticipantMenu />;
  return (
    <button onClick={() => openModal('auth')} className="btn-primary px-3.5 py-2 sm:px-4">
      <User size={16} className="hidden sm:block" />
      Entrar <span className="hidden sm:inline">/ Cadastrar</span>
    </button>
  );
}

export function Header() {
  const { openModal } = useApp();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const goHome = () => {
    setMobileOpen(false);
    if (pathname !== '/') nav('/');
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navBtn = 'rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white';

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink/70 backdrop-blur-xl">
      <div className="container-page relative flex h-16 items-center justify-between gap-3">
        <Logo onClick={goHome} />

        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex" aria-label="Principal">
          <button className={navBtn} onClick={goHome}>Início</button>
          <button className={navBtn} onClick={() => openModal('how')}>Como funciona</button>
          {/* Abre a página de contato; os demais documentos ficam nas abas laterais dessa página. */}
          <button className={navBtn} onClick={() => nav('/legal/contato')}>Contato e Suporte</button>
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={() => openModal('titles')} className="btn-ghost hidden px-3.5 py-2 xl:inline-flex">
            <Search size={16} /> Buscar meus títulos
          </button>
          <button
            onClick={() => openModal('titles')}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-300 hover:text-white xl:hidden"
            aria-label="Buscar meus títulos"
          >
            <Search size={18} />
          </button>
          <AuthSlot />
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-300 md:hidden"
            aria-label="Abrir menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5 md:hidden"
            aria-label="Menu móvel"
          >
            <div className="container-page grid gap-1 py-3">
              <button className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-slate-200 hover:bg-white/5" onClick={goHome}>
                <Home size={18} className="text-neon" /> Início
              </button>
              <button
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-slate-200 hover:bg-white/5"
                onClick={() => { setMobileOpen(false); openModal('how'); }}
              >
                <HelpCircle size={18} className="text-neon" /> Como funciona
              </button>
              <button
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-slate-200 hover:bg-white/5"
                onClick={() => { setMobileOpen(false); openModal('titles'); }}
              >
                <Search size={18} className="text-neon" /> Buscar meus títulos
              </button>
              <button
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-slate-200 hover:bg-white/5"
                onClick={() => { setMobileOpen(false); nav('/legal/contato'); }}
              >
                <LifeBuoy size={18} className="text-neon" /> Contato e Suporte
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
