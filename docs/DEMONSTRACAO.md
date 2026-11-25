# Versão de demonstração para o cliente

## Gerar novamente

```powershell
npm run build:demo
```

Gera `demo-build/index.html` (arquivo único com tudo embutido) + `favicon.svg`.
O projeto original (`npm run dev` / `npm run build`) não muda.

## Opção 1 — ZIP

`Rifa-Premium-Demo.zip` contém a pasta `Rifa-Premium-Demo/` com `index.html`, `favicon.svg`, `carros/` (fotos) e `LEIA-ME.txt`.
O cliente extrai e dá dois cliques em `index.html`. Internet só é usada para as fontes.

Para refazer os ZIPs depois de mudanças:

```powershell
npm run build:demo
powershell -File scripts\make-zips.ps1
```

Gera `Rifa-Premium-Demo.zip` (para o cliente) e `Rifa-Premium-Site.zip` (para o Netlify Drop).
Não use "Compactar" do Windows/`Compress-Archive`: eles gravam caminhos com `\`, e no Netlify ou no Mac
a pasta `carros/` não é reconhecida (as fotos não aparecem).

## Link no Claude (privado)

Publicado em https://claude.ai/artifact/VLE3cfka3XRAm6ifFCBpnZ (página `demo-build/artifact.html` + fotos).
Fica privado até ser compartilhado pelo menu Compartilhar da página.

## Opção 2 — Link (NÃO publicado)

A pasta `demo-build/` é um site estático pronto. Qualquer uma das opções funciona:

- **Netlify (mais simples):** criar conta gratuita → app.netlify.com/drop → arrastar a pasta `demo-build`.
  Gera um link `https://<nome>.netlify.app`. O `netlify.toml` já está configurado para deploy via Git.
- **Vercel:** criar conta gratuita → importar o projeto (GitHub) ou usar `npx vercel` na pasta do projeto.
  O `vercel.json` já aponta para `npm run build:demo` e `demo-build`.

Rotas usam `#` (ex.: `.../#/rifa/campanha-001`), então não é preciso configurar redirecionamentos.

## Diferenças em relação ao `npm run dev`

- Área administrativa desativada (o login de teste depende do servidor local e não deve ir para a internet).
- Todo o resto funciona: navegação, slide, pacotes, grade, cadastro com código na tela, checkout visual,
  Minha conta, títulos, pendentes e páginas legais. Os dados somem ao recarregar (como no protótipo).
