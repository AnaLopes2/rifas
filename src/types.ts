/** 0 = disponível, 1 = reservado, 2 = pago (confirmado). Armazenado em Uint8Array por desempenho. */
export const NUMBER_STATUS = { available: 0, reserved: 1, paid: 2 } as const;
export type NumberStatusCode = (typeof NUMBER_STATUS)[keyof typeof NUMBER_STATUS];
export type NumberFilter = 'all' | 'available' | 'reserved' | 'paid';

export interface CarDetails {
  model: string;
  year: string;
  power: string;
  transmission: string;
  color: string;
}

export type CampaignStatus = 'rascunho' | 'publicada' | 'pausada' | 'encerrada';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  car: CarDetails;
  /** Fotos do carro exibidas no slide do destaque (a primeira também é a miniatura). */
  heroImages: string[];
  totalNumbers: number;
  unitPrice: number;
  packages: number[];
  status: CampaignStatus;
  startDate: string | null;
  drawDate: string | null;
  /** Documento/autorização associados. `null` enquanto não houver documentação real. */
  authorizationRef: string | null;
}

export interface Participant {
  id: string;
  name: string;
  birthDate: string;
  phone: string;
  cpf: string; // apenas dígitos
  email: string;
  createdAt: string;
}

export type ReservationStatus = 'pendente' | 'confirmada' | 'expirada' | 'cancelada';

export interface Reservation {
  id: string;
  campaignId: string;
  campaignName: string;
  participantId: string;
  numbers: number[];
  unitPrice: number;
  total: number;
  createdAt: string;
  expiresAt: string;
  confirmedAt: string | null;
  status: ReservationStatus;
  /** Sempre `true` no protótipo — nenhum pagamento real é processado. */
  demo: true;
}

export interface TopBuyer {
  position: number;
  displayName: string; // já mascarado pelo servidor
  quantity: number;
}

export interface DrawResult {
  id: string;
  campaignName: string;
  prizeImage: string;
  winningNumber: number;
  winnerPublicName: string;
  winnerState: string | null;
  drawDate: string;
  verificationDetails: string;
}

export interface AdminSession {
  username: string;
  role: 'admin';
  expiresAt: string;
  mfa: { enabled: boolean; required: boolean; note?: string };
  mode: 'demo';
}
