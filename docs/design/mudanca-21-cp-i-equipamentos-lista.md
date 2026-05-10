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

Nao foi removido CSS antigo nesta CP.

Motivo: os seletores antigos de `.equip-card`, `.setor-card`, filtros e busca ainda aparecem em superficies compartilhadas ou historicas, incluindo dashboard/criticos, modos de grade e estilos globais. Sem prova suficiente de exclusividade, a CP-I neutraliza o visual antigo apenas no escopo da aba Equipamentos.

## Proximo CP recomendado

CP-J: validar a mesma linguagem branco/azul em Clientes ou Servicos, escolhendo uma tela por vez.
