/**
 * DADOS DEMONSTRATIVOS — mantidos separados dos dados reais.
 * Não há compradores, reservas, pagamentos ou sorteios reais: as listas começam vazias.
 */
import type { DrawResult, TopBuyer } from '../types';

export const DEMO_TOP_BUYERS: TopBuyer[] = [];
export const DEMO_RESULTS: DrawResult[] = [];

/** Todos os números começam disponíveis (0). */
export function createInitialNumberStates(total: number): Uint8Array {
  return new Uint8Array(total);
}
