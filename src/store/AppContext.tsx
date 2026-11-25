import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CAMPAIGNS } from '../config/campaign';
import { createInitialNumberStates, DEMO_RESULTS, DEMO_TOP_BUYERS } from '../data/demo';
import { adminLogout as apiAdminLogout, adminSession } from '../services/adminApi';
import { reserveNumbers, type ReserveResult } from '../services/orders';
import { NUMBER_STATUS, type AdminSession, type Campaign, type DrawResult, type Participant, type Reservation, type TopBuyer } from '../types';
import { pad3 } from '../utils/format';

export type ModalName = 'how' | 'auth' | 'titles' | 'pending' | 'checkout';
export type AuthMode = 'register' | 'login' | 'admin';
export interface AuthIntent {
  after?: Exclude<ModalName, 'auth'>;
  mode?: AuthMode;
}
export type ToastTone = 'info' | 'success' | 'warning' | 'error';
export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface AppState {
  /** Todas as campanhas (cartões da página Início). */
  campaigns: Campaign[];
  /** Estado dos números de cada campanha, por id. */
  numbersById: Record<string, Uint8Array>;
  /** Campanha aberta na página da rifa. */
  campaign: Campaign;
  selectCampaign: (id: string) => void;
  previewCampaign: (patch: Partial<Campaign>) => void;
  resetCampaignPreview: () => void;
  numbers: Uint8Array;
  counts: { all: number; available: number; reserved: number; paid: number };
  packageSize: number | null;
  selectPackage: (size: number) => void;
  selected: number[];
  toggleNumber: (n: number) => void;
  clearSelection: () => void;
  participant: Participant | null;
  setParticipant: (p: Participant | null) => void;
  logoutParticipant: () => void;
  reservations: Reservation[];
  createReservation: () => ReserveResult;
  cancelReservation: (id: string) => void;
  activeReservationId: string | null;
  setActiveReservationId: (id: string | null) => void;
  admin: AdminSession | null;
  adminChecked: boolean;
  setAdmin: (s: AdminSession | null) => void;
  refreshAdmin: () => Promise<AdminSession | null>;
  logoutAdmin: () => Promise<void>;
  modal: ModalName | null;
  authIntent: AuthIntent;
  openModal: (name: ModalName, intent?: AuthIntent) => void;
  closeModal: () => void;
  continueAfterAuth: () => void;
  toasts: Toast[];
  toast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: number) => void;
  topBuyers: TopBuyer[];
  results: DrawResult[];
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS);
  const [activeId, setActiveId] = useState<string>(CAMPAIGNS[0].id);
  const [numbersById, setNumbersById] = useState<Record<string, Uint8Array>>(() =>
    Object.fromEntries(CAMPAIGNS.map((c) => [c.id, createInitialNumberStates(c.totalNumbers)])),
  );
  const campaign = campaigns.find((c) => c.id === activeId) ?? campaigns[0];
  const numbers = numbersById[campaign.id];
  const updateNumbers = useCallback((campaignId: string, fn: (prev: Uint8Array) => Uint8Array) => {
    setNumbersById((m) => (m[campaignId] ? { ...m, [campaignId]: fn(m[campaignId]) } : m));
  }, []);
  const [packageSize, setPackageSize] = useState<number | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeReservationId, setActiveReservationId] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [adminChecked, setAdminChecked] = useState(false);
  const [modal, setModal] = useState<ModalName | null>(null);
  const [authIntent, setAuthIntent] = useState<AuthIntent>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const toast = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, message, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const counts = useMemo(() => {
    let reserved = 0;
    let paid = 0;
    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] === NUMBER_STATUS.reserved) reserved++;
      else if (numbers[i] === NUMBER_STATUS.paid) paid++;
    }
    return { all: numbers.length, available: numbers.length - reserved - paid, reserved, paid };
  }, [numbers]);

  // Refs para manter callbacks estáveis e evitar re-render de toda a grade.
  const stateRef = useRef({ numbers, packageSize, selected });
  stateRef.current = { numbers, packageSize, selected };

  const selectPackage = useCallback((size: number) => {
    if (stateRef.current.packageSize !== size) {
      stateRef.current.selected = [];
      setSelected([]);
    }
    stateRef.current.packageSize = size;
    setPackageSize(size);
  }, []);

  const toggleNumber = useCallback(
    (n: number) => {
      const { numbers: st, packageSize: size, selected: sel } = stateRef.current;
      if (st[n] !== NUMBER_STATUS.available) return;
      if (!size) {
        toast('Escolha um pacote antes de selecionar os números.', 'warning');
        document.getElementById('pacotes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      let next: number[];
      if (sel.includes(n)) {
        next = sel.filter((x) => x !== n);
      } else if (sel.length >= size) {
        toast(`Limite do pacote atingido (${size}). Desmarque um número para escolher outro.`, 'warning');
        return;
      } else {
        next = [...sel, n].sort((a, b) => a - b);
      }
      // Atualiza a ref imediatamente para toques rápidos consecutivos.
      stateRef.current.selected = next;
      setSelected(next);
    },
    [toast],
  );

  const clearSelection = useCallback(() => setSelected([]), []);

  const selectCampaign = useCallback(
    (id: string) => {
      if (id === activeId) return;
      // Trocar de carro limpa pacote e seleção da rifa anterior.
      stateRef.current.selected = [];
      stateRef.current.packageSize = null;
      setSelected([]);
      setPackageSize(null);
      setActiveId(id);
    },
    [activeId],
  );

  const releaseNumbers = useCallback(
    (campaignId: string, nums: number[]) => {
      updateNumbers(campaignId, (prev) => {
        const next = new Uint8Array(prev);
        for (const n of nums) if (next[n] === NUMBER_STATUS.reserved) next[n] = NUMBER_STATUS.available;
        return next;
      });
    },
    [updateNumbers],
  );

  const createReservation = useCallback((): ReserveResult => {
    const result = reserveNumbers(numbers, selected, packageSize, campaign, participant);
    if (!result.ok) return result;
    const r = result.reservation;
    updateNumbers(r.campaignId, (prev) => {
      const next = new Uint8Array(prev);
      for (const n of r.numbers) next[n] = NUMBER_STATUS.reserved;
      return next;
    });
    setReservations((list) => [r, ...list]);
    setSelected([]);
    return result;
  }, [numbers, selected, packageSize, campaign, participant, updateNumbers]);

  const cancelReservation = useCallback(
    (id: string) => {
      const r = reservations.find((x) => x.id === id);
      if (!r || r.status !== 'pendente') return;
      releaseNumbers(r.campaignId, r.numbers);
      setReservations((list) => list.map((x) => (x.id === id ? { ...x, status: 'cancelada' } : x)));
      toast(`Reserva cancelada. Números ${r.numbers.map(pad3).join(', ')} liberados.`, 'info');
    },
    [reservations, releaseNumbers, toast],
  );

  // Expiração automática das reservas demonstrativas.
  useEffect(() => {
    const t = window.setInterval(() => {
      const now = Date.now();
      setReservations((list) => {
        const expired = list.filter((r) => r.status === 'pendente' && Date.parse(r.expiresAt) <= now);
        if (!expired.length) return list;
        for (const r of expired) releaseNumbers(r.campaignId, r.numbers);
        return list.map((r) => (expired.includes(r) ? { ...r, status: 'expirada' } : r));
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [releaseNumbers]);

  const refreshAdmin = useCallback(async () => {
    const s = await adminSession();
    setAdmin(s);
    setAdminChecked(true);
    return s;
  }, []);

  useEffect(() => {
    void refreshAdmin();
  }, [refreshAdmin]);

  const logoutAdmin = useCallback(async () => {
    await apiAdminLogout();
    setAdmin(null);
    toast('Sessão administrativa encerrada.', 'info');
  }, [toast]);

  const logoutParticipant = useCallback(() => {
    setParticipant(null);
    toast('Você saiu da sua conta.', 'info');
  }, [toast]);

  const openModal = useCallback((name: ModalName, intent: AuthIntent = {}) => {
    if (name === 'auth') setAuthIntent(intent);
    setModal(name);
  }, []);
  const closeModal = useCallback(() => {
    setModal(null);
    setActiveReservationId(null);
  }, []);
  const continueAfterAuth = useCallback(() => {
    setModal(authIntent.after ?? null);
    setAuthIntent({});
  }, [authIntent]);

  const previewCampaign = useCallback(
    (patch: Partial<Campaign>) => setCampaigns((list) => list.map((c) => (c.id === activeId ? { ...c, ...patch } : c))),
    [activeId],
  );
  const resetCampaignPreview = useCallback(
    () => setCampaigns((list) => list.map((c) => (c.id === activeId ? (CAMPAIGNS.find((x) => x.id === c.id) ?? c) : c))),
    [activeId],
  );

  const value: AppState = {
    campaigns,
    numbersById,
    campaign,
    selectCampaign,
    previewCampaign,
    resetCampaignPreview,
    numbers,
    counts,
    packageSize,
    selectPackage,
    selected,
    toggleNumber,
    clearSelection,
    participant,
    setParticipant,
    logoutParticipant,
    reservations,
    createReservation,
    cancelReservation,
    activeReservationId,
    setActiveReservationId,
    admin,
    adminChecked,
    setAdmin,
    refreshAdmin,
    logoutAdmin,
    modal,
    authIntent,
    openModal,
    closeModal,
    continueAfterAuth,
    toasts,
    toast,
    dismissToast,
    topBuyers: DEMO_TOP_BUYERS,
    results: DEMO_RESULTS,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp deve ser usado dentro de <AppProvider>');
  return v;
}
