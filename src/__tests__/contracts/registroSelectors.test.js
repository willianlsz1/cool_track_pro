import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  REGISTRO_ACTIONS,
  REGISTRO_DATA_ATTRIBUTES,
  REGISTRO_FIELD_IDS,
  REGISTRO_PUBLIC_CLASSES,
  REGISTRO_PUBLIC_IDS,
  REGISTRO_REACT_ROOTS,
} from '../../ui/viewModels/registroContracts.js';

function source(file) {
  return fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');
}

const sourceFiles = [
  'src/ui/views/registro.js',
  'src/ui/components/photos.js',
  'src/ui/controller/handlers/registroHandlers.js',
  'src/ui/shell/templates/views.js',
  'src/ui/views/registro/headerRenderer.js',
  'src/ui/views/registro/checklistRenderer.js',
  'src/ui/views/registro/signatureHint.js',
  'src/ui/viewModels/registroPhotosModel.js',
  'src/ui/viewModels/registroSignatureModel.js',
].map(source);

const combinedSource = sourceFiles.join('\n');

function valuesOf(contract) {
  return Object.values(contract).filter((value) => typeof value === 'string');
}

function expectUnique(values) {
  expect(new Set(values).size).toBe(values.length);
}

function expectSourceContains(value) {
  expect(combinedSource, `Expected Registro source to contain "${value}"`).toContain(value);
}

describe('registro public selector contracts', () => {
  it('locks critical public ids and React roots without duplicates', () => {
    const criticalIds = [
      'view-registro',
      'registro-header-root',
      'r-equip',
      'r-data',
      'r-tipo',
      'r-tipo-custom',
      'r-obs',
      'r-tecnico',
      'photo-preview',
      'input-fotos',
      'registro-signature-hint',
      'r-checklist-body',
    ];

    const publicIds = valuesOf(REGISTRO_PUBLIC_IDS);
    const roots = valuesOf(REGISTRO_REACT_ROOTS);
    const fieldIds = [...REGISTRO_FIELD_IDS];

    expectUnique(publicIds);
    expectUnique(roots);
    expectUnique(fieldIds);

    criticalIds.forEach((id) => {
      expect(publicIds).toContain(id);
      expectSourceContains(id);
    });

    expect(REGISTRO_REACT_ROOTS).toEqual({
      header: 'registro-header-root',
      checklist: 'r-checklist-body',
      photos: 'registro-photos-root',
      signature: 'registro-signature-hint',
    });
    roots.forEach(expectSourceContains);
  });

  it('locks critical data-actions without duplicates', () => {
    const criticalActions = [
      'save-registro',
      'save-and-share-registro',
      'save-and-share-other-registro',
      'clear-registro',
      'quick-service-template',
      'r-checklist-set',
      'registro-signature-capture',
      'registro-signature-open',
      'registro-signature-remove',
    ];

    const actions = valuesOf(REGISTRO_ACTIONS);
    expectUnique(actions);

    criticalActions.forEach((action) => {
      expect(actions).toContain(action);
      expectSourceContains(action);
    });
  });

  it('locks critical classes and delegated data attributes', () => {
    const criticalClasses = [
      'registro-hero',
      'registro-quick',
      'registro-field',
      'registro-actions',
      'registro-context-card',
      'registro-photo-quick',
      'registro-sig-hint',
      'r-checklist__body',
      'r-checklist__row',
      'r-checklist__status',
    ];
    const criticalAttributes = [
      'data-action',
      'data-r-action',
      'data-template',
      'data-color',
      'data-item-id',
      'data-status',
      'data-unit',
      'data-state',
    ];

    expectUnique([...REGISTRO_PUBLIC_CLASSES]);
    expectUnique([...REGISTRO_DATA_ATTRIBUTES]);

    criticalClasses.forEach((className) => {
      expect(REGISTRO_PUBLIC_CLASSES).toContain(className);
      expectSourceContains(className);
    });

    criticalAttributes.forEach((attr) => {
      expect(REGISTRO_DATA_ATTRIBUTES).toContain(attr);
      expectSourceContains(attr);
    });
  });
});
