# app-v2 - CP49: inventario do runtime UI legado restante

## Objetivo

Reabrir o inventario depois da remocao de CSS legado e confirmar o que ainda
impede declarar o v1 totalmente removido.

Este checkpoint e documental e de limpeza estatica. Ele nao altera runtime,
storage, router, Supabase/RLS, PDF/share, WhatsApp, upload/storage, billing,
PMOC, assinatura ou orcamento real.

## Estado verificado

- Branch: `codex/remove-v1-dashboard-last-service-react-cp3f`.
- HEAD inicial do checkpoint: `1435686`.
- Working tree inicial: limpa e sincronizada com `origin`.
- Entrada principal: `index.html` monta `src/app-v2/main.tsx` em
  `#app-v2-root`.
- `src/app-v2`, `src/core`, `src/domain`, `index.html`, `vite.config.js`,
  `package.json` e `e2e` nao referenciam `src/ui`, `src/features` ou
  `src/react` como runtime ativo.
- `src/features`, `src/react` e `src/assets/styles` nao possuem arquivos
  rastreados restantes.
- `src/ui` ainda possui 148 arquivos rastreados.
- 163 arquivos de teste ainda mencionam `src/ui` ou caminhos relativos para a
  UI legada.
- `public/img/README.md` ainda apontava para
  `src/ui/components/landingPage/template.js`, referencia obsoleta apos o corte
  para app-v2.

## Classificacao do restante em `src/ui`

Contagem por grupo de risco, com sobreposicao entre categorias:

| Grupo                              | Arquivos aproximados | Risco principal                                      | Direcao recomendada                          |
| ---------------------------------- | -------------------- | ---------------------------------------------------- | -------------------------------------------- |
| PDF/share/orcamento                | 14                   | PDF, share, token, proposta e exportacao             | CP sensivel dedicada antes de apagar         |
| Auth/account/profile               | 5                    | Auth, conta, perfil, exclusao/exportacao de dados    | Isolar depois de validar app-v2/auth atual   |
| Storage/photos/signature/nameplate | 17                   | Upload, storage, assinatura, fotos e metadados       | Nao apagar sem cobertura substituta          |
| Router/controller/shell            | 11                   | Navegacao legada e handlers ainda testados           | Remover por dominios, com gates              |
| PMOC/cliente/equipamento           | 63                   | Fluxos operacionais densos e regras misturadas a DOM | Migrar/aposentar por tela, em lotes pequenos |
| Registro/historico                 | 32                   | Registro, historico, PDF/share e WhatsApp            | CPs separados por subfluxo                   |
| Dashboard/onboarding               | 15                   | Onboarding, telemetry e estado local                 | Remover depois de confirmar nao uso publico  |
| ViewModels/contracts               | 18                   | Contratos de testes ainda usados como cobertura      | Reclassificar helpers puros ou aposentar     |

## Leitura tecnica

O app-v2 ja e a entrada principal e nao depende diretamente do runtime v1.
Porem, `src/ui` continua concentrando modulos legados que misturam renderizacao
DOM com regras operacionais e areas sensiveis. A remocao em massa ainda seria
arriscada porque apagaria cobertura de regressao antes de substituir ou
aposentar os contratos correspondentes.

O estado correto agora e:

- v2 principal: avancado;
- billing/pricing visivel: removido do produto ativo;
- CSS legado: praticamente encerrado no repositorio rastreado;
- runtime v1: ainda em desmontagem, com 148 arquivos e forte cobertura de
  testes legados.

## Proximo CP recomendado

Executar o proximo corte em uma area de baixo acoplamento e baixa sensibilidade:

1. Limpar referencias publicas/documentais obsoletas que apontam para templates
   v1 removidos.
2. Depois, escolher um lote pequeno de `src/ui/components` sem PDF/share,
   assinatura, fotos, storage, auth, PMOC ou router.
3. Para cada arquivo candidato, exigir:
   - `rg` sem consumidor runtime ativo fora do proprio teste;
   - teste removido ou migrado com justificativa;
   - gate de aposentadoria atualizado;
   - validacao focada;
   - `npm run format`, `npm run build`, `npm run check`.

## Validacao esperada

```bash
npm run format:check
git diff --check
git diff --cached --check
```

Como este checkpoint nao altera codigo runtime, build/check completos ficam
recomendados para o proximo CP de remocao de codigo.
