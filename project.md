# CoolTrack Pro — PROJECT.md

> **Este arquivo é a fonte da verdade do projeto.**
> Qualquer agente (Claude Code, Codex, Cursor) DEVE ler este arquivo antes de qualquer ação.
> Atualize este arquivo sempre que tomar uma decisão técnica ou de produto.

---

## 1. O que é o CoolTrack Pro

SaaS de gestão de manutenção para técnicos HVAC e refrigeração autônomos. Usuário-alvo: técnico solo que atende clientes pessoa física e empresas, registra serviços em campo (com fotos antes/depois e assinatura digital), gera relatórios PDF para envio via WhatsApp, e gerencia alertas de manutenção preventiva.

**Modelo de uso atual:** single-user (cada técnico autônomo). Multi-tenant (empresas com vários técnicos) é roadmap futuro — schema já preparado para isso (campo `user_id` em todas as tabelas vira `org_id` quando necessário).

**Contexto físico de uso:** técnico em campo, mão suja, sol forte na tela, conexão de internet ruim ou ausente. Implicação: app precisa ser PWA-ready (instalável, offline-first), com contraste alto, áreas de toque generosas, e uploads resilientes.

**Roadmap de plataforma:**

- Fase atual: PWA (web app instalável).
- Fase futura: app nativo via Capacitor (decisão tomada após validação com beta testers reais).
- Decisão hoje: construir web tomando decisões compatíveis com Capacitor desde o começo (separar acesso a câmera/GPS/storage em hooks isolados, evitar APIs web-only fora desses hooks).

---

## 2. Stack técnica

### Confirmado (não mudar sem documentar aqui)

| Camada          | Tecnologia            | Por que                                                          |
| --------------- | --------------------- | ---------------------------------------------------------------- |
| Build           | Vite                  | Mantido do projeto anterior, padrão moderno.                     |
| Linguagem       | TypeScript            | Type safety, melhor experiência de agente.                       |
| UI library      | React 18              | Já presente em 31 arquivos do projeto antigo. Migração completa. |
| Roteamento      | TanStack Router       | Type-safe, padrão moderno, substitui router custom anterior.     |
| Estado servidor | TanStack Query        | Cache automático, revalidação, sincronização entre abas.         |
| Estado cliente  | Zustand               | Simples, leve, sem boilerplate. Substitui state custom anterior. |
| Estilização     | Tailwind CSS v3       | Sem prefix (projeto novo, sem coexistência com legado).          |
| Componentes     | shadcn/ui             | Componentes copiados para o projeto, controle total.             |
| Ícones          | Lucide React          | Padrão da shadcn/ui.                                             |
| Fonte           | Inter                 | Sans-serif moderna, padrão Linear/Vercel/Notion.                 |
| Forms           | React Hook Form + Zod | RHF para controle, Zod para validação.                           |
| PDF             | @react-pdf/renderer   | Geração de PDF como componentes React.                           |
| Backend         | Supabase              | Auth + Postgres + Storage + Realtime opcional.                   |
| Storage local   | idb (IndexedDB)       | Substitui localStorage. Compatível com Capacitor.                |
| PWA             | vite-plugin-pwa       | Instalável, offline-ready.                                       |

### Decididamente NÃO usar

- **Next.js** — overkill, sem necessidade de SSR.
- **Redux** — Zustand cobre.
- **Material UI / Chakra / Mantine** — shadcn/ui é a escolha.
- **styled-components / emotion** — Tailwind cobre.
- **localStorage para dados de domínio** — usar idb.
- **!important em CSS** — proibido.
- **CSS files customizados** — apenas Tailwind utilities + `@layer components` em UM arquivo (`src/styles/globals.css`).

---

## 3. Arquitetura de pastas

```
src/
├── app/                    # Setup raiz: providers, layout, rotas
│   ├── routes/             # TanStack Router routes
│   ├── providers.tsx       # QueryClient, Theme, etc
│   └── root-layout.tsx
├── features/               # Cada feature em pasta isolada
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
│   └── ui/                 # shadcn/ui components copiados
├── lib/                    # Utilitários puros
│   ├── supabase.ts
│   ├── pdf.ts
│   ├── format.ts
│   └── validators.ts
├── hooks/                  # Hooks compartilhados
│   ├── useAuth.ts
│   ├── useDevice.ts        # camera, GPS (futuro Capacitor)
│   └── useOnlineStatus.ts
├── stores/                 # Zustand stores
│   └── ui-store.ts
├── types/                  # Tipos compartilhados (Database, etc)
│   └── database.ts         # Gerado via Supabase CLI
└── styles/
    └── globals.css         # ÚNICO arquivo CSS do projeto
```

### Estrutura de uma feature

```
features/clientes/
├── components/             # ClienteCard, ClienteForm, ClienteList
│   ├── cliente-card.tsx
│   ├── cliente-form.tsx
│   └── cliente-list.tsx
├── hooks/                  # useClientes, useCriarCliente, etc
│   ├── use-clientes.ts
│   ├── use-cliente.ts
│   └── use-cliente-mutations.ts
├── pages/                  # Páginas roteadas
│   ├── clientes-page.tsx
│   └── cliente-detail-page.tsx
├── schemas.ts              # Zod schemas
└── types.ts                # Tipos da feature
```

---

## 4. Padrões de componente (regras de ouro)

### Empty state

Toda lista vazia tem componente dedicado: ícone grande, título descritivo, descrição curta, CTA primário. **Proibido mostrar lista vazia sem empty state.**

### Loading state

Skeleton (placeholder cinza pulsante) em vez de spinner sempre que possível. Spinner apenas para ações pontuais (submit de form).

### Error state

Toda chamada Supabase trata erro com toast (curto) + (se grave) tela de erro com botão "Tentar novamente". **Proibido mostrar erro técnico cru ao usuário.**

### Forms

Sempre React Hook Form + Zod. Sempre validação inline (vermelho debaixo do campo). Sempre botão de submit desabilitado enquanto inválido. Sempre loading state durante submit.

### Cards

Sempre `bg-surface rounded-card p-4 border border-border`. Hover: `bg-surface-2 transition-colors`.

### Modais

shadcn `<Dialog>`. Sempre com título, descrição opcional, ações no footer (Cancelar à esquerda, Confirmar à direita).

### Toasts

shadcn `<Sonner>`. Verde sucesso, vermelho erro, neutro info. Curtos (3 segundos).

### Acessibilidade mínima

- Contraste AA em todo texto.
- Labels em todos os inputs (visíveis ou via `aria-label`).
- Focus visible em todos os elementos interativos.
- Botões com `aria-label` quando o texto não é claro (ex: ícone só).
- Áreas de toque mínimas de 44x44px (contexto mobile com mão suja).

---

## 5. Tokens de design

Todos definidos em `tailwind.config.ts`. Paleta confirmada com o dono do produto.

```ts
colors: {
  bg: '#26282B',           // app background
  surface: '#353941',      // cards, modais
  'surface-2': '#3E434D',  // surface elevada (hover)
  brand: '#5F85DB',
  'brand-hover': '#90B8F8',
  text: '#F4F7FB',
  'text-muted': '#C7D0E0',
  'text-faint': '#98A4B8',
  border: 'rgba(144,184,248,0.16)',
  'border-strong': 'rgba(144,184,248,0.28)',
  // status
  success: '#4ADE80',
  warn: '#FBBF24',
  error: '#FB7185',
  info: '#90B8F8',
}

borderRadius: {
  card: '12px',
  pill: '9999px',
}

fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
}

boxShadow: {
  card: '0 1px 3px rgba(0,0,0,0.3)',
  'card-hover': '0 4px 12px rgba(0,0,0,0.4)',
}
```

---

## 6. Modelo de dados Supabase

Todas as tabelas têm `user_id uuid references auth.users` (vira `org_id` no futuro multi-tenant).
Todas as tabelas têm `created_at` e `updated_at` automáticos.
RLS (Row Level Security) ativo em todas: cada usuário vê apenas seus próprios registros.

### Tabelas

```sql
clientes (
  id uuid pk,
  user_id uuid fk auth.users,
  nome text not null,
  documento text,                  -- CPF/CNPJ
  telefone text,
  email text,
  endereco jsonb,                   -- { rua, numero, cidade, uf, cep }
  observacoes text,
  created_at timestamptz,
  updated_at timestamptz
)

setores (
  id uuid pk,
  cliente_id uuid fk clientes,
  user_id uuid fk auth.users,
  nome text not null,
  observacoes text,
  created_at timestamptz
)

equipamentos (
  id uuid pk,
  cliente_id uuid fk clientes,
  setor_id uuid fk setores,
  user_id uuid fk auth.users,
  tipo text not null,               -- "Split", "Câmara fria", etc
  marca text,
  modelo text,
  numero_serie text,
  capacidade text,                  -- "12000 BTU", "5 TR"
  observacoes text,
  fotos text[],                     -- URLs Supabase Storage
  created_at timestamptz,
  updated_at timestamptz
)

servicos (
  id uuid pk,
  equipamento_id uuid fk equipamentos,
  cliente_id uuid fk clientes,
  user_id uuid fk auth.users,
  tipo text not null,               -- "Manutenção preventiva", etc
  data_servico timestamptz not null,
  descricao text,
  pecas jsonb,                      -- [{ nome, quantidade, valor_unit }]
  valor_servico numeric(10,2),
  valor_total numeric(10,2),
  fotos_antes text[],
  fotos_depois text[],
  assinatura_tecnico text,          -- URL Storage
  assinatura_cliente text,          -- URL Storage
  checklist jsonb,                  -- [{ item, marcado }]
  created_at timestamptz,
  updated_at timestamptz
)

orcamentos (
  id uuid pk,
  cliente_id uuid fk clientes,
  equipamento_id uuid fk equipamentos,
  user_id uuid fk auth.users,
  status text not null,             -- "rascunho", "enviado", "aprovado", "recusado"
  valor_total numeric(10,2),
  validade date,
  observacoes text,
  itens jsonb,
  created_at timestamptz,
  updated_at timestamptz
)

alertas (
  id uuid pk,
  equipamento_id uuid fk equipamentos,
  cliente_id uuid fk clientes,
  user_id uuid fk auth.users,
  tipo text not null,
  data_prevista date not null,
  intervalo_meses int,              -- recorrência
  observacoes text,
  status text not null,             -- "pendente", "concluido", "cancelado"
  servico_id uuid fk servicos,      -- preenchido quando vira serviço real
  created_at timestamptz
)
```

### Storage buckets

- `fotos-equipamentos` (público com URL assinada).
- `fotos-servicos` (público com URL assinada).
- `assinaturas` (privado).

---

## 7. Plano de fases

| Fase | Nome                                             | Sessões estimadas | Status      |
| ---- | ------------------------------------------------ | ----------------- | ----------- |
| 0    | Bootstrap                                        | 1-2               | ⏳ Pendente |
| 1    | Auth                                             | 1-2               | ⏳ Pendente |
| 2    | Layout + Navegação                               | 1-2               | ⏳ Pendente |
| 3    | Schema Supabase                                  | 1                 | ⏳ Pendente |
| 4    | Clientes (CRUD)                                  | 2-3               | ⏳ Pendente |
| 5    | Equipamentos (CRUD + setores + fotos)            | 2-3               | ⏳ Pendente |
| 6    | Serviços (CRUD + fotos + assinatura + checklist) | 3-4               | ⏳ Pendente |
| 7    | Geração de PDF                                   | 1-2               | ⏳ Pendente |
| 8    | Dashboard                                        | 2                 | ⏳ Pendente |
| 9    | Histórico                                        | 1-2               | ⏳ Pendente |
| 10   | Alertas                                          | 2                 | ⏳ Pendente |
| 11   | Orçamentos                                       | 2                 | ⏳ Pendente |
| 12   | Relatórios                                       | 1-2               | ⏳ Pendente |
| 13   | Polish + PWA + offline                           | 2-3               | ⏳ Pendente |

**Total estimado:** 24-32 sessões.

---

## 8. Regras de ouro (não-negociáveis)

### Disciplina de código

1. **`!important` é proibido.** Se sentir necessidade, é sinal de que está fazendo errado.
2. **CSS custom é proibido fora de `src/styles/globals.css`.** Tudo via Tailwind utilities.
3. **Feature desativada = código deletado.** Nunca comentar bloco grande "para usar depois". Git preserva história.
4. **Uma decisão, um lugar.** Tipo `Cliente` em UM arquivo. Validador de email em UM arquivo. Cor primária em UM token.
5. **Antes de criar componente novo, busque se já existe.** Antes de criar hook novo, busque se já existe. Consolidar antes de duplicar.
6. **Componente que passou de 200 linhas precisa ser quebrado.** Sem exceção.
7. **Toda operação async tem loading state e error state.** Sem exceção.
8. **Tipos `any` proibidos.** Use `unknown` se precisar de fallback.

### Disciplina de processo

9. **Toda sessão começa lendo `PROJECT.md` e última entrada de `SESSION_LOG.md`.**
10. **Toda sessão termina atualizando `SESSION_LOG.md` com entrada nova.**
11. **Reconhecimento antes de execução.** Listar arquivos relevantes, mapear o que existe, antes de modificar.
12. **Validação humana entre commits de risco.** Migração ↔ remoção ↔ deleção sempre têm checkpoint humano no meio.
13. **Não pushar para `main` sem autorização explícita do dono do produto.**
14. **Não improvisar.** Se algo não está no plano, parar e perguntar.

---

## 9. Status atual

**Fase atual:** Fase 0 (Bootstrap) — não iniciada.
**Branch ativa:** `ui-v2` (a criar).
**Último commit registrado:** [a preencher pelo agente da Fase 0].

**Decisões tomadas até hoje:**

- Stack confirmada (ver §2).
- Paleta confirmada (ver §5).
- Modelo de dados desenhado (ver §6).
- Plano de fases definido (ver §7).
- Regras de ouro estabelecidas (ver §8).

**Decisões adiadas:**

- Capacitor (depois de validação com beta testers).
- Multi-tenant (quando empresa real precisar).
- Supabase Realtime (avaliar quando dashboard estiver pronto).
- Soft delete (avaliar quando aparecer caso de uso).

---

## 10. Como atualizar este arquivo

Sempre que:

- Tomar decisão técnica nova → registrar em §2 ou §8.
- Mudar padrão de componente → atualizar §4.
- Adicionar tabela ou alterar schema → atualizar §6.
- Concluir fase ou mudar plano → atualizar §7.
- Adicionar/remover feature → atualizar §1 e §7.

**O arquivo é versionado junto com o código.** Atualizações vão no mesmo PR da mudança correspondente.
