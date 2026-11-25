# Arquitetura prevista (backend real)

O protótipo atual roda tudo no navegador, exceto a autenticação administrativa de teste (`server/devApi.ts`).
Antes de habilitar qualquer função real, implementar os módulos abaixo **no servidor**.

## Módulos

| Módulo | Responsabilidade |
|---|---|
| Autenticação | OTP por e-mail/SMS (hash do código, validade de 5 min, 5 tentativas, limite por IP/CPF), sessões seguras |
| Admin | Usuários com senha Argon2id, MFA obrigatório (TOTP/WebAuthn), papéis e permissões, sessões `Secure`/`HttpOnly` |
| Campanhas | CRUD versionado; após o início, alterações viram aditivos públicos (nunca silenciosas) |
| Números | Tabela `numbers(campaign_id, number, status, order_id, reserved_until, confirmed_at)` com índice único |
| Pedidos | Criação idempotente (`Idempotency-Key`), reserva com expiração, job de liberação |
| Pagamentos | Provedor autorizado; confirmação **somente** por webhook assinado; campos de cartão hospedados pelo provedor |
| Ranking | Agregado apenas de pedidos `confirmados`, nomes mascarados no servidor |
| Resultados | Registro de apuração com documentos, publicação verificável, correções com histórico |
| Auditoria | Log append-only de ações administrativas e mudanças de estado |

## Fluxo de compra

1. Cliente envia `POST /orders` com campanha, pacote e números + `Idempotency-Key`.
2. Servidor revalida pacote e **recalcula o preço** a partir da campanha (ignora valores do cliente).
3. Em uma transação: `UPDATE numbers SET status='reserved', order_id=?, reserved_until=now()+15min
   WHERE campaign_id=? AND number = ANY(?) AND status='available'` — se o número de linhas afetadas
   for menor que o solicitado, faz rollback (evita reserva duplicada / corrida).
4. Cria a cobrança no provedor (Pix/cartão) e devolve os dados ao cliente.
5. Webhook do provedor → validar assinatura e timestamp → processar de forma idempotente (por `event_id`).
6. Pedido `confirmado`; números `paid`; registrar auditoria.
7. Notificar participante (e-mail/SMS).
8. Job periódico libera reservas expiradas (`reserved_until < now()` e pedido não pago).

Clicar em um botão no navegador **nunca** confirma pagamento.

## Segurança

- Nenhum segredo no frontend; variáveis de ambiente apenas no servidor.
- Rate limiting em login, OTP e criação de pedidos.
- Headers de segurança (CSP, HSTS), HTTPS obrigatório.
- LGPD: minimização, mascaramento de CPF/contatos, retenção definida, canal do encarregado.
