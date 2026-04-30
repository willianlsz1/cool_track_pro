# React migration layer

Esta pasta existe para migração gradual. Ela não substitui a aplicação legada em
`src/app.js`, `src/ui/*` ou `src/core/*`.

## Regras

- Monte React apenas em roots explícitos, usando `createRoot`.
- Não renderize dentro de `#app` até a tela alvo ter plano e testes próprios.
- Não mova regra de negócio para componentes React.
- Use classes Tailwind com prefixo `tw-`.
- Não dependa do preflight do Tailwind; o CSS legado continua sendo a base atual.

## Estrutura

- `components/`: componentes React pequenos e reutilizáveis.
- `entrypoints/`: roots isolados montados pelo HTML ou por bridges controladas.
- `pages/`: futuras telas migradas uma a uma.
- `shared/`: adaptadores e helpers sem dependência de DOM legado.
- `styles/`: entrada Tailwind progressiva.
