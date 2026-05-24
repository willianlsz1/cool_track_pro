# public/img/

Imagens servidas no root pela Vite/Cloudflare Pages, por exemplo
`/img/etiqueta-hvac.jpg`.

## Assets

| Arquivo                        | Uso                                                                      | Status   |
| ------------------------------ | ------------------------------------------------------------------------ | -------- |
| `etiqueta-hvac.jpg`            | Placa real LG Inverter (USNW092WSG3) usada como asset publico.           | Ativo    |
| `tecnico-celular-etiqueta.jpg` | Foto de tecnico apontando camera para etiqueta; candidata para OG image. | Opcional |

## Observacao sobre uso

O app-v2 e a entrada principal atual. Nao reative referencias antigas para
templates de landing page do v1 em `src/ui`.

Se algum asset desta pasta passar a ser usado em uma tela app-v2, registre o
uso no componente app-v2 correspondente e mantenha a referencia publica via
`/img/<arquivo>`.

## Specs sugeridas para novos assets

- Formato JPG ~80% ou PNG.
- Tamanho preferencial abaixo de 150 KB quando for imagem de interface.
- Proporcao larga, como 4:2 ou 3:2, quando o asset for usado em card ou hero.
- Resolucao minima sugerida de 720x360 para renderizacao retina em 360x180.
