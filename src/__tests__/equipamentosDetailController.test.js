import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  bindViewEquipDetailCoverActions,
  mountViewEquipDetail,
  openViewEquipDetailModal,
} from '../ui/views/equipamentos/ui/detailController.js';

describe('detailController', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('mountViewEquipDetail injeta HTML no root eq-det-corpo', () => {
    document.body.innerHTML = '<section id="eq-det-corpo"></section>';

    mountViewEquipDetail('<div class="eq-detail-view">Detalhe</div>');

    expect(document.querySelector('#eq-det-corpo')?.innerHTML).toBe(
      '<div class="eq-detail-view">Detalhe</div>',
    );
  });

  it('mountViewEquipDetail mantém comportamento quando root não existe', () => {
    const getEl = vi.fn(() => null);

    expect(() => mountViewEquipDetail('<p>x</p>', { getEl })).toThrow();
    expect(getEl).toHaveBeenCalledWith('eq-det-corpo');
  });

  it('bindViewEquipDetailCoverActions aplica classe loaded no load da imagem', () => {
    document.body.innerHTML = `
      <div class="eq-detail-cover">
        <img class="eq-detail-cover__img" src="foto.jpg" />
      </div>`;

    bindViewEquipDetailCoverActions(null);
    document.querySelector('.eq-detail-cover__img')?.dispatchEvent(new Event('load'));

    expect(document.querySelector('.eq-detail-cover')?.classList).toContain(
      'eq-detail-cover--loaded',
    );
  });

  it('bindViewEquipDetailCoverActions aplica fallback e remove imagem no erro', () => {
    document.body.innerHTML = `
      <div class="eq-detail-cover">
        <img class="eq-detail-cover__img" src="foto-quebrada.jpg" />
      </div>`;

    bindViewEquipDetailCoverActions(null);
    document.querySelector('.eq-detail-cover__img')?.dispatchEvent(new Event('error'));

    expect(document.querySelector('.eq-detail-cover')?.classList).toContain(
      'eq-detail-cover--fallback',
    );
    expect(document.querySelector('.eq-detail-cover__img')).toBeNull();
  });

  it('bindViewEquipDetailCoverActions nao abre lightbox legado ao clicar no cover preview', () => {
    document.body.innerHTML = `
      <div class="eq-detail-cover">
        <button type="button" class="eq-detail-cover__preview-hit"></button>
      </div>`;

    expect(() => bindViewEquipDetailCoverActions('https://cdn.test/foto.jpg')).not.toThrow();
    document.querySelector('.eq-detail-cover__preview-hit')?.dispatchEvent(new Event('click'));
  });

  it('bindViewEquipDetailCoverActions nao exige firstPhotoUrl', () => {
    document.body.innerHTML = `
      <div class="eq-detail-cover">
        <button type="button" class="eq-detail-cover__preview-hit"></button>
      </div>`;

    expect(() => bindViewEquipDetailCoverActions(null)).not.toThrow();
    document.querySelector('.eq-detail-cover__preview-hit')?.dispatchEvent(new Event('click'));
  });

  it('openViewEquipDetailModal chama Modal.open com modal-eq-det', async () => {
    const open = vi.fn();

    await openViewEquipDetailModal('eq-1', {
      importModal: vi.fn(async () => ({ Modal: { open } })),
    });

    expect(open).toHaveBeenCalledWith('modal-eq-det');
  });

  it('openViewEquipDetailModal chama handleError quando import/open falha', async () => {
    const error = new Error('modal unavailable');
    const handleError = vi.fn();

    await openViewEquipDetailModal('eq-err', {
      importModal: vi.fn(async () => {
        throw error;
      }),
      handleError,
      ErrorCodes: { NETWORK_ERROR: 'NETWORK_ERROR' },
    });

    expect(handleError).toHaveBeenCalledWith(error, {
      code: 'NETWORK_ERROR',
      message: 'Não foi possível abrir os detalhes do equipamento.',
      context: { action: 'equipamentos.viewEquip.openModal', id: 'eq-err' },
    });
  });
});
