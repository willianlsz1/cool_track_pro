# app-v2 - CP54C1 - Remocao da superficie clicavel PDF/share v1

## Objetivo

Remover os CTAs e fallbacks legados de PDF/WhatsApp que ainda podiam ser
acionados a partir de Historico e Registro, sem remover neste checkpoint o
handler central, os toasts globais, quota, preview modal ou dominio PDF/share.

## Escopo executado

- Historico:
  - removeu botoes `export-pdf` e `whatsapp-export` da timeline v1;
  - manteve acoes locais de editar/excluir registro.
- Registro:
  - removeu handlers `save-and-share-registro` e
    `save-and-share-other-registro`;
  - removeu o fallback direto `reportShare.js`;
  - removeu o modal de destinatario alternativo;
  - manteve `save-registro` como acao primaria;
  - simplificou o toast pos-save para feedback local sem PDF/WhatsApp.
- Testes:
  - atualizou contratos de seletores e timeline;
  - removeu testes dedicados ao fluxo legado aposentado;
  - ampliou `legacyV1RemovalContracts` para impedir retorno do adapter/fork.

## Fora de escopo

- `src/ui/controller/handlers/reportExportHandlers.js`.
- `src/ui/components/pdfSuccessToast.js`.
- `src/ui/components/shareSuccessToast.js`.
- `src/ui/components/pdfQuotaBadge.js`.
- Modal de preview PDF em `src/ui/shell/templates/modals.js`.
- `src/domain/pdf/**` e `src/domain/whatsapp.js`.
- PMOC, assinatura, fotos/upload/storage ou reconstrucao app-v2-native.

## Risco remanescente

O handler central de exportacao ainda existe ate CP54C2. Ele fica sem CTA em
Historico/Registro, mas seus testes proprios continuam validando o legado que
sera removido no proximo corte.

## Proximo passo

Executar CP54C2: remover handler central, toasts de sucesso PDF/share, badge de
quota e preview modal legado, mantendo dominio PDF/share para CP54C3.
