# Clientes fase 5 - Consulta e relatorio local

Data: 2026-05-16

## Objetivo

Completar a proxima fatia segura de Clientes no app-v2 sem repetir os problemas
do v1: criar uma consulta operacional por Cliente dentro de `Equipamentos >
Clientes`, com filtros locais, resumo por cliente e relatorio local de leitura.

Esta fase nao copia a tela de Clientes do v1. O app-v2 preserva paridade
funcional operacional com uma estrutura nova: Cliente continua como subvisao
forte dentro de Equipamentos, e Equipamento continua sendo o centro do fluxo de
campo.

## Escopo 5A-D

### 5A - Contrato documental

- Registrar que Clientes fase 5 cobre consulta/filtros e relatorio local por
  Cliente.
- Separar paridade obrigatoria, melhorias permitidas, backlog e areas sensiveis.
- Manter PMOC, storage real, Supabase/RLS e migrations fora desta fase.

### 5B - Dominio/view model

- Evoluir `equipmentClientsViewModel` com filtros mock/local por Cliente.
- Agregar status operacional, pendencias, equipamentos sem primeiro servico e
  ultimo atendimento por Cliente.
- Expor um resumo local por Cliente sem PDF/share real.

### 5C - UI minima

- Adicionar busca e filtros simples em `Equipamentos > Clientes`.
- Mostrar resumo operacional no detalhe do Cliente.
- Nao criar aba global de Clientes, router novo, modal complexo ou design final.

### 5D - Validacao

- Cobrir view model e shell com testes focados.
- Rodar validacao focada e validacao geral do repo.
- Atualizar documentos de paridade com o resultado.

## Paridade obrigatoria

- Listar Clientes.
- Buscar Cliente por nome, documento, contato, endereco ou equipamento vinculado.
- Filtrar Clientes por pendencia operacional.
- Filtrar Clientes com equipamento critico.
- Filtrar Clientes com equipamento sem primeiro servico.
- Abrir detalhe do Cliente.
- Ver equipamentos vinculados.
- Ver servicos relacionados.
- Ver resumo local consolidado do Cliente.

## Melhorias permitidas

- Trocar listas genericas do v1 por consulta operacional escaneavel.
- Usar status derivado dos Equipamentos e Compromissos em vez de flags soltas.
- Mostrar resumo local do Cliente como leitura, sem acao sensivel.
- Reaproveitar primitives do app-v2 e view models puros.

## Fora de escopo

- PMOC.
- PDF/share real.
- WhatsApp real.
- Storage real.
- Supabase/RLS.
- Migrations Supabase.
- Billing, assinatura e quotas.
- Upload/fotos reais.
- Router novo.
- Nova area global de Clientes.
- Design final ou redesign amplo.

## Criterio de aceite

- `Equipamentos > Clientes` permite consultar a carteira por busca e filtros
  operacionais.
- O detalhe de Cliente mostra um resumo local consolidado sem abrir PMOC ou
  fluxos sensiveis.
- A implementacao fica restrita ao app-v2 mock/local e documentos do rewrite.
- Validacoes focadas e gerais passam, aceitando apenas warnings ja conhecidos.
