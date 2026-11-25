/**
 * Cliente da API administrativa. Nenhuma credencial fica no navegador:
 * usuário e senha são enviados ao servidor, que valida e devolve um cookie HttpOnly.
 */
import type { AdminSession } from '../types';

const HEADERS = { 'Content-Type': 'application/json', 'X-Requested-With': 'rifa-premium' };
/** Na versão de demonstração enviada ao cliente não existe servidor: a área administrativa fica desativada. */
const IS_DEMO_BUILD = import.meta.env.VITE_DEMO_BUILD === 'true';
const UNAVAILABLE = IS_DEMO_BUILD
  ? 'A área administrativa não está disponível nesta versão de demonstração.'
  : 'Servidor de autenticação indisponível. O login administrativo de teste só funciona localmente com "npm run dev".';

async function parse(r: Response) {
  const type = r.headers.get('content-type') ?? '';
  if (!type.includes('application/json')) return null;
  return (await r.json()) as Record<string, unknown>;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: string; status?: number };

export async function adminLogin(username: string, password: string): Promise<Result<AdminSession>> {
  if (IS_DEMO_BUILD) return { ok: false, error: UNAVAILABLE };
  try {
    const r = await fetch('/api/admin/login', {
      method: 'POST',
      headers: HEADERS,
      credentials: 'same-origin',
      body: JSON.stringify({ username, password }),
    });
    const data = await parse(r);
    if (!data) return { ok: false, error: UNAVAILABLE, status: r.status };
    if (r.ok) return { ok: true, data: data as unknown as AdminSession };
    return { ok: false, error: String(data.error ?? 'Falha no login.'), status: r.status };
  } catch {
    return { ok: false, error: UNAVAILABLE };
  }
}

export async function adminSession(): Promise<AdminSession | null> {
  if (IS_DEMO_BUILD) return null;
  try {
    const r = await fetch('/api/admin/session', { credentials: 'same-origin' });
    if (!r.ok) return null;
    const data = await parse(r);
    return data ? (data as unknown as AdminSession) : null;
  } catch {
    return null;
  }
}

export async function adminLogout() {
  try {
    await fetch('/api/admin/logout', { method: 'POST', headers: HEADERS, credentials: 'same-origin' });
  } catch {
    /* ignora */
  }
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  details?: string;
}

export async function getAudit(): Promise<AuditEntry[]> {
  try {
    const r = await fetch('/api/admin/audit', { credentials: 'same-origin' });
    if (!r.ok) return [];
    const data = await parse(r);
    return (data?.entries as AuditEntry[]) ?? [];
  } catch {
    return [];
  }
}

export async function logAdminAction(action: string, details?: string) {
  try {
    await fetch('/api/admin/audit', {
      method: 'POST',
      headers: HEADERS,
      credentials: 'same-origin',
      body: JSON.stringify({ action, details }),
    });
  } catch {
    /* ignora */
  }
}
