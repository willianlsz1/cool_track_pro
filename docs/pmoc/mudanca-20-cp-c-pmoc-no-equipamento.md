# Mudança 20 / CP-C — PMOC no equipamento

## Objetivo

Facilitar o uso do PMOC no contexto do equipamento, mostrando status preventivo/PMOC, última preventiva, próxima preventiva e ação contextual para registrar preventiva.

## Estado inicial

- Branch: `main`
- HEAD inicial: `4894bea04066e2e8611979c2505fe7548f4993b6`
- Working tree inicial: limpo
- Base: Mudança 20 / CP-B com contrato documental de PMOC contextual.

## Arquivos alterados

- `src/domain/pmoc/serviceType.js`
- `src/features/equipamentos/ui/detailModel.js`
- `src/features/equipamentos/ui/detail.js`
- `src/__tests__/pmocServiceType.test.js`
- `src/features/equipamentos/__tests__/ui/detailModel.test.js`
- `src/features/equipamentos/__tests__/ui/detail.test.js`
- `docs/pmoc/mudanca-20-cp-c-pmoc-no-equipamento.md`

## Comportamento anterior

O detalhe do equipamento já mostrava rotina preventiva e próxima preventiva dentro da ficha técnica. O técnico precisava expandir detalhes ou interpretar fatores de risco para entender a situação preventiva.

Não havia um bloco contextual explícito de PMOC/preventiva com última preventiva, próxima preventiva, status e CTA direto para registrar preventiva.

## Comportamento novo

O detalhe do equipamento passa a renderizar um bloco contextual "PMOC / Preventiva" com:

- status contextual;
- periodicidade preventiva;
- última preventiva;
- próxima preventiva;
- ação recomendada;
- CTA "Registrar preventiva".

O CTA usa o contrato existente `data-action="go-register-equip"` com `data-id` do equipamento, que já encaminha para `startServiceRegistration({ equipId })` pelos handlers atuais.

## Estados exibidos no equipamento

Estados técnicos usados no model:

- `sem_cronograma`: sem periodicidade e sem agenda preventiva útil;
- `sem_registro`: há periodicidade/agenda, mas nenhum registro preventivo/PMOC;
- `em_dia`: próxima preventiva futura fora da janela de atenção;
- `atencao`: próxima preventiva dentro da janela de atenção;
- `vencido`: próxima preventiva vencida;
- `nao_aplicavel`: fallback técnico para ausência de contexto.

Labels exibidos:

- Sem cronograma;
- Sem registro;
- Em dia;
- Atenção;
- Vencido;
- Não aplicável.

## Helper criado

Foi criado o helper puro `src/domain/pmoc/serviceType.js`, usado imediatamente pelo model do detalhe do equipamento:

- `isPreventivaLikeServiceType(tipo)`;
- `isPmocLikeServiceType(tipo)`;
- `isPreventivaOrPmocServiceType(tipo)`.

O helper cobre os termos do contrato da CP-B para o uso contextual desta CP e evita classificar corretiva como preventiva/PMOC por texto incidental.

Divergência remanescente: os detectores antigos em outros pontos do app ainda não foram substituídos. Essa troca deve ser feita em CP dedicada, com testes focados, para evitar regressão em alertas, Registro ou relatórios.

## Preservado

- Registro comum não foi alterado nem bloqueado.
- Checklist PMOC no Registro não foi alterado.
- PDF técnico comum não foi alterado.
- PDF PMOC formal não foi alterado.
- Cota `pdf_export` da Mudança 19 não foi alterada.
- Plano Pro continua dono dos recursos avançados/formais.
- Free/Plus apenas veem orientação contextual básica no equipamento.
- Supabase/RLS/migrations, segurança, navegação principal, CSS amplo e dependências não foram alterados.

## Testes alterados/adicionados

- `src/__tests__/pmocServiceType.test.js`
  - Cobre detecção de preventiva, PMOC e exclusão de corretiva.
- `src/features/equipamentos/__tests__/ui/detailModel.test.js`
  - Cobre `pmocContext` e estados `sem_cronograma`, `sem_registro`, `em_dia`, `atencao` e `vencido`.
- `src/features/equipamentos/__tests__/ui/detail.test.js`
  - Cobre renderização do bloco contextual e CTA "Registrar preventiva".

## Validação executada

- `npm run test -- src/__tests__/pmocServiceType.test.js src/features/equipamentos/__tests__/ui/detailModel.test.js src/features/equipamentos/__tests__/ui/detail.test.js`
- `npm run format`
- `npm run build`
- `npm run check`
- `git diff --check`

## Riscos remanescentes

- Outros detectores de preventiva/PMOC ainda existem e continuam divergentes até CP futura.
- O bloco usa classes novas sem uma fase de refinamento visual ampla; design fino fica para fase própria.
- Alertas e histórico ainda não usam o novo helper.
- PMOC formal/PDF continua área sensível e deve permanecer isolado até CP-E.
- A descoberta do checklist PMOC no Registro ainda será tratada na CP-D.

## Próximo CP recomendado

CP-D — Checklist PMOC no Registro:

- melhorar descoberta do checklist quando tipo preventiva/PMOC for selecionado;
- preservar soft-required;
- preservar registro comum;
- manter checklist completo como Pro;
- não alterar PDF, WhatsApp, cota `pdf_export` ou pós-save fora do necessário.
