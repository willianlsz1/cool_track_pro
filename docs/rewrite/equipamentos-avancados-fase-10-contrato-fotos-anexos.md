# Equipamentos avancados fase 10 - contrato fotos e anexos

## Objetivo

Decidir contrato local para fotos/anexos de equipamento no app-v2 sem
upload/storage real, separando placeholder/mock local, permissoes, limites e
futura persistencia.

## Escopo executado

- Revisado o mapeamento inicial de fotos da fase 1.
- Revisado o fluxo legado de fotos de equipamento.
- Revisado o componente legado de fotos de equipamento.
- Revisado o armazenamento legado de fotos.
- Definido contrato recomendado para a proxima fatia mock/local do app-v2.
- Mantida decisao de nao implementar runtime neste checkpoint documental.

## Evidencia considerada

### v1

Fontes:

- `src/ui/views/equipamentos/fotos.js`;
- `src/ui/components/equipmentPhotos.js`;
- `src/core/photoStorage.js`;
- `src/ui/views/equipamentos/equipmentCards.js`.

No v1, fotos de equipamento misturam:

- gate Plus/Pro e upsell para pricing;
- editor dedicado com modal, preview, capa e remocao;
- captura/galeria com compressao no navegador;
- limite de 3 fotos por equipamento;
- estado `pending` e `existing`;
- upload real para storage via `uploadPendingPhotos`;
- URLs assinadas, referencias persistidas, fila local e fallback offline;
- uso da primeira foto como capa no card/detalhe.

Esse conjunto toca storage real, plano/billing, Supabase/storage, fallback
offline e UX de midia. Portanto nao deve ser copiado para o app-v2 em uma unica
fatia.

### app-v2

Fontes:

- `src/app-v2/domain/types.ts`;
- `src/app-v2/equipment/equipmentActions.ts`;
- `src/app-v2/equipment/EquipmentForm.tsx`;
- `src/app-v2/equipment/EquipmentDetail.tsx`;
- `src/app-v2/equipment/EquipmentList.tsx`.

O app-v2 ainda nao possui contrato de fotos/anexos em `Equipamento`. A area de
Equipamentos ja cobre lista, detalhe, setores, arquivamento e operacao local,
mas nao conecta upload, storage, plano real, billing, Supabase/RLS ou migrations.

## Decisao de contrato

Para o app-v2, fotos/anexos devem entrar primeiro como contrato mock/local de
referencias, nao como upload real.

Contrato recomendado para a proxima fase:

- adicionar `anexos?: EquipmentAttachment[]` em `Equipamento`;
- `EquipmentAttachment` deve ser um contrato local e pequeno;
- campos minimos: `id`, `kind`, `label`, `source`, `createdAt`;
- `kind` inicial: `foto` ou `documento`;
- `source` inicial: `mock` ou `placeholder`;
- opcionalmente aceitar `cover?: boolean` para indicar capa local;
- a lista deve permitir no maximo 3 fotos/anexos visuais por equipamento no
  mock, alinhado ao limite legado de fotos de equipamento;
- nao persistir `File`, `Blob`, `dataUrl` grande, URL assinada real, path de
  bucket, userId real ou metadados de storage no contrato inicial;
- nao usar `localStorage`, IndexedDB, Supabase, Storage, bucket, signed URL ou
  fila offline na fase mock/local;
- nao criar gate real de Plus/Pro, assinatura, quota ou pricing;
- a UI inicial deve mostrar somente estado local/placeholder e metadados de
  anexo, sem input real de arquivo;
- anexos devem ser preservados em criar/editar equipamento e ao arquivar ou
  desarquivar equipamento;
- a capa local pode aparecer como sinal visual no card/detalhe, mas sem
  lightbox, download, upload, remocao remota ou URL real;
- a etapa de persistencia real deve ser separada e exigir contrato de storage,
  RLS, migrations, permissoes, quotas, auditoria e testes proprios.

## Modelo sugerido

```ts
export type EquipmentAttachmentKind = 'foto' | 'documento';
export type EquipmentAttachmentSource = 'mock' | 'placeholder';

export interface EquipmentAttachment {
  id: string;
  kind: EquipmentAttachmentKind;
  label: string;
  source: EquipmentAttachmentSource;
  createdAt: string;
  cover?: boolean;
}
```

## Anti-escopo preservado

- Upload real.
- Storage real, bucket, signed URL e fila offline.
- Supabase/RLS e migrations.
- Billing real, assinatura real, quotas, pricing e gates reais.
- Camera/file input real.
- Compressao de imagem, lightbox e download.
- Persistencia em `localStorage` ou IndexedDB.
- PMOC.
- PDF/share, WhatsApp real e relatorios reais.
- Router novo ou aba global nova.
- Redesign geral, tokens globais, CSS legado ou Tailwind config.

## Riscos remanescentes

- Sem runtime, fotos/anexos continuam lacuna funcional no app-v2.
- O contrato mock/local nao prova upload, permissao, RLS ou billing.
- O limite de 3 itens pode precisar revisao quando documentos nao-foto entrarem.
- A futura etapa real exigira decisao de bucket, RLS, assinatura de URL,
  expiracao, limpeza de objetos e retencao.

## Proximo checkpoint recomendado

Equipamentos avancados fase 11: implementar somente anexos/fotos placeholder
mock/local no app-v2 usando o contrato da fase 10, com no maximo 3 itens,
exibicao no detalhe/card e preservacao em criar/editar/arquivar/desarquivar, sem
input real de arquivo, sem upload, sem storage real, sem billing real, sem
assinatura real, sem Supabase/RLS, sem migrations, sem PMOC, sem PDF/share e sem
redesign geral.

## Validacao documental

- `npm run format:check` passou.
- `git diff --check` passou.
