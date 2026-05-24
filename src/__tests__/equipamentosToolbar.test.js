import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureToolbar, setToolbar } from '../ui/views/equipamentos/ui/toolbar.js';

function setupToolbarDom() {
  document.body.innerHTML = `
    <h1 id="equip-page-title">Old title</h1>
    <p id="equip-page-subtitle">Old subtitle</p>
    <div id="equip-toolbar-actions"></div>
  `;
}

function configureToolbarTestDeps() {
  const Utils = {
    getEl: vi.fn((id) => document.getElementById(id)),
  };
  configureToolbar({ Utils });
  return { Utils };
}

describe('toolbar', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    configureToolbar({ Utils: null });
  });

  it('exige Utils configurado', () => {
    expect(() => setToolbar()).toThrow('toolbar dependency not configured: Utils');
  });

  it('aplica titulo com fallback, limpa subtitulo e monta CTA default preservado', () => {
    setupToolbarDom();
    const { Utils } = configureToolbarTestDeps();

    setToolbar();

    expect(Utils.getEl).toHaveBeenNthCalledWith(1, 'equip-page-title');
    expect(Utils.getEl).toHaveBeenNthCalledWith(2, 'equip-page-subtitle');
    expect(Utils.getEl).toHaveBeenNthCalledWith(3, 'equip-toolbar-actions');
    expect(document.getElementById('equip-page-title')?.textContent).toBe('Equipamentos');
    expect(document.getElementById('equip-page-subtitle')?.textContent).toBe('');

    const button = document.querySelector('#equip-toolbar-actions button');
    expect(button?.className).toBe('btn btn--primary btn--sm');
    expect(button?.dataset.action).toBe('open-modal');
    expect(button?.dataset.id).toBe('modal-add-eq');
    expect(button?.dataset.source).toBe('toolbar_primary');
    expect(button?.dataset.testid).toBe('equipamentos-add-equipment');
    expect(button?.textContent).toBe('+ Novo equipamento');
    expect(button?.getAttribute('aria-label')).toBe(
      'Cadastrar novo equipamento (manual ou via foto da etiqueta)',
    );
  });

  it('preserva titulo informado e combina extraBtn antes do CTA default', () => {
    setupToolbarDom();
    configureToolbarTestDeps();

    setToolbar({
      title: 'Setor A',
      extraBtn: '<button data-action="equip-back" class="btn btn--ghost">Todos</button>',
    });

    expect(document.getElementById('equip-page-title')?.textContent).toBe('Setor A');
    expect(document.getElementById('equip-page-subtitle')?.textContent).toBe('');

    const actions = [...document.querySelectorAll('#equip-toolbar-actions button')];
    expect(actions).toHaveLength(2);
    expect(actions[0]?.dataset.action).toBe('equip-back');
    expect(actions[1]?.dataset.action).toBe('open-modal');
  });

  it('suprime CTA default quando hideDefaultCta=true preservando extraBtn', () => {
    setupToolbarDom();
    configureToolbarTestDeps();

    setToolbar({
      hideDefaultCta: true,
      extraBtn: '<button data-action="equip-unlock-context">Alterar</button>',
    });

    const actions = [...document.querySelectorAll('#equip-toolbar-actions button')];
    expect(actions).toHaveLength(1);
    expect(actions[0]?.dataset.action).toBe('equip-unlock-context');
    expect(document.querySelector('#equip-toolbar-actions [data-action="open-modal"]')).toBeNull();
  });

  it('mantem comportamento silencioso quando elementos DOM nao existem', () => {
    const { Utils } = configureToolbarTestDeps();

    expect(() => {
      setToolbar({
        title: 'Sem DOM',
        extraBtn: '<button data-action="noop">noop</button>',
      });
    }).not.toThrow();
    expect(Utils.getEl).toHaveBeenCalledTimes(3);
  });

  it('nao importa o adapter legado', () => {
    const source = readFileSync(resolve('src/ui/views/equipamentos/ui/toolbar.js'), 'utf8');

    expect(source).not.toContain('ui/views/equipamentos');
    expect(source).not.toContain('views/equipamentos.js');
  });
});
