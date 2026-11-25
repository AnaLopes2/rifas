# rifas

Protótipo do site **Rifa Premium** (modo demonstrativo).

Plataforma de campanhas de carros com seleção de números. **Pagamentos reais estão desativados** até a definição
de uma modalidade de promoção legalmente permitida no Brasil e das autorizações necessárias.

## Rodar

```powershell
npm install
npm run dev
```

Abra http://127.0.0.1:5173

- `npm run build` — verifica TypeScript e gera `dist/`
- `npm run typecheck` — só TypeScript

## Login administrativo de TESTE (somente local)

- Usuário `adm`, senha `adm` (ou defina `ADMIN_USER` / `ADMIN_PASSWORD` num arquivo `.env`, ver `.env.example`).
- Só funciona com `npm run dev`, em `127.0.0.1`. O build de produção **não** contém a API de login — o site publicado
  não aceita login administrativo até existir um backend real.
- A senha nunca está no código do navegador: o servidor de desenvolvimento guarda apenas o hash Argon2id em memória,
  cria uma sessão em cookie `HttpOnly`/`SameSite=Strict`, bloqueia após 5 tentativas erradas (15 min) e registra
  as ações num histórico de auditoria.
- **Não publique este login nem use estas credenciais em produção.**

Entrar: botão "Entrar / Cadastrar" → "Acesso administrativo", ou abra `/admin` diretamente.

## Estrutura

```
server/devApi.ts          API administrativa de desenvolvimento (auth, sessão, auditoria)
src/config/               Configurações do site e da campanha (preço, pacotes, carro, imagem)
src/data/demo.ts          Dados DEMONSTRATIVOS (separados) — sem compradores, reservas ou sorteios
src/services/             Clientes/serviços: adminApi, participantAuth (OTP simulado), orders (reserva simulada)
src/store/AppContext.tsx  Estado da aplicação (números, seleção, sessão, modais)
src/components/           home/, layout/, modals/, ui/
src/pages/                Home, Minha conta, Legal, Resultado, admin/
src/content/legal.ts      Minutas preliminares de termos e políticas (revisão jurídica obrigatória)
docs/ARQUITETURA.md       Plano do backend real (pagamentos, concorrência, webhooks, segurança)
```

## Trocar a imagem do carro

Edite `PLACEHOLDER_HERO_IMAGE` em `src/config/campaign.ts` (URL ou arquivo em `public/`).
Os dados do veículo ficam em `DEFAULT_CAMPAIGN.car` no mesmo arquivo.

## O que é demonstrativo

- Códigos de verificação aparecem na tela (nenhum e-mail/SMS é enviado); cadastros vivem só na memória da aba.
- Reservas são locais, expiram em 15 minutos e não geram cobrança. Pix e cartão são apenas interface.
- No painel, "Pré-visualizar" altera só a aba atual; demais ações são registradas na auditoria e não persistem.
