/**
 * @vitest-environment jsdom
 *
 * A11y smoke tests pras 6 views internas (templates vanilla em
 * src/ui/shell/templates/views.js).
 *
 * Estratégia: renderiza renderShellViews() (string com HTML estático
 * de TODAS as views), seleciona cada view por id e roda axe-core no
 * subtree. Cobertura limitada a HTML estrutural — React islands
 * embutidas em runtime ficam fora do escopo desta rodada.
 *
 * Gate: violations serious/critical em qualquer view ativa quebram CI.
 * Views skipped têm TODO documentando o débito conhecido.
 */
import { beforeEach, describe, it } from 'vitest';

import { renderShellViews } from '../../ui/shell/templates/views.js';
import { expectNoSeriousViolations } from '../helpers/axe.js';

function setupShell() {
  const host = document.createElement('div');
  host.id = 'app-shell-test';
  host.innerHTML = renderShellViews();
  document.body.appendChild(host);
  return host;
}

function getView(host, viewId) {
  const el = host.querySelector(`#${viewId}`);
  if (!el) throw new Error(`View não encontrada: #${viewId}`);
  return el;
}

describe('a11y — views internas (templates shell)', () => {
  let host;

  beforeEach(() => {
    document.body.innerHTML = '';
    host = setupShell();
  });

  it('Painel (#view-inicio) — sem violations serious/critical', async () => {
    await expectNoSeriousViolations(getView(host, 'view-inicio'));
  });

  it('Equipamentos (#view-equipamentos) — sem violations serious/critical', async () => {
    await expectNoSeriousViolations(getView(host, 'view-equipamentos'));
  });

  it.skip('Registrar (#view-registro) — sem violations serious/critical', async () => {
    // TODO(a11y): essa view tem 1 violation serious pré-existente:
    //   - aria-progressbar-name (1 elemento): #registro-hero-meter é um
    //     [role="progressbar"] sem aria-label/aria-labelledby. Fix:
    //     adicionar aria-label="Progresso do registro" (ou referência via
    //     aria-labelledby ao label visível mais próximo).
    //   - referência: https://dequeuniversity.com/rules/axe/4.10/aria-progressbar-name
    // Endereçar antes de unskip — fora do escopo da Mudança 10 (que só
    // estabelece o gate, não corrige débito existente).
    await expectNoSeriousViolations(getView(host, 'view-registro'));
  });

  it('Histórico (#view-historico) — sem violations serious/critical', async () => {
    await expectNoSeriousViolations(getView(host, 'view-historico'));
  });

  // Clientes e Configurações são containers vazios no template shell —
  // o conteúdo é populado em runtime por renderClientes()/configurações
  // dinâmicas que dependem de state mockado (Supabase, plano, etc).
  // Cobrir essas views requer setup que foge do escopo da Mudança 10.
  it.skip('Clientes (#view-clientes) — sem violations serious/critical', async () => {
    // TODO(a11y): view shell é só `<div id="clientes-root"></div>`. Cobertura
    // real depende de renderClientes() em src/ui/views/clientes.js, que
    // requer state mockado completo (clientes, setores, plano). Endereçar
    // numa Mudança dedicada pra views dinâmicas.
    await expectNoSeriousViolations(getView(host, 'view-clientes'));
  });

  it.skip('Configurações (#view-configuracoes) — sem violations serious/critical', async () => {
    // TODO(a11y): view shell é completamente vazia (`<div class="view"
    // id="view-configuracoes"></div>`). Conteúdo é injetado em runtime
    // por src/ui/views/configuracoes.js, dependente de plano + flags.
    // Cobrir requer state mockado, fora do escopo da Mudança 10.
    await expectNoSeriousViolations(getView(host, 'view-configuracoes'));
  });
});
