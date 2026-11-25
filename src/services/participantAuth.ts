/**
 * Autenticação de participantes por código (OTP) — SIMULAÇÃO LOCAL.
 *
 * No protótipo, nenhum e-mail ou SMS é enviado: o código é exibido na tela, sinalizado como demonstração.
 * Os cadastros ficam apenas na memória desta aba (somem ao recarregar).
 *
 * Em produção, TODO este módulo deve rodar no servidor:
 *  - gerar e armazenar o código com hash, validade limitada e limite de tentativas;
 *  - enviar por provedor de e-mail/SMS;
 *  - não revelar se um CPF/e-mail está cadastrado (resposta genérica).
 */
import { SITE } from '../config/site';
import type { Participant } from '../types';
import { randomId } from '../utils/format';
import { hideEmail, hidePhone, onlyDigits } from '../utils/validation';

export type Channel = 'email' | 'sms';

interface Challenge {
  code: string | null; // null = nenhum cadastro correspondente (resposta genérica)
  expiresAt: number;
  attempts: number;
  participant: Participant | null;
  isNew: boolean;
}

const registry = new Map<string, Participant>(); // chave: CPF (dígitos)
const challenges = new Map<string, Challenge>();

function generateCode() {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(arr[0] % 10 ** SITE.otp.length).padStart(SITE.otp.length, '0');
}

export interface ChallengeInfo {
  challengeId: string;
  sentTo: string;
  expiresAt: number;
  /** Mostrado somente no modo demonstrativo. */
  demoCode: string | null;
}

function sentTo(p: Participant, channel: Channel) {
  return channel === 'email' ? hideEmail(p.email) : hidePhone(p.phone);
}

export function startRegistration(
  data: Omit<Participant, 'id' | 'createdAt'>,
  channel: Channel,
): ChallengeInfo | { error: string } {
  const cpf = onlyDigits(data.cpf);
  if (registry.has(cpf)) return { error: 'Este CPF já possui cadastro. Use "Já tenho cadastro" para entrar.' };
  const participant: Participant = { ...data, cpf, id: randomId('p_'), createdAt: new Date().toISOString() };
  const code = generateCode();
  const challengeId = randomId('c_');
  const expiresAt = Date.now() + SITE.otp.ttlSeconds * 1000;
  challenges.set(challengeId, { code, expiresAt, attempts: 0, participant, isNew: true });
  return { challengeId, sentTo: sentTo(participant, channel), expiresAt, demoCode: code };
}

/** Login de quem já tem cadastro, por CPF. Resposta genérica para não revelar se o CPF existe. */
export function startLogin(cpfInput: string, channel: Channel): ChallengeInfo {
  const p = registry.get(onlyDigits(cpfInput)) ?? null;
  const challengeId = randomId('c_');
  const expiresAt = Date.now() + SITE.otp.ttlSeconds * 1000;
  const code = p ? generateCode() : null;
  challenges.set(challengeId, { code, expiresAt, attempts: 0, participant: p, isNew: false });
  return {
    challengeId,
    sentTo: p ? sentTo(p, channel) : 'o contato cadastrado',
    expiresAt,
    demoCode: code,
  };
}

export function verifyChallenge(
  challengeId: string,
  code: string,
): { ok: true; participant: Participant } | { ok: false; error: string; remaining: number } {
  const c = challenges.get(challengeId);
  if (!c) return { ok: false, error: 'Solicite um novo código.', remaining: 0 };
  if (Date.now() > c.expiresAt) {
    challenges.delete(challengeId);
    return { ok: false, error: 'Código expirado. Solicite um novo código.', remaining: 0 };
  }
  if (c.attempts >= SITE.otp.maxAttempts) {
    return { ok: false, error: 'Limite de tentativas atingido. Solicite um novo código.', remaining: 0 };
  }
  c.attempts++;
  const remaining = SITE.otp.maxAttempts - c.attempts;
  if (!c.code || !c.participant || c.code !== code.trim()) {
    if (remaining <= 0) challenges.delete(challengeId);
    return { ok: false, error: `Código inválido. Tentativas restantes: ${remaining}.`, remaining };
  }
  challenges.delete(challengeId);
  if (c.isNew) registry.set(c.participant.cpf, c.participant);
  return { ok: true, participant: c.participant };
}

export function listDemoParticipants() {
  return Array.from(registry.values());
}
