import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import {
  buildRegistroPhotoPayload,
  getRegistroPhotoState,
  normalizeRegistroPhotoItems,
  persistRegistroPhotosForSave,
} from '../ui/views/registro/save/photos.js';

describe('registro save photo helpers', () => {
  it('normaliza fotos usando o predicado de sanitizacao injetado', () => {
    const safePhoto = { src: 'data:image/png;base64,abc' };
    const unsafePhoto = { src: 'javascript:alert(1)' };
    const isSafeRegistroPhotoSrc = vi.fn((photo) => photo.src.startsWith('data:image/'));

    expect(
      normalizeRegistroPhotoItems([safePhoto, unsafePhoto], { isSafeRegistroPhotoSrc }),
    ).toEqual([safePhoto]);
    expect(isSafeRegistroPhotoSrc).toHaveBeenCalledTimes(2);
  });

  it('le Photos.pending e monta estado inicial sem mutar o componente legado', () => {
    const pending = [{ id: 'ok' }, { id: 'blocked' }];
    const Photos = { pending };
    const isSafeRegistroPhotoSrc = (photo) => photo.id === 'ok';

    const state = getRegistroPhotoState({ Photos, isSafeRegistroPhotoSrc });

    expect(state).toEqual({ fotosRegistro: [{ id: 'ok' }], fotosPendentes: [] });
    expect(Photos.pending).toBe(pending);
  });

  it('monta payload de fotos sem fotos_pendentes quando nao ha fila', () => {
    expect(
      buildRegistroPhotoPayload({ fotosRegistro: [{ id: 'p1' }], fotosPendentes: [] }),
    ).toEqual({
      fotos: [{ id: 'p1' }],
    });
  });

  it('monta payload de fotos com fotos_pendentes quando ha queue keys', () => {
    expect(
      buildRegistroPhotoPayload({
        fotosRegistro: [{ id: 'p1', pending: true, queueKey: 'queue-1' }],
        fotosPendentes: ['queue-1'],
      }),
    ).toEqual({
      fotos: [{ id: 'p1', pending: true, queueKey: 'queue-1' }],
      fotos_pendentes: ['queue-1'],
    });
  });

  it('faz upload com recordId e coleta queue keys pendentes preservando warning', async () => {
    const uploadedPhotos = [
      { id: 'remote-1', pending: false },
      { id: 'local-1', pending: true, queueKey: 'queue-1' },
      { id: 'local-2', pending: true },
    ];
    const uploadPendingPhotos = vi.fn(async () => ({ photos: uploadedPhotos, failedCount: 1 }));
    const Toast = { warning: vi.fn() };
    const handleError = vi.fn();

    const result = await persistRegistroPhotosForSave(
      { fotosRegistro: [{ id: 'raw-1' }], fotosPendentes: [] },
      {
        registroId: 'reg-1',
        uploadPendingPhotos,
        Toast,
        handleError,
        ErrorCodes: { SYNC_FAILED: 'SYNC_FAILED' },
      },
    );

    expect(uploadPendingPhotos).toHaveBeenCalledWith([{ id: 'raw-1' }], { recordId: 'reg-1' });
    expect(result).toEqual({ fotosRegistro: uploadedPhotos, fotosPendentes: ['queue-1'] });
    expect(Toast.warning).toHaveBeenCalledWith(
      'Algumas fotos não puderam ser enviadas para a nuvem e ficaram salvas localmente.',
    );
    expect(handleError).not.toHaveBeenCalled();
  });

  it('mantem estado local e chama handleError quando upload falha', async () => {
    const error = new Error('offline');
    const uploadPendingPhotos = vi.fn(async () => {
      throw error;
    });
    const Toast = { warning: vi.fn() };
    const handleError = vi.fn();

    const result = await persistRegistroPhotosForSave(
      { fotosRegistro: [{ id: 'raw-1' }], fotosPendentes: [] },
      {
        registroId: 'reg-1',
        uploadPendingPhotos,
        Toast,
        handleError,
        ErrorCodes: { SYNC_FAILED: 'SYNC_FAILED' },
      },
    );

    expect(result).toEqual({ fotosRegistro: [{ id: 'raw-1' }], fotosPendentes: [] });
    expect(handleError).toHaveBeenCalledWith(error, {
      code: 'SYNC_FAILED',
      severity: 'warning',
      message: 'Falha no upload das fotos. O registro será salvo com fallback local.',
      context: { action: 'registro.saveRegistro.photoUpload', registroId: 'reg-1' },
    });
    expect(Toast.warning).not.toHaveBeenCalled();
  });

  it('nao chama upload quando nao ha fotos', async () => {
    const uploadPendingPhotos = vi.fn();

    await expect(
      persistRegistroPhotosForSave(
        { fotosRegistro: [], fotosPendentes: [] },
        {
          registroId: 'reg-1',
          uploadPendingPhotos,
          Toast: { warning: vi.fn() },
          handleError: vi.fn(),
          ErrorCodes: { SYNC_FAILED: 'SYNC_FAILED' },
        },
      ),
    ).resolves.toEqual({ fotosRegistro: [], fotosPendentes: [] });
    expect(uploadPendingPhotos).not.toHaveBeenCalled();
  });

  it('nao importa o adapter legado nem storage/UI diretamente', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'src/ui/views/registro/save/photos.js'),
      'utf8',
    );

    expect(source).not.toContain('ui/views/registro');
    expect(source).not.toContain('photoStorage');
    expect(source).not.toContain('core/toast');
    expect(source).not.toContain('components/photos');
  });
});
