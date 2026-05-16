# Design System/UI fase 6 - QA visual Equipamentos

Data: 2026-05-16

## Objetivo

Executar QA visual real da area de Equipamentos do app-v2 em browser, com
evidencias em mobile 390, desktop 1366 e desktop 1920, antes de qualquer ajuste
visual de runtime.

## Escopo

- Abrir `src/app-v2/preview.html` no servidor Vite local.
- Navegar para Equipamentos no app-v2.
- Capturar lista, estado vazio por filtro sem resultado, lista com texto longo
  e detalhe com 3 anexos locais.
- Medir overflow horizontal, elementos visiveis fora da viewport, truncamento de
  texto, quantidade de cards, estado vazio e detalhe com anexos.

## Fora de escopo

- Alterar runtime nesta fase.
- Implementar storage real, upload real, Supabase/RLS, migrations, billing real,
  assinatura, PMOC, PDF/share, WhatsApp, router global, seguranca ou React
  Doctor.
- Reabrir redesign amplo.
- Testar upload/camera/arquivo real.

## Evidencias geradas

Diretorio:

`docs/rewrite/qa-design-system-ui-fase-6-equipamentos/`

Arquivos:

- `mobile-390-list.png`
- `mobile-390-filter-empty.png`
- `mobile-390-long-text.png`
- `mobile-390-detail-attachments.png`
- `desktop-1366-list.png`
- `desktop-1366-filter-empty.png`
- `desktop-1366-long-text.png`
- `desktop-1366-detail-attachments.png`
- `desktop-1920-list.png`
- `desktop-1920-filter-empty.png`
- `desktop-1920-long-text.png`
- `desktop-1920-detail-attachments.png`
- `metrics.json`

## Resultado resumido

| Viewport     | Cenario              | Overflow horizontal da pagina | Observacao                                                                                      |
| ------------ | -------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------- |
| mobile 390   | lista                | nao                           | filtro `Sem primeiro servico` fica parcialmente fora da area visivel por causa da faixa rolavel |
| mobile 390   | filtro sem resultado | nao                           | estado vazio aparece corretamente                                                               |
| mobile 390   | texto longo          | nao                           | texto longo e truncado sem quebrar layout                                                       |
| mobile 390   | detalhe com 3 anexos | nao                           | detalhe e anexos renderizam sem overflow                                                        |
| desktop 1366 | lista                | nao                           | lista renderiza em duas colunas                                                                 |
| desktop 1366 | filtro sem resultado | nao                           | estado vazio aparece corretamente                                                               |
| desktop 1366 | texto longo          | nao                           | texto longo e truncado sem quebrar layout                                                       |
| desktop 1366 | detalhe com 3 anexos | nao                           | coluna lateral de anexos permanece legivel                                                      |
| desktop 1920 | lista                | nao                           | lista permanece alinhada                                                                        |
| desktop 1920 | filtro sem resultado | nao                           | estado vazio aparece corretamente                                                               |
| desktop 1920 | texto longo          | nao                           | texto longo e truncado sem quebrar layout                                                       |
| desktop 1920 | detalhe com 3 anexos | nao                           | detalhe permanece legivel                                                                       |

## Achados

### Aprovado

- Nao houve overflow horizontal da pagina nos 12 cenarios.
- Estado vazio por filtro sem resultado apareceu em todos os viewports.
- Detalhe com 3 anexos locais renderizou sem overflow horizontal.
- Texto longo em cards foi truncado em vez de empurrar layout.
- Console nao apresentou erro ou page error; apenas mensagens normais de Vite e
  React DevTools em desenvolvimento.

### Achado visual controlado

No mobile 390, a faixa de filtros da lista usa rolagem horizontal. O chip
`Sem primeiro servico` fica parcialmente cortado na borda direita. Isso nao cria
overflow horizontal da pagina porque esta contido no rail rolavel, mas e uma UX
fraca: o usuario pode nao perceber que existe filtro completo alem da borda.

Classificacao:

- severidade: baixa;
- tipo: refinamento visual pequeno;
- risco funcional: baixo;
- area unica: `src/app-v2/equipment/EquipmentList.tsx`;
- nao exige storage, Supabase/RLS, migrations, PMOC, PDF/share, billing ou
  redesign amplo.

## Decisao

Equipamentos passa no QA visual de pagina para lista, estado vazio, texto longo
e detalhe com anexos. O unico ajuste recomendado e pequeno e deve ficar restrito
a faixa de filtros no mobile.

## Proximo checkpoint recomendado

Design System/UI fase 7: ajustar somente a faixa de filtros de Equipamentos no
mobile para evitar chip parcialmente cortado, preferindo quebra de linha ou
comportamento equivalente sem overflow horizontal de pagina; validar novamente
mobile 390, desktop 1366 e desktop 1920; sem storage real, Supabase/RLS,
migrations, PMOC, PDF/share, billing real ou redesign amplo.
