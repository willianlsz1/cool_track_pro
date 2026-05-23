# Equipamentos > Clientes - cadastro operacional local

## Decisao

O cadastro de cliente do app-v2 passa a cobrir dados operacionais e formais
uteis para a carteira tecnica, sem copiar o modal escuro do v1 e sem abrir PMOC
real nesta etapa.

## Escopo aprovado

- Manter **Cliente** dentro da area **Equipamentos**.
- Separar o formulario em secoes:
  - identificacao;
  - localizacao e contato;
  - dados opcionais e observacoes internas.
- Tornar obrigatorio apenas o nome do cliente.
- Persistir local/mock os campos opcionais:
  - razao social;
  - documento;
  - inscricao estadual;
  - inscricao municipal;
  - finalidade do ambiente;
  - contato;
  - canal de chamados;
  - endereco;
  - observacoes internas.
- Exibir os dados no detalhe do cliente quando preenchidos.

## Fora de escopo

- PMOC real.
- PDF/share.
- WhatsApp real.
- Supabase, storage, RLS ou migrations.
- Validacao fiscal de CNPJ/CPF.
- Automacao de canal de chamados.

## Criterios de aceite

- O formulario preserva a linguagem visual oficial do app-v2.
- Labels e campos usam respiro vertical consistente.
- Criacao e edicao de cliente continuam locais/mock.
- Observacoes internas ficam explicitamente marcadas como dados locais da
  equipe tecnica, sem saida para relatorio do cliente.
