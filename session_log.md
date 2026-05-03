# CoolTrack Pro — SESSION_LOG.md

> **Diário de bordo do projeto.**
> Cada sessão de Claude Code, Codex ou outro agente termina com uma entrada nova abaixo.
> Próxima sessão lê a última entrada antes de começar.
>
> **Formato da entrada:**
>
> ```
> ## [data] — Sessão [N] — [agente]
> ### Fase: [número e nome]
> ### Concluído: [bullets curtos]
> ### Em aberto: [bullets curtos, ou "nada"]
> ### Próximo prompt sugerido: [resumo de 1 linha + referência ao plano]
> ### Decisões tomadas: [se houve alguma fora do plano]
> ### Bugs descobertos: [se houve, ou "nenhum"]
> ### Commits desta sessão: [SHAs ou descrição]
> ```

---

## 2026-05-03 — Sessão 0 — Documentação estratégica

### Fase: pré-Fase 0

### Concluído

- Decidido fazer Reset A (refazer só a UI, manter Supabase Auth como único non-negotiable).
- Stack técnica final escolhida e registrada em `PROJECT.md` §2.
- Paleta visual confirmada (4 cores baseadas em tokens.css existente).
- 5 referências visuais destiladas em direção estética: "Linear para HVAC".
- Modelo de dados Supabase desenhado (7 tabelas + 3 buckets de Storage).
- Plano em 13 fases (24-32 sessões estimadas).
- Regras de ouro (14 pontos) consolidadas em `PROJECT.md` §8.
- Workflow de troca entre agentes (Claude Code ↔ Codex ↔ outros) definido via `PROJECT.md` + `SESSION_LOG.md` + prompt template.

### Em aberto

- Fase 0 (Bootstrap) ainda não iniciada.
- Branch `ui-v2` ainda não criada.
- Repo ainda contém o estado atual com migração CSS parcial (3 fases concluídas em `style-reset`).

### Próximo prompt sugerido

Iniciar Fase 0 (Bootstrap) em uma nova sessão de Claude Code. Prompt completo em `prompts/fase-0-bootstrap.md`.

### Decisões tomadas

- **Repo:** continuar no repo atual em branch `ui-v2`, não criar repo novo. Mantém histórico, GitHub Actions, e secrets já configurados.
- **Fonte:** Inter (não Geist).
- **Caminho de plataforma:** Caminho 4 (web agora compatível com Capacitor depois). Adiada decisão de nativo até validação com beta.
- **Soft delete:** não incluir agora. Avaliar quando aparecer caso de uso.
- **Realtime:** não incluir na Fase 0. Avaliar quando dashboard estiver pronto.

### Bugs descobertos

Nenhum (sessão de planejamento, sem código).

### Commits desta sessão

Nenhum. Os 3 documentos (`PROJECT.md`, `SESSION_LOG.md`, `prompts/fase-0-bootstrap.md`) serão adicionados pelo agente da Fase 0.

---
