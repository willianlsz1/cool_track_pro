# Mudanca 18 / CP-D - Cliente com equipamentos direto e setores sob demanda

## Objetivo

Ajustar o fluxo Cliente -> Equipamentos para que cliente simples mostre equipamentos diretamente, sem obrigar o tecnico a criar setores antes de operar.

## Estado inicial

- Branch inicial: `main`
- HEAD inicial: `fd8b3226dd4214fe3f6de3eefc3108dcff1c780b`
- Working tree inicial: limpo
- Base anterior: CP-C commitada em `refactor(flow): align primary navigation`

## Arquivos alterados

- `src/features/equipamentos/ui/renderEquip.js`
- `src/features/equipamentos/setor/setorUI.js`
- `src/features/equipamentos/__tests__/ui/renderEquip.test.js`
- `src/features/equipamentos/__tests__/setor/setorUI.test.js`
- `src/__tests__/equipamentosLegacyRender.test.js`
- `docs/flow/mudanca-18-cp-d-cliente-equipamentos-setores.md`

## Comportamento anterior

- Em plano Pro, ao abrir Equipamentos a partir de um Cliente, `renderEquip()` sempre chamava `renderSetorGridForCliente()`.
- Cliente sem setores recebia uma tela incentivando criar o primeiro setor como caminho principal.
- Equipamentos sem setor ja eram suportados pelo modelo, mas a entrada por Cliente priorizava a grade de setores.

## Comportamento novo

- Em contexto de Cliente, `renderEquip()` consulta o modelo de setores do cliente.
- Se o cliente nao tem setores, a tela cai na lista direta filtrada por `clienteId`.
- Se o cliente tem setores diretos ou derivados por equipamentos com `setorId`, a grade de setores continua sendo usada.
- Na lista direta de cliente simples, `+ Novo setor` aparece como acao secundaria e o CTA padrao de novo equipamento permanece disponivel.
- Equipamento sem setor continua valido e pode aparecer na lista direta do cliente ou na entrada `Sem setor` quando houver setores.

## Testes alterados

- `renderEquip.test.js`
  - adiciona contrato para cliente Pro sem setores renderizar lista direta;
  - preserva contrato de cliente Pro com setores renderizar grade filtrada;
  - valida que a toolbar de cliente simples mostra `+ Novo setor` como acao secundaria.
- `setorUI.test.js`
  - atualiza contrato textual para tratar setores como opcionais, nao como primeiro passo obrigatorio.
- `equipamentosLegacyRender.test.js`
  - atualiza o contrato legado para cliente sem setores renderizar lista direta, mantendo novo equipamento, novo setor secundario e limpar cliente.

## Validacao executada

- `npm run test -- src/features/equipamentos/__tests__/ui/renderEquip.test.js src/features/equipamentos/__tests__/setor/setorUI.test.js`
  - primeiro: falhou no comportamento antigo esperado pelo novo contrato;
  - depois da implementacao: passou, 12 testes.

Validacao completa da CP-D deve incluir:

- `npm run test -- src/features/equipamentos/__tests__/ui/renderEquip.test.js src/features/equipamentos/__tests__/setor/setorState.test.js src/features/equipamentos/__tests__/setor/setorUI.test.js src/features/equipamentos/__tests__/ui/renderFlatList.test.js`
  - passou, 21 testes.
- `npm run test -- src/features/equipamentos/__tests__/ui/renderEquip.test.js src/features/equipamentos/__tests__/setor/setorState.test.js src/features/equipamentos/__tests__/setor/setorUI.test.js src/features/equipamentos/__tests__/ui/renderFlatList.test.js src/__tests__/equipamentosLegacyRender.test.js`
  - passou, 32 testes.
- `npm run test -- src/__tests__/equipamentosLegacyRender.test.js`
  - passou, 11 testes.
- `npm run format`
  - passou; nao alterou arquivos fora da CP-D.
- `npm run build`
  - passou com warnings Vite conhecidos de static/dynamic import e chunks grandes.
- `npm run check`
  - primeira execucao encontrou um contrato legado antigo em `equipamentosLegacyRender.test.js`;
  - apos atualizar o contrato dentro do escopo da CP-D, passou com o warning ESLint conhecido em `src/domain/pdf/shareReport.js` e warnings Vite conhecidos.
- `git diff --check`
  - passou.

## Riscos remanescentes

- A tela global de setores Pro permanece como antes; esta CP nao revisa design amplo nem a linguagem completa dessa tela.
- O fluxo de registro de servico ainda nao foi unificado; isso fica para CP-E.
- Equipamentos sem setor continuam validos por contrato. Em cliente com setores, a entrada `Sem setor` ainda deve ser monitorada para nao parecer erro visual.

## Proximo CP recomendado

CP-E: orquestrador unico de Registrar servico, alinhando CTA do Dashboard e botao central da navegacao sem alterar PDF/share, seguranca ou schema.
