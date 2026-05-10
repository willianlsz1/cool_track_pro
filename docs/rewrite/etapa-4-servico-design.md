# Etapa 4 - Design de Registro de Serviço

## 1. Objetivo

Definir o fluxo básico de **Registro de serviço** no `src/app-v2/`, ainda com dados mockados, para fechar a fundação operacional antes de aprimorar abas secundárias.

O fluxo mínimo deve responder:

> Qual serviço o técnico está executando, o que foi feito e como ele conclui o atendimento?

## 2. Decisões confirmadas

1. A prioridade agora é fechar o fluxo básico do app antes de polir abas.
2. A Etapa 4 será **Registro de serviço básico**.
3. O formato será **fluxo por etapas curto**, não tela única longa.
4. O fluxo começa a partir de Home ou Equipamento.
5. O equipamento deve vir preenchido quando o técnico inicia por uma próxima ação, fila ou detalhe.
6. A Etapa 4 continua isolada do legado.
7. A Etapa 4 não conecta storage, Supabase, PDF/share, WhatsApp, orçamento real ou PMOC.
8. Fotos e assinatura ficam fora desta primeira versão.

## 3. Fluxo previsto

Fluxo principal:

1. Home `Hoje` ou detalhe de `Equipamento`.
2. Ação **Iniciar serviço** ou **Registrar primeiro serviço**.
3. Registro de serviço por etapas.
4. Conclusão mockada.
5. Resumo de serviço concluído.

Fluxo de navegação:

```text
Hoje -> Próxima ação -> Registro de serviço
Equipamento -> Detalhe -> Iniciar serviço -> Registro de serviço
Serviços -> Em andamento -> Registro de serviço
```

Na Etapa 4, a área `Serviços` pode mostrar apenas uma entrada mínima para o registro atual ou um estado vazio simples.

## 4. Etapas do registro

### Etapa 1: Contexto

Mostra:

- equipamento;
- cliente/local;
- motivo inicial;
- status operacional;
- origem do registro, quando houver.

Comportamento:

- se o registro veio de um equipamento, o técnico não precisa escolher o equipamento novamente;
- se veio da área `Serviços`, pode iniciar com seleção mockada mínima;
- o botão principal avança para tipo de serviço.

### Etapa 2: Tipo de serviço

Opções iniciais:

- preventiva;
- corretiva;
- instalação;
- visita;
- outro.

Comportamento:

- preventiva/corretiva podem vir pré-selecionadas quando o registro nasce de compromisso;
- o técnico pode trocar o tipo antes de avançar;
- nenhuma regra de PMOC entra nesta etapa.

### Etapa 3: Execução

Campos mínimos:

- diagnóstico;
- ações executadas;
- status final do equipamento: operacional, atenção ou crítico.

Critério:

- evitar formulário longo;
- priorizar texto curto e objetivo;
- sem anexos, fotos ou assinatura nesta etapa.

### Etapa 4: Fechamento

Mostra:

- resumo do equipamento;
- tipo de serviço;
- diagnóstico;
- ações executadas;
- status final;
- botão **Concluir serviço**.

Ao concluir:

- mostrar tela de sucesso mockada;
- manter o registro em memória local React apenas durante a sessão;
- abrir caminho visual para saídas futuras sem implementá-las.

## 5. Tela de conclusão

A tela de conclusão deve mostrar:

1. Título **Serviço concluído**.
2. Resumo técnico curto.
3. Cliente/local como contexto.
4. Saídas futuras em estado mockado:
   - **Relatório**;
   - **Orçamento**;
   - **Próximo compromisso**.

Essas saídas não devem executar PDF, WhatsApp, orçamento real ou agendamento real na Etapa 4.

## 6. Papel da área Serviços

Na Etapa 4, `Serviços` ainda não será uma aba completa.

Ela deve no máximo:

- abrir estado vazio quando não houver serviço em andamento;
- mostrar serviço mockado em andamento quando o fluxo estiver ativo;
- permitir voltar ao registro em andamento, se isso couber sem storage.

A aba `Serviços` será aprimorada em etapa posterior com histórico, relatórios e orçamentos.

## 7. Dados necessários

Usar os tipos existentes de `src/app-v2/domain/types.ts`:

- `Equipamento`;
- `Cliente`;
- `CompromissoServico`;
- `RegistroServico`;
- `ServiceRecordKind`;
- `ServiceRecordStatus`.

View models esperados:

- dados do contexto inicial;
- opções de tipo de serviço;
- estado do formulário por etapa;
- resumo final;
- lista mínima de serviços em andamento/concluídos mockados.

## 8. Fora do escopo

- Persistência real.
- Supabase.
- Storage local definitivo.
- Rotas reais.
- PDF/share.
- WhatsApp.
- Orçamento real.
- Agendamento real de próximo compromisso.
- PMOC.
- Fotos.
- Assinatura.
- Upload.
- Billing/plano.
- Integração com shell legado.

## 9. Critério de aceite

A Etapa 4 estará correta quando:

1. A Home conseguir iniciar um registro a partir da próxima ação.
2. O detalhe do equipamento conseguir iniciar um registro.
3. O registro abrir com equipamento e cliente/local já contextualizados.
4. O fluxo tiver etapas curtas e claras.
5. O técnico conseguir escolher tipo, preencher execução e concluir.
6. A conclusão mostrar resumo técnico mockado.
7. A área `Serviços` deixar de ser só placeholder, mas sem virar histórico completo.
8. Nenhuma integração real com legado/storage/PDF/WhatsApp/orçamento for criada.
9. Testes cobrirem view models e regras de navegação local quando houver lógica pura.

## 10. Riscos remanescentes

1. O fluxo pode crescer demais se fotos, assinatura e relatório entrarem cedo.
2. A conclusão pode parecer funcional demais se botões futuros não ficarem claramente mockados.
3. Sem storage, serviço em andamento só vale durante a sessão React.
4. A Etapa 5 precisará decidir como representar histórico e saídas futuras sem recriar complexidade do legado.

## 11. Resultado da execução

Implementado em `src/app-v2/service/` com fluxo local em memória:

- Home inicia o registro pela próxima ação.
- Detalhe do Equipamento inicia o registro pelo botão principal.
- `Serviços` deixou de ser placeholder e mostra estado vazio ou registro em andamento.
- O fluxo contém contexto, tipo, execução, revisão e conclusão.
- Relatório, Orçamento e Próximo compromisso aparecem apenas como saídas futuras desabilitadas.

Mantido fora do escopo: storage, Supabase, rotas reais, legado, PDF/share, WhatsApp, orçamento real, agendamento real, fotos, assinatura e PMOC.
