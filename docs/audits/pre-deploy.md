# Pre-Deploy Audit — CoolTrack Pro

Rode antes de cada release pública (deploy para `willianlsz1.github.io/Mange_System_Cool_Track/`).
**Tempo estimado:** 15–20 min.
**Bloqueia deploy se:** qualquer item de Pre-flight, Secrets, RLS ou JWT desmarcado.

> **Ambiente shell:** os comandos `grep`, `find`, `du` etc. assumem **bash**.
> No Windows, use **Git Bash** (vem com Git for Windows) ou **WSL** — é o caminho mais simples.
> Se preferir PowerShell, há um bloco equivalente abaixo de cada comando bash.

---

## 0. Pre-flight (BLOQUEANTE — roda primeiro)

```bash
# Roda lint + format + testes unitários + build em sequência.
# Se qualquer passo falhar, PARE aqui. Não siga para os próximos.
npm run check
```

- [ ] `npm run check` termina com código 0
- [ ] Nenhum teste em `__tests__/` está marcado como `.skip` ou `.only` que não deveria

> Se quiser cobertura E2E, rode também `npm run test:e2e:ci` (mais lento).
> Para releases que mexem em fluxo crítico (auth, sync, PDF), E2E é obrigatório.

## 1. Secrets & Env Vars

> ⚠️ **Importante:** os greps abaixo **excluem `__tests__/`** porque testes podem usar URLs/JWTs
> mockados (ex: `https://mock.supabase.co`) que são falsos positivos. O foco do check é o
> bundle de produção.

```bash
# nenhum .env no histórico
git log --all --full-history -- .env

# nenhum URL/key hardcoded — saída vazia = OK
grep -rE "supabase\.co|eyJ[A-Za-z0-9_-]{20,}" src/ --include="*.js" | grep -v "__tests__"

# service_role NUNCA pode aparecer como chave/secret no front.
# O unico hit permitido fora de testes e a validacao defensiva em supabaseConfig.js.
grep -r "service_role" src/ --include="*.js" | grep -v "__tests__" | grep -v "supabaseConfig.js"
```

**Equivalente PowerShell:**

```powershell
# nenhum .env no histórico
git log --all --full-history -- .env

# nenhum URL/key hardcoded — saída vazia = OK
Get-ChildItem -Path src -Recurse -File -Filter *.js |
  Where-Object { $_.FullName -notmatch '__tests__' } |
  Select-String -Pattern 'supabase\.co|eyJ[A-Za-z0-9_-]{20,}'

# service_role NUNCA pode aparecer como chave/secret no front.
# O unico hit permitido fora de testes e a validacao defensiva em supabaseConfig.js.
Get-ChildItem -Path src -Recurse -File -Filter *.js |
  Where-Object { $_.FullName -notmatch '__tests__' -and $_.Name -ne 'supabaseConfig.js' } |
  Select-String -Pattern 'service_role'
```

> Se algum hit aparecer **fora** de `__tests__/` e fora da validação defensiva
> `src/core/supabaseConfig.js`, é leak real e bloqueia o deploy. Hits em
> `__tests__/` (ex: `mock.supabase.co`) são esperados — são stubs de teste, não
> vão para o bundle.

- [ ] `.env` está no `.gitignore` e nunca foi commitado
- [ ] GitHub Actions tem `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` configurados em Secrets
- [ ] Nenhum URL/JWT hardcoded no código
- [ ] `service_role` não aparece em `src/`, exceto na validação defensiva de `src/core/supabaseConfig.js`
- [ ] Apenas `anon` key é usada no front
- [ ] Nenhum `console.log` vazando token de sessão

## 2. Supabase RLS

No Supabase Dashboard → Authentication → Policies, para cada tabela em uso (`equipamentos`, `registros`, `alertas`, `profiles`, etc.):

- [ ] RLS está **enabled** em TODAS as tabelas (não só nas "principais")
- [ ] SELECT policy filtra por `auth.uid() = user_id`
- [ ] INSERT policy tem `WITH CHECK (auth.uid() = user_id)`
- [ ] UPDATE/DELETE policy usa `USING (auth.uid() = user_id)`
- [ ] Tabela de seed/demo (se existir) está separada e não vaza para usuário real

**Teste prático (5 min):**

1. Crie 2 contas: `userA@test.com` e `userB@test.com`
2. Logado como A, crie um registro
3. Logado como B, tente fazer `supabase.from('registros').select('*')`
4. Resultado esperado: array vazio (não 401, não dados de A)

## 3. Storage Buckets

- [ ] Buckets de fotos e assinaturas criados no Supabase Storage
- [ ] Buckets são **private** (não public)
- [ ] Policy de upload restringe path por `auth.uid()` (ex: `{userId}/photo-xxx.jpg`)
- [ ] Front usa `createSignedUrl` com TTL curto (não `getPublicUrl`) para arquivos privados
- [ ] Limite de tamanho de upload configurado (ex: 5MB por foto)

> ⚠️ Bug crítico atual: fotos estão em base64 no Postgres. Migrar para Storage **antes** do beta.

## 4. JWT & Auth

- [ ] Login, logout e forgot-password testados manualmente
- [ ] `supabase.auth.onAuthStateChange` limpa estado no logout
- [ ] Sessão expirada redireciona para login (não tela em branco)
- [ ] Nenhum decode manual de JWT no código (sempre via SDK)
- [ ] Nenhum bypass com flags tipo `--no-verify` ou `skip-auth`

## 5. Sync Engine & Service Worker

> Estes dois pontos são específicos do CoolTrack Pro (offline-first com SW + fila de delete).

- [ ] Logout → Login → estado de sync chega em `synced` (nada pendente após relogin)
- [ ] Deletion queue (`localStorage`) está vazia ao final do smoke test (sem fila órfã)
- [ ] Nova versão do Service Worker carrega sem invalidar sessão de usuário existente
- [ ] Toast "Atualização disponível" aparece e funciona após push de nova build
- [ ] Migrar fotos legadas (base64 → Storage) testado em conta com dados antigos

## 6. Smoke Test (manual, em janela anônima)

- [ ] Cadastro de novo usuário funciona end-to-end
- [ ] Onboarding 3 etapas completa sem erro de console
- [ ] Criar registro com foto + assinatura
- [ ] Editar registro existente preserva fotos originais
- [ ] PDF gerado abre e contém os dados corretos
- [ ] PDF PMOC numera sequencialmente (`PMOC YYYY/01`, `02`...) sem pular
- [ ] Logout limpa storage e redireciona para login
- [ ] Recarregar (F5) em qualquer view não quebra a sessão

## 7. Build & Deploy

```bash
# build já rodou no passo 0 (npm run check), mas confira o tamanho
du -sh dist/                      # Linux/macOS / Git Bash
npm audit --production --audit-level=high
```

**Equivalente PowerShell:**

```powershell
# tamanho total da pasta dist em MB
"{0:N2} MB" -f ((Get-ChildItem dist -Recurse -File |
  Measure-Object -Property Length -Sum).Sum / 1MB)

npm audit --production --audit-level=high
```

- [ ] Build sem warnings críticos
- [ ] `npm audit --audit-level=high` sem vulnerabilidades **high** ou **critical**
- [ ] `dist/` < 2MB total
- [ ] Tag de versão criada: `git tag v0.x.y && git push --tags`
- [ ] CHANGELOG.md atualizado

---

## Prompt para Claude

Cole isto no chat junto com a saída do comando de tree (ver README) + os arquivos `src/core/supabase.js`, `src/core/auth.js`, `src/core/storage.js`:

> Aja como auditor de segurança revisando o CoolTrack Pro (Vite + Vanilla JS + Supabase, prestes a abrir beta).
>
> Analise APENAS riscos reais para um SaaS multi-tenant. Ignore "best practices" genéricas.
>
> Foque em:
>
> 1. Exposição de secrets/keys no bundle final
> 2. Uso de `service_role` em código cliente
> 3. Queries Supabase que dependem só de filtro front-end (vulneráveis sem RLS)
> 4. Inputs de usuário que viram path/URL sem sanitização
> 5. Token/sessão vazando em logs ou storage inseguro
> 6. **Plan gate bypass** — caminhos onde `setCachedPlan`/`isCachedPlanPro` pode ser contornado por usuário sem assinatura ativa
> 7. **RLS false-negative** — qualquer `supabase.from(...)` que assume RLS ligada mas não filtra `user_id` no front (se RLS for desabilitada por engano, vaza)
>
> Para cada achado, retorne em formato de tabela:
> | Arquivo:linha | Severidade (P0/P1/P2) | Exploit hipotético | Fix exato |
>
> Limite a 10 achados, ordenados por severidade. Se não houver P0, diga claramente.

---

## Output Final

Salvar em `docs/audits/reports/YYYY-MM-DD-pre-deploy.md`:

- Checklist preenchido
- Tabela de achados do prompt
- Decisão: **GO / NO-GO** para deploy
- Se NO-GO: lista do que precisa fechar antes
- Versão (tag git) que foi auditada
