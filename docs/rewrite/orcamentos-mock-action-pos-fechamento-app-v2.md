# Orcamentos mock/action pos-fechamento no app-v2

Data: 2026-05-16

## Objetivo

Reduzir a lacuna de saidas pos-salvamento criando uma acao local para gerar
orcamento mockado a partir de um Registro de Servico concluido.

## Escopo

- Criar action pura para gerar `Orcamento` mockado a partir de registro
  concluido.
- Vincular o orcamento ao registro, equipamento e cliente quando disponiveis.
- Usar custos informados no servico como total inicial mockado.
- Exibir CTA no estado `Servico concluido`.
- Apos criar, abrir `Servicos > Orcamentos` com o novo item no pipeline local.

## Fora de escopo

- Billing.
- Assinatura.
- PDF/share real.
- WhatsApp real.
- Storage real.
- Supabase/RLS.
- Migrations Supabase.
- PMOC.
- Orcamento real, envio, download, assinatura ou cobranca.
- Design final ou redesign amplo.

## Criterio de aceite

- A action nao duplica orcamento para o mesmo registro.
- O total inicial soma `custoPecas` e `custoMaoObra` de forma local.
- O shell permite criar orcamento mockado a partir do fechamento de servico.
- `Servicos > Orcamentos` mostra o novo orcamento local.
- Testes focados cobrem action e shell.
- Validacao geral passa aceitando apenas warnings conhecidos.
