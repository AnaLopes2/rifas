/**
 * Configurações gerais do site. No futuro, virão do painel administrativo (backend).
 * Campos entre colchetes são marcadores a substituir pelos dados reais da empresa.
 */
export const SITE = {
  name: 'Rifa Premium',
  /** 'demo' = dados demonstrativos locais; 'live' = dados reais vindos do backend (ainda não implementado). */
  dataMode: 'demo' as 'demo' | 'live',
  /** Pagamentos reais permanecem desativados até a definição de modalidade legalmente permitida. */
  paymentsEnabled: false,
  minAge: 18,
  reservationMinutes: 15,
  otp: { length: 6, ttlSeconds: 300, maxAttempts: 5, resendCooldownSeconds: 30 },
  company: {
    legalName: '[RAZÃO SOCIAL DA EMPRESA]',
    cnpj: '[CNPJ]',
    address: '[ENDEREÇO COMPLETO]',
    email: '[contato@suaempresa.com.br]',
    phone: '[(00) 0000-0000]',
    supportHours: '[Segunda a sexta, das 9h às 18h]',
    dpoEmail: '[privacidade@suaempresa.com.br]',
  },
} as const;
