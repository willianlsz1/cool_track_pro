# Equipamentos - cadastro avancado e etiqueta local

## Objetivo

Melhorar o cadastro de equipamento do app-v2 usando o v1 como referencia
funcional, sem copiar sua densidade visual e sem ativar camera, upload, storage,
IA, Supabase/RLS ou billing.

## Decisao

O cadastro do app-v2 passa a separar o formulario em blocos:

- Essenciais: nome, local e status inicial.
- Contexto: cliente e setor, preservando a regra de cliente herdado do setor.
- Detalhes tecnicos: tag/codigo, tipo, componente, fluido, marca/modelo, numero
  de serie e capacidade.
- Operacao: criticidade, prioridade operacional e periodicidade preventiva.

A area "Etiqueta do equipamento" entra somente como preenchimento local
simulado. Ela aplica dados tecnicos ao rascunho para validar o fluxo de revisao
manual, mas nao usa arquivo, camera, upload, storage, IA ou persistencia real.

## Anti-escopo

- Reconhecimento real por imagem.
- Captura por camera ou input de arquivo.
- Upload/storage real.
- Supabase/RLS, migrations ou bucket.
- Billing, assinatura, quotas ou gate real.
- Extracao automatica que salva sem revisao do tecnico.

## Criterio de aceite

- O tecnico consegue salvar equipamento apenas com nome e local.
- O tecnico consegue preencher dados tecnicos avancados quando souber.
- O exemplo local da etiqueta preenche somente o rascunho.
- O cliente herdado do setor continua claro e pode ser alterado manualmente.
- A validacao cobre action e formulario sem depender de storage real.
