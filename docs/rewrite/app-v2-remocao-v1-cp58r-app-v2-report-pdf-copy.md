# app-v2 - CP-58R: neutralizacao de copia PDF em Relatorios

## Objetivo

Remover a promessa visivel de download de PDF na tela app-v2 de Relatorios,
porque PDF/share sera refeito em etapa propria e nao deve aparecer como acao
pendente do fluxo atual.

## Arquivos alterados

- `src/app-v2/service/ServiceReportsHome.tsx`
- `src/app-v2/shell/AppV2Shell.navigation.test.tsx`
- `docs/rewrite/app-v2-remocao-v1-vestigios-plano.md`

## O que mudou

- O botao desabilitado `Baixar PDF futuro` passou para uma mensagem neutra:
  `Exportacao em etapa propria`.
- O icone deixou de usar download e passou a usar icone de documento.
- O teste de navegacao do app-v2 passou a bloquear retorno de `Baixar PDF
futuro` e `Exportar PDF` na subvisao de Relatorios.

## Fora do escopo

- PDF/share real.
- `window.print()` local ja existente no preview.
- Storage real, Supabase/RLS, migrations, WhatsApp, assinatura, PMOC ou
  billing/pricing.

## Risco

Baixo. Alteracao apenas de copia/icone em botao desabilitado e teste de
navegacao. Nao altera contratos de dados, persistencia, router ou integracoes.
