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

## CP-I.2 - Pagina nativa e hierarquia

CP-I.2 corrigiu a sensacao de painel/modal gigante na aba Equipamentos.

Mudancas estruturais:

- O header da pagina fica antes dos filtros e concentra titulo/subtitulo/acoes.
- `#equip-filters`, `#equip-context-chip`, busca e toggle foram agrupados em `.equip-operational-bar`.
- A barra operacional agrupa os controles sem desenhar uma moldura propria; busca, filtros e toggle mantem suas superficies individuais.
- `#view-equipamentos` deixou de desenhar um fundo proprio em bloco; a superficie clara vem do workspace da rota.
- Grids de setores e equipamentos passaram a usar `auto-fill` com `minmax(min(100%, ...), 1fr)` para suportar zoom e larguras intermediarias sem esticar um item unico como faixa larga.
- Sombras de cards e vazios foram reduzidas para parecerem conteudo de pagina, nao janelas encaixadas.

CSS antigo removido nesta etapa:

- Removido o breakpoint CP-I que forçava `.lista-equip--grid` para duas colunas em `max-width: 1180px`; o grid fluido com `auto-fill` substitui essa regra com menor risco em zoom.

## CP-I.3 - Acabamento nativo

CP-I.3 reforcou a pagina Equipamentos como tela nativa do app, sem alterar regras de negocio ou contratos publicos.

Mudancas visuais:

- Header ganhou hierarquia mais forte com icone CSS, titulo/subtitulo e divisor sutil.
- A barra operacional passou a organizar toggle, busca e filtros em uma linha coesa no desktop.
- A busca fica visivel tambem na visao de setores, evitando a sensacao de controles soltos.
- Filtros perderam sombra/moldura residual e ficam como pills diretamente na toolbar.
- Chips de equipamentos dentro dos setores ficaram mais legiveis.
- Estado de setor vazio recebeu fundo claro intencional e texto com mais contraste.
- Banner de onboarding e superficies antigas ficam neutralizados quando ja ha cards renderizados.

CSS removido ou neutralizado nesta etapa:

- Neutralizado `body:not(.landing-active) #view-equipamentos .equip-operational-bar:has(.search-bar[style*='display: none'])` para manter a busca visivel e a toolbar em tres zonas.
- Neutralizado `body:not(.landing-active) #view-equipamentos:has(.setor-card, .equip-card) > #onboarding-banner` para esconder banner residual quando existe conteudo real.
- Neutralizadas sombras antigas em `body:not(.landing-active) #view-equipamentos .equip-filters` e `.page-toolbar`.
- Nenhum seletor global foi removido nesta etapa; seletores compartilhados permanecem como divida tecnica controlada.

## Proximo CP recomendado

CP-J: validar a mesma linguagem branco/azul em Clientes ou Servicos, escolhendo uma tela por vez.
