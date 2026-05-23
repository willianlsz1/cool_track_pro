# Mudanca 21 / CP-H - Detalhe do equipamento branco/azul

## Objetivo

Aplicar o consenso visual aprovado para o detalhe do equipamento, mantendo o fluxo atual como modal/painel e sem alterar comportamento funcional.

## Decisoes aplicadas

- Base visual do detalhe: branco/azul.
- Estados continuam semanticos: verde, ambar e vermelho para saude, risco, alerta e perigo.
- Foto tem prioridade quando existe, mas fica contida para nao esconder CTA e PMOC.
- Sem foto, a hierarquia volta para identificacao, PMOC e CTA.
- Desktop usa leitura mais premium, mas ainda operacional.
- Mobile prioriza campo/tecnico, com foto curta, dados essenciais e CTA cedo.
- O detalhe continua modal/painel, sem virar pagina.
- CTA rapido na identificacao e CTA contextual no PMOC usam o mesmo texto dinamico quando a acao e a mesma.

## Hierarquia preservada

1. Foto/identificacao.
2. PMOC/Preventiva + CTA.
3. Saude/risco.
4. Historico.
5. Detalhes tecnicos recolhidos.

## Implementacao

- `src/features/equipamentos/ui/detail.js`
  - Adiciona classe de escopo `eq-detail-view--cp-h`.
  - Marca o CTA contextual com `eq-pmoc-context__cta`.
  - Renderiza fallback PMOC `muted` quando nao ha contexto PMOC, preservando CTA `go-register-equip`.
- `src/assets/styles/equipment-detail-cp-h.css`
  - CSS dedicado carregado apos `redesign.css`.
  - Escopo fechado em `body:not(.landing-active) #modal-eq-det .eq-detail-view--cp-h`.
  - Reforca camada do lightbox acima do detalhe.
- `src/features/equipamentos/__tests__/ui/detail.test.js`
  - Cobre hierarquia, CTA duplicado/dinamico, detalhes recolhidos e renderizacao com/sem foto.

## Contratos preservados

- `data-action="go-register-equip"` e `data-id`.
- Acao de fotos/lightbox.
- Botao de voltar/fechar do modal.
- Estrutura geral do modal/painel.
- Detalhes tecnicos em `details`, sem `open` por padrao.

## Riscos remanescentes

- O app ainda tem tema global escuro e `redesign.css` possui muitas regras historicas. A CP-H isola o detalhe, mas a transicao visual global ainda precisa CPs dedicados.
- A validacao visual manual deve confirmar contraste real em equipamentos com fotos muito claras/escuras.
- O fallback PMOC sem contexto usa texto generico de servico; se o dominio quiser copy mais especifica, tratar em CP pequeno de microcopy.

## Proximo CP recomendado

Validar visualmente a CP-H em desktop e mobile com dados reais e, depois, escolher a proxima tela da migracao branco/azul.
