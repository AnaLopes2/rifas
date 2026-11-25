/**
 * Criação de pedidos/reservas — SIMULAÇÃO do que o servidor fará.
 *
 * Fluxo previsto em produção (ver docs/ARQUITETURA.md):
 *  1. Criar pedido no backend (com chave de idempotência).
 *  2. Revalidar preço, pacote e disponibilidade dentro de uma transação com bloqueio
 *     (ex.: SELECT ... FOR UPDATE ou UPDATE condicional `WHERE status = 'available'`).
 *  3. Reservar temporariamente com expiração.
 *  4. Pagamento por provedor autorizado.
 *  5. Confirmação SOMENTE via webhook assinado e idempotente.
 *  6. Atualizar pedido, 7. atribuir números em definitivo, 8. notificar o participante.
 *
 * Aqui nada é cobrado: a reserva é apenas demonstrativa e expira sozinha.
 */
import { SITE } from '../config/site';
import { NUMBER_STATUS, type Campaign, type Participant, type Reservation } from '../types';
import { randomId } from '../utils/format';

export type ReserveResult = { ok: true; reservation: Reservation } | { ok: false; error: string };

export function reserveNumbers(
  states: Uint8Array,
  selection: number[],
  packageSize: number | null,
  campaign: Campaign,
  participant: Participant | null,
): ReserveResult {
  if (!participant) return { ok: false, error: 'Identifique-se para continuar.' };
  if (!packageSize || !campaign.packages.includes(packageSize)) return { ok: false, error: 'Pacote inválido.' };
  const unique = Array.from(new Set(selection)).sort((a, b) => a - b);
  if (unique.length !== packageSize) return { ok: false, error: `Selecione exatamente ${packageSize} número(s).` };
  for (const n of unique) {
    if (n < 0 || n >= campaign.totalNumbers) return { ok: false, error: 'Número fora do intervalo.' };
    if (states[n] !== NUMBER_STATUS.available) {
      return { ok: false, error: `O número ${String(n).padStart(3, '0')} não está mais disponível.` };
    }
  }
  const now = Date.now();
  // Preço SEMPRE recalculado a partir da configuração da campanha (nunca do cliente).
  const total = campaign.unitPrice * unique.length;
  return {
    ok: true,
    reservation: {
      id: randomId('r_'),
      campaignId: campaign.id,
      campaignName: campaign.name,
      participantId: participant.id,
      numbers: unique,
      unitPrice: campaign.unitPrice,
      total,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + SITE.reservationMinutes * 60_000).toISOString(),
      confirmedAt: null,
      status: 'pendente',
      demo: true,
    },
  };
}
