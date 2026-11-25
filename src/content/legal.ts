/**
 * MINUTAS PRELIMINARES — redigidas do zero para este projeto.
 * Devem passar por revisão jurídica antes da publicação definitiva.
 * Trechos entre colchetes são campos a preencher com os dados reais da empresa (ver src/config/site.ts).
 */
import { SITE } from '../config/site';

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}
export interface LegalDoc {
  slug: string;
  title: string;
  summary: string;
  sections: LegalSection[];
}

const c = SITE.company;

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: 'termos',
    title: 'Termos e Condições de Uso',
    summary: 'Regras gerais para utilizar a plataforma.',
    sections: [
      { heading: '1. Identificação da empresa', paragraphs: [`Esta plataforma é operada por ${c.legalName}, inscrita no CNPJ ${c.cnpj}, com sede em ${c.address}.`] },
      { heading: '2. Descrição dos serviços', paragraphs: ['A plataforma permite consultar campanhas, escolher números e acompanhar participações e resultados. Nesta fase, opera em modo demonstrativo, sem processamento de pagamentos.', 'Nenhuma campanha é apresentada como autorizada sem a documentação correspondente, que será divulgada nas Regras da Campanha quando existir.'] },
      { heading: '3. Requisitos para participação', paragraphs: [`Podem participar pessoas físicas com pelo menos ${SITE.minAge} anos, residentes no Brasil, com CPF regular, observadas as regras específicas de cada campanha. [Ajustar conforme a modalidade legal adotada.]`] },
      { heading: '4. Cadastro', paragraphs: ['O participante deve fornecer dados verdadeiros, completos e atualizados. O acesso é feito por código de verificação enviado ao e-mail ou celular cadastrado, sem necessidade de senha.', 'É proibido criar cadastros em nome de terceiros ou utilizar dados de outra pessoa.'] },
      { heading: '5. Responsabilidades', paragraphs: ['O participante é responsável por manter seguros o acesso ao seu e-mail e ao seu celular. A empresa é responsável pela operação da plataforma, pela guarda dos dados e pela condução das campanhas conforme suas regras. [Detalhar limitações de responsabilidade após revisão jurídica.]'] },
      { heading: '6. Segurança', paragraphs: ['Adotamos medidas técnicas e administrativas para proteger a plataforma, incluindo códigos de verificação com validade limitada, limitação de tentativas e registro de atividades administrativas.'] },
      { heading: '7. Pagamentos', paragraphs: ['Pagamentos reais estão desativados. Quando habilitados, serão processados exclusivamente por provedor autorizado, conforme a Política de Pagamentos e Reembolsos.'] },
      { heading: '8. Cancelamentos', paragraphs: ['Reservas não pagas expiram automaticamente e os números voltam a ficar disponíveis. Regras de cancelamento de participações pagas constarão da Política de Pagamentos e Reembolsos.'] },
      { heading: '9. Resultados', paragraphs: ['Os resultados serão publicados na plataforma com informações que permitam sua verificação, conforme as Regras da Campanha.'] },
      { heading: '10. Atendimento', paragraphs: [`Dúvidas e solicitações: ${c.email} — ${c.supportHours}.`] },
      { heading: '11. Legislação aplicável', paragraphs: ['Estes termos são regidos pelas leis brasileiras, incluindo o Código de Defesa do Consumidor e a Lei Geral de Proteção de Dados (LGPD). [Definir foro após revisão jurídica.]'] },
    ],
  },
  {
    slug: 'privacidade',
    title: 'Política de Privacidade',
    summary: 'Como tratamos seus dados pessoais, conforme a LGPD.',
    sections: [
      { heading: '1. Controlador', paragraphs: [`${c.legalName} (CNPJ ${c.cnpj}) é a controladora dos dados. Encarregado(a) pelo tratamento de dados: ${c.dpoEmail}.`] },
      { heading: '2. Dados tratados', paragraphs: ['Nome completo, CPF, data de nascimento, telefone celular, e-mail, dados das participações (campanhas, números, datas e situação) e registros de transações quando os pagamentos estiverem habilitados. Também podem ser coletados registros técnicos de acesso (data, hora e IP), conforme o Marco Civil da Internet.'] },
      { heading: '3. Finalidades e bases legais', paragraphs: ['Identificar o participante e verificar sua idade (execução de contrato e cumprimento de obrigação legal); prevenir fraudes e garantir a segurança (legítimo interesse); comunicar resultados e informações da participação (execução de contrato); cumprir obrigações regulatórias e fiscais (obrigação legal). [Revisar com assessoria jurídica.]'] },
      { heading: '4. Compartilhamento', paragraphs: ['Os dados poderão ser compartilhados com provedores de pagamento, de envio de e-mail/SMS e de hospedagem, estritamente para as finalidades acima, e com autoridades quando exigido por lei. Não vendemos dados pessoais.'] },
      { heading: '5. Divulgação pública', paragraphs: ['Rankings e resultados exibem apenas nomes parcialmente ocultos e, quando autorizado, o estado do participante. CPF, e-mail e telefone nunca são exibidos publicamente.'] },
      { heading: '6. Retenção', paragraphs: ['Os dados são mantidos pelo período necessário às finalidades e aos prazos legais aplicáveis. [Definir prazos.]'] },
      { heading: '7. Direitos do titular', paragraphs: [`Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação e informações sobre compartilhamento, além de revogar consentimentos, pelo e-mail ${c.dpoEmail}.`] },
      { heading: '8. Segurança', paragraphs: ['Utilizamos controles de acesso, criptografia em trânsito, autenticação por código e registro de auditoria. Dados de cartão não são armazenados pela plataforma.'] },
    ],
  },
  {
    slug: 'regras',
    title: 'Regras da Campanha',
    summary: 'Condições específicas de cada campanha.',
    sections: [
      { heading: 'Situação atual', paragraphs: ['A campanha exibida está em fase de preparação, em modo demonstrativo. Não há participações pagas nem sorteios agendados.', 'A modalidade da promoção e eventuais autorizações serão informadas aqui, com número do documento e órgão emissor, somente quando existirem.'] },
      { heading: 'Prêmio', paragraphs: ['[Descrição completa do prêmio, valor de referência, condições de entrega e responsabilidade por tributos e documentação.]'] },
      { heading: 'Números', paragraphs: ['A campanha possui números de 000 a 999. Cada número só pode pertencer a um participante. Números reservados e não pagos voltam a ficar disponíveis após o prazo de expiração.'] },
      { heading: 'Apuração', paragraphs: ['[Método de apuração, data, local, forma de verificação pública e critérios em caso de número não vendido.]'] },
      { heading: 'Alterações', paragraphs: ['As condições de uma campanha não serão alteradas silenciosamente após seu início. Qualquer ajuste necessário será publicado com data e justificativa.'] },
    ],
  },
  {
    slug: 'pagamentos',
    title: 'Política de Pagamentos e Reembolsos',
    summary: 'Como funcionarão pagamentos, prazos e reembolsos.',
    sections: [
      { heading: 'Situação atual', paragraphs: ['Pagamentos reais estão DESATIVADOS. Qualquer tela de pagamento exibida é apenas demonstrativa e nenhum valor deve ser transferido.'] },
      { heading: 'Meios previstos', paragraphs: ['Pix e cartão de crédito/débito, processados exclusivamente por provedor autorizado. Dados de cartão serão digitados em campos seguros do provedor e não passarão pelos nossos servidores.'] },
      { heading: 'Confirmação', paragraphs: ['Um pagamento só será considerado confirmado após notificação segura do provedor. Os números passam a pertencer ao participante somente depois dessa confirmação.'] },
      { heading: 'Reservas e expiração', paragraphs: [`Ao iniciar um pedido, os números ficam reservados por ${SITE.reservationMinutes} minutos. Sem pagamento confirmado nesse prazo, a reserva expira e os números são liberados.`] },
      { heading: 'Reembolsos', paragraphs: ['[Hipóteses de reembolso, prazos, forma de devolução e direito de arrependimento, conforme a modalidade legal adotada e o Código de Defesa do Consumidor.]'] },
    ],
  },
  {
    slug: 'contato',
    title: 'Contato e Suporte',
    summary: 'Fale com a nossa equipe.',
    sections: [
      { heading: 'Atendimento', paragraphs: [`E-mail: ${c.email}`, `Telefone: ${c.phone}`, `Horário: ${c.supportHours}`] },
      { heading: 'Privacidade e dados pessoais', paragraphs: [`Encarregado(a) de dados: ${c.dpoEmail}`] },
      { heading: 'Endereço', paragraphs: [`${c.legalName} — ${c.address}`] },
    ],
  },
];
