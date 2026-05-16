# Design System/UI fase 7 - filtros mobile Equipamentos

Data: 2026-05-16

## Objetivo

Corrigir o unico achado visual da Fase 6: no mobile 390, o chip
`Sem primeiro servico` ficava parcialmente cortado dentro da faixa rolavel de
filtros de Equipamentos.

## Escopo

- Ajustar somente a faixa de filtros de Equipamentos.
- Manter os mesmos filtros, textos, estados e handlers.
- Validar novamente lista, filtro sem resultado, texto longo e detalhe com
  anexos em mobile 390, desktop 1366 e desktop 1920.

## Fora de escopo

- Redesign da lista de Equipamentos.
- Mudancas em regra de negocio, store, actions, view model ou contratos.
- Storage real, upload real, Supabase/RLS, migrations, billing real, assinatura,
  PMOC, PDF/share, WhatsApp, router global, seguranca ou React Doctor.

## Alteracao realizada

Arquivo:

- `src/app-v2/equipment/EquipmentList.tsx`

Mudanca:

- a faixa de filtros deixou de usar rolagem horizontal com
  `tw-overflow-x-auto`;
- o container passou a usar `tw-flex-wrap`, permitindo que filtros quebrem linha
  no mobile.

## Evidencias pos-ajuste

Diretorio:

`docs/rewrite/qa-design-system-ui-fase-7-equipamentos-filtros/`

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

## Resultado

| Viewport     | Cenario              | Overflow horizontal | Elementos visiveis fora da viewport | Console relevante |
| ------------ | -------------------- | ------------------- | ----------------------------------- | ----------------- |
| mobile 390   | lista                | nao                 | 0                                   | 0                 |
| mobile 390   | filtro sem resultado | nao                 | 0                                   | 0                 |
| mobile 390   | texto longo          | nao                 | 0                                   | 0                 |
| mobile 390   | detalhe com 3 anexos | nao                 | 0                                   | 0                 |
| desktop 1366 | lista                | nao                 | 0                                   | 0                 |
| desktop 1366 | filtro sem resultado | nao                 | 0                                   | 0                 |
| desktop 1366 | texto longo          | nao                 | 0                                   | 0                 |
| desktop 1366 | detalhe com 3 anexos | nao                 | 0                                   | 0                 |
| desktop 1920 | lista                | nao                 | 0                                   | 0                 |
| desktop 1920 | filtro sem resultado | nao                 | 0                                   | 0                 |
| desktop 1920 | texto longo          | nao                 | 0                                   | 0                 |
| desktop 1920 | detalhe com 3 anexos | nao                 | 0                                   | 0                 |

## Decisao

O ciclo visual de Equipamentos fica encerrado para lista, filtros, estado vazio,
texto longo e detalhe com anexos locais. O ajuste foi pequeno, restrito a uma
area e validado com screenshots/metrics.

## Proximo checkpoint recomendado

Reauditoria documental da matriz UX v1-v2 apos o fechamento visual de
Equipamentos, para escolher o proximo fluxo do app-v2 por lacuna funcional ou
visual ainda nao sensivel; manter PMOC, Supabase/RLS, migrations, storage real,
billing real, PDF/share, WhatsApp e security hardening em etapas proprias.
