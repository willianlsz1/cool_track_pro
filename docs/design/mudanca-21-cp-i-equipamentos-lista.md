# Mudanca 21 / CP-I - Aba Equipamentos compact-premium

## Decisao visual

A aba Equipamentos passa a usar a base branco/azul aprovada no detalhe CP-H, limitada ao conteudo de `#view-equipamentos`.

O shell global, sidebar e topbar continuam fora do escopo.

## Referencia aprovada

O prototipo descartavel aprovado foi a variacao `compact-premium` de:

`src/features/equipamentos/ui/__prototype__/equipment-list-cp-i-mockup.html`

O prototipo foi removido antes da implementacao para manter o CP pequeno e evitar uso acidental como producao.

## Regras aplicadas

- Foto do equipamento fica como miniatura contida a esquerda do card.
- Card inteiro continua abrindo o detalhe do equipamento.
- CTA separado continua registrando servico com `data-action="go-register-equip"` e `data-id`.
- Filtros usam pills claras, com cores semanticas preservadas para atencao, critico e vencido.
- Setores usam a mesma base branco/azul, mas como containers operacionais.
- Verde, ambar e vermelho ficam restritos a status, risco, saude e perigo.

## CSS

O CSS novo fica em:

`src/assets/styles/equipment-list-cp-i.css`

Ele e carregado depois de `equipment-detail-cp-h.css` e fica escopado em:

`body:not(.landing-active) #view-equipamentos`

## Limpeza CSS

CP-I.1 removeu do `redesign.css` apenas seletores antigos explicitamente presos a `#view-equipamentos` que forcavam tema dark na aba:

- `body:not(.landing-active) #view-equipamentos .setor-card .setor-card__nome`
- `body:not(.landing-active) #view-equipamentos .setor-card__nome`
- `body:not(.landing-active) #view-equipamentos .setor-card--fallback .setor-card__nome`
- `body:not(.landing-active) #view-equipamentos .equip-hero`
- `body:not(.landing-active) #view-equipamentos .page-toolbar`
- `body:not(.landing-active) #view-equipamentos .equip-search-row`
- `body:not(.landing-active) #view-equipamentos .equip-filter`
- `body:not(.landing-active) #view-equipamentos .equip-filter--active`
- `body:not(.landing-active) #view-equipamentos .equip-card`
- `body:not(.landing-active) #view-equipamentos .setor-card`
- `body:not(.landing-active) #view-equipamentos .equip-card__primary`
- `body:not(.landing-active) #view-equipamentos .setor-card__meta`
- `body:not(.landing-active) #view-equipamentos .setor-card__footer`

Continuam neutralizados no CSS CP-I.1, sem remocao global, os estilos compartilhados de `.form-control`, `.search-bar`, `.empty-state`, `.equip-card` e `.setor-card` que ainda sao usados fora da aba Equipamentos.

## Proximo CP recomendado

CP-J: validar a mesma linguagem branco/azul em Clientes ou Servicos, escolhendo uma tela por vez.
