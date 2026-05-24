# app-v2 - CP51 - Areas sensiveis: remover legado e recriar nativo

## 1. Objetivo

Registrar a decisao de nao reutilizar os arquivos sensiveis do app v1 para o
app-v2. PDF/share, assinatura, fotos, storage e PMOC devem sair como legado e
ser recriados depois com arquitetura propria do app-v2.

Este CP e documental. Ele nao remove runtime, nao altera storage real, nao muda
RLS, nao troca PDF/share, nao cria upload novo e nao ativa PMOC real.

## 2. Decisao

Antes, o plano tratava essas areas como bloqueios que precisavam ser isolados
ou preservados antes da remocao do v1. A nova decisao e:

- nao adaptar componentes, helpers ou fluxos sensiveis do v1 para o app-v2;
- remover o legado por checkpoints pequenos, com evidencia de que o app-v2 nao
  depende dele;
- abrir reconstrucoes app-v2-native em etapas proprias, uma area por vez;
- manter apenas contratos temporarios que provem ausencia de dependencia do
  app-v2 ou protegem uma remocao em andamento.

## 3. Areas afetadas

### 3.1 PDF/share

Destino: remover pipeline legado e recriar depois.

Reconstrucao futura:

- definir um contrato de geracao de documento a partir de dados normalizados do
  app-v2;
- separar preview, geracao, download e compartilhamento;
- evitar acoplamento com DOM legado, `vendor-pdf` e handlers de WhatsApp v1;
- validar com testes de payload, renderizacao minima e fallback de erro.

### 3.2 Assinatura

Destino: remover componentes e storage de assinatura do v1.

Reconstrucao futura:

- criar componente app-v2 isolado para coletar assinatura;
- salvar o artefato por uma porta explicita, sem depender de helpers v1;
- tratar consentimento, limpeza, edicao e erro de persistencia como estados
  declarados;
- validar com testes de estado e contrato de payload.

### 3.3 Fotos

Destino: remover componentes e fluxos de foto do v1.

Reconstrucao futura:

- criar fluxo app-v2 para anexos/fotos por equipamento e servico;
- definir adapter de upload/local fallback separado da UI;
- limitar tamanho, tipo e erros de leitura em regra propria;
- validar com testes de selecao, remocao, erro e payload.

### 3.4 Storage

Destino: remover storage legado ligado ao v1 quando os consumidores forem
aposentados.

Reconstrucao futura:

- manter app-v2 por portas/readers/writers explicitos;
- separar armazenamento local, Supabase e cache offline;
- nao reutilizar chaves ou payloads v1 sem decisao dedicada;
- validar migracao e fallback antes de ativar qualquer storage real.

### 3.5 PMOC

Destino: remover componentes e atalhos PMOC legados junto com seus fluxos v1.

Reconstrucao futura:

- redesenhar PMOC como dominio app-v2, nao como extensao do relatorio v1;
- definir entidades, ciclos, checklist, evidencias e relatorios antes da UI;
- separar PMOC operacional de PDF/share;
- validar com testes de dominio e jornadas app-v2.

## 4. Regras para remocao

- Um CP nao deve remover mais de uma area sensivel quando houver risco de
  acoplamento cruzado.
- Antes de apagar, rodar `rg` para provar consumidores ativos.
- Se o consumidor estiver apenas em teste legado, aposentar ou substituir o
  teste no mesmo CP.
- Se o consumidor estiver em app-v2, core ou domain, parar e abrir CP de
  desacoplamento antes de remover.
- Nao editar `package.json`, `package-lock.json`, Vite, router, RLS ou schema
  junto com remocao visual/legada.

## 5. Ordem recomendada

1. Documentar a decisao e atualizar o plano principal de remocao v1.
2. Remover `authscreen`/telas v1 de autenticacao apenas se o app-v2 continuar
   provado por harness autenticado e entrada principal.
3. Remover blocos de dashboard/conta v1 que chamam install/push/overflow sem
   equivalencia necessaria no app-v2.
4. Remover fotos e assinatura legadas por fluxo de Registro/Equipamentos,
   preservando apenas os gates de ausencia no app-v2.
5. Remover PDF/share legado em CP dedicado, sem tentar reaproveitar
   `vendor-pdf`.
6. Remover PMOC legado depois de separar o que e historico documental do que e
   runtime.
7. Criar planos de reconstrucao app-v2-native para cada area, na ordem de valor
   operacional.

## 6. Validacao deste CP

Como este CP e documental:

```bash
npm run format:check
git diff --check
git diff --cached --check
```

Os CPs de remocao posteriores devem rodar testes focados da area removida,
`npm run format`, `npm run build` e `npm run check`.
