import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Limitação conhecida: análise estática (regex) captura apenas seletores em
 * templates estáticos do source. Seletores gerados dinamicamente em runtime
 * não entram neste contrato.
 */

function source(file) {
  return fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');
}
function extract(sourceCode, attr) {
  const regex = new RegExp(`${attr}="([^"]+)"`, 'g');
  return [...new Set([...sourceCode.matchAll(regex)].map((m) => m[1]))]
    .filter((value) => !value.includes('${'))
    .sort();
}

describe('contracts/selectors (static)', () => {
  const dashboard = source('src/ui/views/dashboard.js');
  const equipamentos = [
    source('src/ui/views/equipamentos.js'),
    source('src/features/equipamentos/ui/detail.js'),
    source('src/features/equipamentos/ui/renderEquip.js'),
    source('src/features/equipamentos/setor/setorUI.js'),
    source('src/features/equipamentos/crud/postActions.js'),
    source('src/ui/views/equipamentos/setores.js'),
  ].join('\n');
  const registro = source('src/ui/views/registro.js');
  const historico = source('src/ui/views/historico.js');
  const relatorio = source('src/ui/views/relatorio.js');
  const clientes = source('src/ui/views/clientes.js');
  const alertas = source('src/ui/views/alertas.js');

  describe('dashboard', () => {
    it('data-action', () => expect(extract(dashboard, 'data-action')).toMatchInlineSnapshot(`[]`));
    it('data-nav', () => expect(extract(dashboard, 'data-nav')).toMatchInlineSnapshot(`[]`));
    it('data-id', () => expect(extract(dashboard, 'data-id')).toMatchInlineSnapshot(`[]`));
  });
  describe('equipamentos', () => {
    it('data-action', () =>
      expect(extract(equipamentos, 'data-action')).toMatchInlineSnapshot(`
        [
          "back-to-setores",
          "delete-equip",
          "delete-setor",
          "edit-equip",
          "edit-setor",
          "equip-clear-cliente-filter",
          "equip-quickfilter",
          "equip-unlock-context",
          "go-register-equip",
          "open-modal",
          "open-pmoc-modal",
          "open-setor",
          "open-setor-modal",
          "toggle-eq-detail-menu",
          "toggle-setor-menu",
        ]
      `));
    it('data-nav', () => expect(extract(equipamentos, 'data-nav')).toMatchInlineSnapshot(`[]`));
    it('data-id', () =>
      expect(extract(equipamentos, 'data-id')).toMatchInlineSnapshot(`
        [
          "__sem_setor__",
          "modal-add-eq",
          "modal-score-info",
          "sem-setor",
          "todos",
        ]
      `));
  });
  describe('registro', () => {
    it('data-action', () =>
      expect(extract(registro, 'data-action')).toMatchInlineSnapshot(`
      [
        "quick-service-template",
        "save-and-share-other-registro",
        "save-and-share-registro",
        "save-registro",
      ]
    `));
    it('data-nav', () => expect(extract(registro, 'data-nav')).toMatchInlineSnapshot(`[]`));
    it('data-id', () => expect(extract(registro, 'data-id')).toMatchInlineSnapshot(`[]`));
  });
  describe('historico', () => {
    it('data-action', () => expect(extract(historico, 'data-action')).toMatchInlineSnapshot(`[]`));
    it('data-nav', () =>
      expect(extract(historico, 'data-nav')).toMatchInlineSnapshot(`
      [
        "relatorio",
      ]
    `));
    it('data-id', () => expect(extract(historico, 'data-id')).toMatchInlineSnapshot(`[]`));
  });
  describe('relatorio', () => {
    it('data-action', () =>
      expect(extract(relatorio, 'data-action')).toMatchInlineSnapshot(`
        [
          "rel-clear-filters",
          "rel-toggle-advanced",
          "rel-view-signature",
        ]
      `));
    it('data-nav', () => expect(extract(relatorio, 'data-nav')).toMatchInlineSnapshot(`[]`));
    it('data-id', () => expect(extract(relatorio, 'data-id')).toMatchInlineSnapshot(`[]`));
  });
  describe('clientes', () => {
    it('data-action', () => expect(extract(clientes, 'data-action')).toMatchInlineSnapshot(`[]`));
    it('data-nav', () => expect(extract(clientes, 'data-nav')).toMatchInlineSnapshot(`[]`));
    it('data-id', () => expect(extract(clientes, 'data-id')).toMatchInlineSnapshot(`[]`));
  });
  describe('alertas', () => {
    it('data-action', () => expect(extract(alertas, 'data-action')).toMatchInlineSnapshot(`[]`));
    it('data-nav', () => expect(extract(alertas, 'data-nav')).toMatchInlineSnapshot(`[]`));
    it('data-id', () => expect(extract(alertas, 'data-id')).toMatchInlineSnapshot(`[]`));
  });
});
