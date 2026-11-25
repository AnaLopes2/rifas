/**
 * API administrativa de DESENVOLVIMENTO (protótipo).
 *
 * - Roda somente dentro do `vite dev` (apply: 'serve') e aceita apenas conexões locais (loopback).
 * - A senha nunca vai para o código do navegador: é lida do ambiente (ADMIN_USER / ADMIN_PASSWORD,
 *   padrão adm/adm só para testes locais) e mantida apenas como hash Argon2id em memória.
 * - Sessões com token aleatório em cookie HttpOnly + SameSite=Strict, expiração e logout.
 * - Proteção contra tentativas repetidas (bloqueio temporário por IP + usuário).
 * - Histórico de auditoria em memória.
 *
 * Em produção, substitua por um backend real (banco de dados, sessões persistentes, HTTPS com cookie
 * `Secure`, MFA obrigatório, auditoria imutável). Veja docs/ARQUITETURA.md.
 */
import type { Plugin } from 'vite';
import { loadEnv } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomBytes, randomUUID } from 'node:crypto';
import { argon2id, argon2Verify } from 'hash-wasm';

interface Session {
  username: string;
  createdAt: number;
  expiresAt: number;
}

interface AttemptInfo {
  failures: number;
  windowStart: number;
  lockedUntil: number;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  details?: string;
}

const COOKIE = 'rp_admin';
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 horas
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const MAX_BODY = 8 * 1024;

const ARGON_PARAMS = { parallelism: 1, iterations: 3, memorySize: 19456, hashLength: 32 } as const;

async function hashPassword(password: string) {
  return argon2id({ ...ARGON_PARAMS, password, salt: randomBytes(16), outputType: 'encoded' });
}

function isLoopback(req: IncomingMessage) {
  const a = req.socket.remoteAddress ?? '';
  return a === '127.0.0.1' || a === '::1' || a === '::ffff:127.0.0.1';
}

function send(res: ServerResponse, status: number, body: unknown, headers: Record<string, string | string[]> = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
}

function readCookie(req: IncomingMessage, name: string) {
  const raw = req.headers.cookie ?? '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error('payload'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        resolve(parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {});
      } catch {
        reject(new Error('json'));
      }
    });
    req.on('error', reject);
  });
}

async function createAdminApi(env: Record<string, string>) {
  const username = env.ADMIN_USER || 'adm';
  const passwordHash = await hashPassword(env.ADMIN_PASSWORD || 'adm');
  // Hash "isca" usado quando o usuário não existe, para manter o tempo de resposta semelhante.
  const dummyHash = await hashPassword(randomBytes(12).toString('hex'));

  const sessions = new Map<string, Session>();
  const attempts = new Map<string, AttemptInfo>();
  const audit: AuditEntry[] = [];

  const log = (actor: string, action: string, details?: string) => {
    audit.unshift({ id: randomUUID(), at: new Date().toISOString(), actor, action, details });
    if (audit.length > 500) audit.length = 500;
  };

  const getSession = (req: IncomingMessage) => {
    const token = readCookie(req, COOKIE);
    if (!token) return null;
    const s = sessions.get(token);
    if (!s) return null;
    if (s.expiresAt < Date.now()) {
      sessions.delete(token);
      return null;
    }
    return { token, session: s };
  };

  const sessionPayload = (s: Session) => ({
    username: s.username,
    role: 'admin' as const,
    expiresAt: new Date(s.expiresAt).toISOString(),
    mfa: { enabled: false, required: false, note: 'MFA preparado, ainda não habilitado no protótipo.' },
    mode: 'demo' as const,
  });

  const attemptKey = (req: IncomingMessage, user: string) => `${req.socket.remoteAddress}|${user.toLowerCase()}`;

  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = (req.url ?? '').split('?')[0];
    if (!url.startsWith('/admin/')) return next();

    if (!isLoopback(req)) return send(res, 403, { error: 'Acesso administrativo disponível somente localmente.' });

    // Proteção simples contra CSRF: exige cabeçalho customizado em requisições que alteram estado.
    if (req.method !== 'GET' && req.headers['x-requested-with'] !== 'rifa-premium') {
      return send(res, 403, { error: 'Requisição recusada.' });
    }

    try {
      if (url === '/admin/login' && req.method === 'POST') {
        const body = await readJson(req);
        const user = typeof body.username === 'string' ? body.username.trim().slice(0, 64) : '';
        const pass = typeof body.password === 'string' ? body.password.slice(0, 256) : '';
        const key = attemptKey(req, user);
        const now = Date.now();
        const info = attempts.get(key) ?? { failures: 0, windowStart: now, lockedUntil: 0 };

        if (info.lockedUntil > now) {
          const retryAfter = Math.ceil((info.lockedUntil - now) / 1000);
          return send(res, 429, { error: `Muitas tentativas. Tente novamente em ${Math.ceil(retryAfter / 60)} min.`, retryAfter }, { 'Retry-After': String(retryAfter) });
        }
        if (now - info.windowStart > WINDOW_MS) {
          info.failures = 0;
          info.windowStart = now;
        }

        const userOk = user === username;
        const passOk = await argon2Verify({ password: pass, hash: userOk ? passwordHash : dummyHash });

        if (!userOk || !passOk) {
          info.failures += 1;
          if (info.failures >= MAX_FAILURES) {
            info.lockedUntil = now + LOCK_MS;
            log(user || '(vazio)', 'login.bloqueado', 'Bloqueio temporário após tentativas repetidas');
          } else {
            log(user || '(vazio)', 'login.falhou');
          }
          attempts.set(key, info);
          const remaining = Math.max(0, MAX_FAILURES - info.failures);
          return send(res, 401, {
            error: remaining > 0 ? `Usuário ou senha inválidos. Tentativas restantes: ${remaining}.` : 'Acesso bloqueado temporariamente por 15 minutos.',
            remaining,
          });
        }

        attempts.delete(key);
        const token = randomBytes(32).toString('base64url');
        const session: Session = { username, createdAt: now, expiresAt: now + SESSION_TTL_MS };
        sessions.set(token, session);
        log(username, 'login.sucesso');
        // Em produção: adicionar `Secure` (HTTPS obrigatório).
        const cookie = `${COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${SESSION_TTL_MS / 1000}`;
        return send(res, 200, sessionPayload(session), { 'Set-Cookie': cookie });
      }

      if (url === '/admin/session' && req.method === 'GET') {
        const found = getSession(req);
        if (!found) return send(res, 401, { error: 'Não autenticado.' });
        return send(res, 200, sessionPayload(found.session));
      }

      if (url === '/admin/logout' && req.method === 'POST') {
        const found = getSession(req);
        if (found) {
          sessions.delete(found.token);
          log(found.session.username, 'logout');
        }
        return send(res, 200, { ok: true }, { 'Set-Cookie': `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0` });
      }

      if (url === '/admin/audit') {
        const found = getSession(req);
        if (!found) return send(res, 401, { error: 'Não autenticado.' });
        if (req.method === 'GET') return send(res, 200, { entries: audit.slice(0, 100) });
        if (req.method === 'POST') {
          const body = await readJson(req);
          const action = typeof body.action === 'string' ? body.action.slice(0, 80) : '';
          const details = typeof body.details === 'string' ? body.details.slice(0, 500) : undefined;
          if (!action) return send(res, 400, { error: 'Ação obrigatória.' });
          log(found.session.username, action, details);
          return send(res, 201, { ok: true });
        }
      }

      return send(res, 404, { error: 'Rota não encontrada.' });
    } catch {
      return send(res, 400, { error: 'Requisição inválida.' });
    }
  };
}

export function adminApiPlugin(): Plugin {
  return {
    name: 'rifa-premium-admin-dev-api',
    apply: 'serve',
    async configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      const handler = await createAdminApi(env);
      server.middlewares.use('/api', (req, res, next) => {
        void handler(req, res, next);
      });
      server.config.logger.warn(
        '\n  [Rifa Premium] Login administrativo de TESTE ativo (somente local). Não publique este login nem use estas credenciais em produção.\n',
      );
    },
  };
}
