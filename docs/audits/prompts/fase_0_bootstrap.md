# Prompt — Fase 0: Bootstrap do CoolTrack Pro Reset A

## Como usar este prompt

1. Cole este prompt inteiro no Claude Code (ou Codex, ou outro agente).
2. Antes de mandar, garanta que `PROJECT.md` e `SESSION_LOG.md` estão na raiz do repo.
3. O agente DEVE ler os dois arquivos antes de qualquer ação.
4. Ao final, o agente atualiza `SESSION_LOG.md` com entrada nova.

---

## Contexto crítico (obrigatório ler antes de agir)

Você está iniciando a **Fase 0 (Bootstrap)** do CoolTrack Pro — Reset A. Reset A significa: refazer toda a camada de apresentação (UI, CSS, componentes, rotas, estado) mantendo apenas autenticação Supabase como non-negotiable do projeto antigo.

**Antes de qualquer ação, leia integralmente:**

1. `PROJECT.md` (raiz do repo) — fonte da verdade do projeto: stack, arquitetura, padrões, modelo de dados, regras de ouro.
2. `SESSION_LOG.md` (raiz do repo) — diário de bordo. Leia a última entrada para entender o estado atual.

Se algum dos dois arquivos estiver ausente, PARE e reporte. Não improvise.

---

## Restrições mecânicas (não-negociáveis)

Você está PROIBIDO de:

1. **Pushar para `main`.** Trabalhe na branch `ui-v2` que você vai criar.
2. **Tocar nos arquivos do projeto antigo** que estão em `src/` atual, exceto para extrair tokens/configurações documentados em `PROJECT.md` §5.
3. **Adicionar dependências fora da lista aprovada** em `PROJECT.md` §2.
4. **Criar arquivos CSS adicionais** além do único permitido (`src/styles/globals.css`).
5. **Usar `!important` em qualquer estilo.**
6. **Usar `any` em TypeScript.** Se precisar de fallback, use `unknown`.
7. **Improvisar.** Se algo não está claro, pare e reporte.
8. **Pushar sem autorização explícita do dono do projeto.**

Se sentir vontade de violar qualquer dessas regras, PARE e reporte a justificativa.

---

## Pre-flight (responda antes de começar)

1. Você leu `PROJECT.md` integralmente?
2. Você leu a última entrada de `SESSION_LOG.md`?
3. Confirma que vai trabalhar na branch `ui-v2` e não em `main`?
4. Confirma que NÃO vai adicionar dependências fora da lista aprovada?
5. Confirma que NÃO vai pushar sem autorização explícita?

---

## Tarefa desta sessão

Setup completo do projeto Reset A na branch `ui-v2`. Ao final desta sessão, o projeto deve:

- Rodar localmente com `npm run dev` em uma tela de "Hello CoolTrack" estilizada.
- Buildar limpo com `npm run build`.
- Ter Tailwind funcionando com os tokens corretos.
- Ter shadcn/ui inicializado e pelo menos 1 componente copiado para `components/ui/`.
- Ter TanStack Router configurado com 1 rota raiz.
- Ter TanStack Query configurado.
- Ter Supabase client conectado (variáveis de ambiente documentadas).
- Ter ESLint + Prettier rodando.
- Ter estrutura de pastas conforme `PROJECT.md` §3 (mesmo que vazias por enquanto).
- Ter GitHub Actions atualizado para deployar a `ui-v2` em ambiente separado (ou pausado, se não houver ambiente).

---

## Plano de execução

### Etapa 0 — Reconhecimento (read-only)

1. Liste a estrutura atual do repo (`ls -la` na raiz, e em `src/`).
2. Identifique:
   - Versão do Node em uso (`.nvmrc`, `package.json` engines, ou pergunte).
   - Configuração atual de Vite (`vite.config.js` ou `.ts`).
   - Variáveis de ambiente necessárias (`VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY` segundo memória do projeto).
   - Estado das GitHub Actions (`.github/workflows/`).
3. Liste todos os arquivos no diretório `src/assets/styles/tokens.css` para confirmar que os tokens da paleta estão preservados (eles serão a referência da paleta).
4. Verifique se a branch `style-reset` existe (resíduo das fases anteriores) — não tocar nela.
5. **REPORTE** o achado e ESPERE confirmação antes de seguir.

### Etapa 1 — Branch e estrutura

1. Garanta que está em `main` e que `main` está limpa (ou pull do remoto se necessário).
2. Crie a branch `ui-v2` a partir de `main`.
3. Crie a estrutura de pastas conforme `PROJECT.md` §3:

```
src/
├── app/
│   ├── routes/
│   ├── providers.tsx (placeholder)
│   └── root-layout.tsx (placeholder)
├── features/
│   ├── auth/
│   ├── clientes/
│   ├── equipamentos/
│   ├── servicos/
│   ├── dashboard/
│   ├── historico/
│   ├── alertas/
│   ├── orcamentos/
│   └── relatorios/
├── components/
│   └── ui/
├── lib/
├── hooks/
├── stores/
├── types/
└── styles/
    └── globals.css
```

Cada pasta de feature deve ter um `.gitkeep` se vazia.

4. Commit: `chore(reset): bootstrap ui-v2 branch e estrutura de pastas`.

### Etapa 2 — TypeScript

1. Adicione TypeScript ao projeto (`typescript`, `@types/react`, `@types/react-dom`, `@types/node`).
2. Crie `tsconfig.json` com configuração estrita:
   - `strict: true`
   - `noImplicitAny: true`
   - `strictNullChecks: true`
   - `noUncheckedIndexedAccess: true`
   - `paths` com alias `@/*` apontando para `src/*`.
3. Crie `tsconfig.node.json` para Vite config.
4. Atualize `vite.config.js` → `vite.config.ts` (se aplicável), preservando configurações do projeto antigo (porta, plugins essenciais, secrets de env).
5. **NÃO** tocar nos arquivos `.js` do projeto antigo. TS é para o código novo apenas.
6. Commit: `chore(reset): adicionar typescript com config estrita`.

### Etapa 3 — React + TanStack Router + TanStack Query

1. Instalar: `react@18`, `react-dom@18`, `@tanstack/react-router`, `@tanstack/router-devtools`, `@tanstack/react-query`, `@tanstack/react-query-devtools`.
2. Configure TanStack Router seguindo doc oficial atual em `https://tanstack.com/router/latest`. Use file-based routing.
3. Crie `src/app/providers.tsx` com `QueryClientProvider` e qualquer outro provider raiz.
4. Crie `src/app/root-layout.tsx` com layout vazio que renderiza `<Outlet />` do router.
5. Crie `src/app/routes/__root.tsx` (rota raiz).
6. Crie `src/app/routes/index.tsx` (página inicial — "Hello CoolTrack").
7. Atualize `src/main.tsx` (entry) com providers + router.
8. Atualize `index.html` (raiz) — limpe markup do projeto antigo, deixe apenas `<div id="root"></div>` e meta tags básicas.
9. Confirme que `npm run dev` mostra "Hello CoolTrack" na rota `/`.
10. Commit: `feat(reset): setup react + tanstack router + tanstack query`.

### Etapa 4 — Tailwind + tokens

1. Instalar Tailwind v3 + PostCSS + Autoprefixer.
2. Crie `tailwind.config.ts` (TypeScript) com:
   - `content`: `['./index.html', './src/**/*.{ts,tsx}']`
   - `theme.extend.colors`: paleta exata de `PROJECT.md` §5 (sem prefix, projeto novo).
   - `theme.extend.borderRadius`, `boxShadow`, `fontFamily` conforme `PROJECT.md` §5.
   - `plugins`: `tailwindcss-animate` (para shadcn/ui).
3. Crie `postcss.config.js` (autoprefixer + tailwindcss).
4. Crie `src/styles/globals.css` com:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
  body {
    @apply bg-bg text-text antialiased;
  }
}
```

5. Importe `globals.css` em `src/main.tsx`.
6. Verifique que a tela "Hello CoolTrack" agora aparece com background `#26282B` e texto branco.
7. Commit: `feat(reset): setup tailwind com tokens do design system`.

### Etapa 5 — shadcn/ui

1. Inicialize shadcn/ui via CLI seguindo doc oficial atual em `https://ui.shadcn.com/docs/installation/vite`.
2. Configure `components.json`:
   - `style: "default"`
   - `tailwind.cssVariables: false` (vamos usar nossos tokens diretos, não vars CSS).
   - `tailwind.baseColor: "neutral"` (default; será sobrescrito pelos nossos tokens).
   - `aliases`: `@/components`, `@/lib`, `@/hooks`, `@/components/ui`.
3. Adicione 1 componente de teste: `npx shadcn@latest add button`.
4. Use o `<Button>` na rota `/` para validar que está renderizando.
5. Crie `src/lib/utils.ts` com a função `cn()` padrão do shadcn (se ainda não foi criada).
6. Commit: `feat(reset): inicializar shadcn/ui com Button de teste`.

### Etapa 6 — Supabase

1. Instalar `@supabase/supabase-js`.
2. Crie `src/lib/supabase.ts` exportando o client tipado.
3. Configure variáveis de ambiente:
   - `.env.example` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (sem valores).
   - Confirme que GitHub Actions já tem essas secrets do projeto antigo (nomes podem precisar de update).
4. Crie `src/hooks/useAuth.ts` com hook básico que retorna `session` e `user` do Supabase.
5. Crie `src/types/database.ts` vazio (será gerado via Supabase CLI na Fase 3).
6. Commit: `feat(reset): setup supabase client e useAuth hook`.

### Etapa 7 — Forms + Zustand + idb

1. Instalar `react-hook-form`, `zod`, `@hookform/resolvers`, `zustand`, `idb`.
2. Crie `src/stores/ui-store.ts` com Zustand store mínimo (placeholder).
3. Não criar uso ainda — só deixar instalado e pronto.
4. Commit: `feat(reset): instalar react-hook-form, zod, zustand, idb`.

### Etapa 8 — PDF + PWA + Lucide

1. Instalar `@react-pdf/renderer`, `vite-plugin-pwa`, `lucide-react`.
2. Configure `vite-plugin-pwa` em `vite.config.ts` com manifest mínimo (nome, ícone, cor de tema do bg).
3. Não criar PDF nem PWA shell ainda — só instalado e configurado.
4. Commit: `feat(reset): instalar react-pdf, vite-plugin-pwa, lucide-react`.

### Etapa 9 — ESLint + Prettier

1. Instalar `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `prettier`, `prettier-plugin-tailwindcss`, `eslint-config-prettier`.
2. Crie `.eslintrc.cjs` com config para TS + React.
3. Crie `.prettierrc.cjs` com config padrão + plugin Tailwind.
4. Adicione scripts no `package.json`:
   - `lint`: `eslint . --ext ts,tsx`
   - `format`: `prettier --write .`
   - `format:check`: `prettier --check .`
   - `check`: `npm run lint && npm run format:check && tsc --noEmit && npm run build`
5. Rode `npm run check`. Tem que passar.
6. Commit: `chore(reset): setup eslint + prettier + scripts`.

### Etapa 10 — GitHub Actions

1. Verifique `.github/workflows/` atual.
2. Se houver workflow de deploy do projeto antigo, NÃO MEXA. Crie um novo workflow `ui-v2-preview.yml` que:
   - Roda em push pra `ui-v2`.
   - Faz `npm ci`, `npm run check`, `npm run build`.
   - Por enquanto, NÃO deploya (apenas valida que builda).
3. Commit: `ci(reset): adicionar workflow de validação para ui-v2`.

### Etapa 11 — Atualizar PROJECT.md e SESSION_LOG.md

1. Atualize `PROJECT.md` §9 com:
   - Branch ativa: `ui-v2`.
   - Último commit: SHA do último commit desta sessão.
   - Status da Fase 0: ✅ concluída.
2. Adicione entrada nova no final de `SESSION_LOG.md` com formato definido no próprio arquivo. Inclua:
   - Concluído (lista das etapas).
   - Em aberto (nada — Fase 0 fechada).
   - Próximo prompt sugerido: "Fase 1 — Auth" (referência ao plano).
   - Decisões tomadas fora do plano (se houve alguma).
   - Bugs descobertos (se houve algum).
   - Commits desta sessão (lista de SHAs).
3. Commit: `docs(reset): atualizar PROJECT.md e SESSION_LOG.md ao final da Fase 0`.

---

## Como reportar progresso

Após cada Etapa, pare e responda com:

- O que fez (lista curta).
- Arquivos modificados/criados/deletados.
- Resultado de `npm run dev`, `npm run build`, `npm run check` (linhas relevantes; stack trace se erro).
- O que pretende fazer na próxima Etapa, ANTES de fazer.
- Qualquer conflito ou ambiguidade não coberta por este prompt.

**Não improvise.** Se algo não está claro ou desviou do esperado, PARE e PERGUNTE.

---

## Validação final da Fase 0

Antes de declarar a Fase 0 fechada, confirme:

- [ ] Branch `ui-v2` criada e existe localmente.
- [ ] `npm run dev` mostra "Hello CoolTrack" estilizado com a paleta correta (bg `#26282B`, brand `#5F85DB`).
- [ ] `npm run build` builda limpo.
- [ ] `npm run check` passa (lint + format + tsc + build).
- [ ] Estrutura de pastas conforme `PROJECT.md` §3 está criada.
- [ ] shadcn/ui está inicializado e o `<Button>` renderiza.
- [ ] Supabase client está conectado (lê as env vars).
- [ ] TanStack Router renderiza a rota raiz.
- [ ] TanStack Query está configurado no provider.
- [ ] Inter font está carregando.
- [ ] GitHub Actions workflow `ui-v2-preview.yml` existe e roda.
- [ ] `PROJECT.md` §9 atualizado.
- [ ] `SESSION_LOG.md` tem entrada nova da Fase 0.
- [ ] Commits feitos (10-11 commits separados).
- [ ] Nada foi pushado (apenas commits locais).

Quando tudo verde, reporte: "Fase 0 fechada. Aguardando autorização para push e/ou Fase 1."

---

## Lembrete final

Este prompt é longo de propósito. A cada Etapa, pare e reporte. Não execute as 11 Etapas em sequência sem checkpoint.

A Fase 0 é a fundação. Cada decisão que você tomar aqui será replicada nas 13 fases seguintes. Se algo está errado, é mais barato consertar agora do que daqui 5 fases.
