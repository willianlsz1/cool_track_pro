import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import {
  buildRegistroSignaturePayload,
  captureRegistroSignatureIfNeeded,
  clearRegistroSignatureAfterSave,
  getRegistroSignatureState,
  loadRegistroSignatureSaveModule,
  persistRegistroSignatureForSave,
} from '../../save/signature.js';

const safeDataUrl = 'data:image/png;base64,abc123==';

describe('registro save signature helpers', () => {
  it('monta estado de assinatura preservando registroId e gate de plano', () => {
    expect(getRegistroSignatureState({ registroId: 'reg-1', canUseSignature: true })).toEqual({
      registroId: 'reg-1',
      canUseSignature: true,
    });

    expect(getRegistroSignatureState({ registroId: 'reg-1', canUseSignature: false })).toEqual({
      registroId: 'reg-1',
      canUseSignature: false,
    });
  });

  it('nao carrega modulo de assinatura quando o plano nao permite', async () => {
    const loadSignatureModule = vi.fn();

    await expect(
      loadRegistroSignatureSaveModule(
        { registroId: 'reg-1', canUseSignature: false },
        { loadSignatureModule },
      ),
    ).resolves.toEqual({});
    expect(loadSignatureModule).not.toHaveBeenCalled();
  });

  it('carrega modulo de assinatura usando loader injetado', async () => {
    const module = { SignatureModal: { request: vi.fn() }, saveSignatureForRecord: vi.fn() };
    const loadSignatureModule = vi.fn(async () => module);

    await expect(
      loadRegistroSignatureSaveModule(
        { registroId: 'reg-1', canUseSignature: true },
        { loadSignatureModule },
      ),
    ).resolves.toBe(module);
    expect(loadSignatureModule).toHaveBeenCalledTimes(1);
  });

  it('preserva fallback quando import dinamico de assinatura falha', async () => {
    const error = new Error('chunk failed');
    const loadSignatureModule = vi.fn(async () => {
      throw error;
    });
    const handleError = vi.fn();

    await expect(
      loadRegistroSignatureSaveModule(
        { registroId: 'reg-1', canUseSignature: true },
        {
          loadSignatureModule,
          handleError,
          ErrorCodes: { NETWORK_ERROR: 'NETWORK_ERROR' },
        },
      ),
    ).resolves.toEqual({});
    expect(handleError).toHaveBeenCalledWith(error, {
      code: 'NETWORK_ERROR',
      severity: 'warning',
      message: 'Não foi possível carregar o módulo de assinatura.',
      context: { action: 'registro.saveRegistro.signatureImport' },
    });
  });

  it('captura assinatura valida via SignatureModal sem tocar storage', async () => {
    const SignatureModal = {
      CANCELED: Symbol('canceled'),
      request: vi.fn(async () => safeDataUrl),
    };
    const isSafeSignatureCaptureDataUrl = vi.fn(() => true);

    await expect(
      captureRegistroSignatureIfNeeded(
        {
          registroId: 'reg-1',
          equipNome: 'Split 01',
          canUseSignature: true,
          SignatureModal,
        },
        {
          isSafeSignatureCaptureDataUrl,
          Toast: { warning: vi.fn(), info: vi.fn() },
          handleError: vi.fn(),
          ErrorCodes: { VALIDATION_ERROR: 'VALIDATION_ERROR' },
        },
      ),
    ).resolves.toEqual({ assinatura: safeDataUrl });
    expect(SignatureModal.request).toHaveBeenCalledWith('reg-1', 'Split 01');
    expect(isSafeSignatureCaptureDataUrl).toHaveBeenCalledWith(safeDataUrl);
  });

  it('preserva comportamento real de CANCELED: nao aborta e retorna sem assinatura', async () => {
    const canceled = Symbol('canceled');
    const SignatureModal = {
      CANCELED: canceled,
      request: vi.fn(async () => canceled),
    };
    const Toast = { warning: vi.fn(), info: vi.fn() };

    await expect(
      captureRegistroSignatureIfNeeded(
        {
          registroId: 'reg-1',
          equipNome: 'Split 01',
          canUseSignature: true,
          SignatureModal,
        },
        {
          isSafeSignatureCaptureDataUrl: vi.fn(),
          Toast,
          handleError: vi.fn(),
          ErrorCodes: { VALIDATION_ERROR: 'VALIDATION_ERROR' },
        },
      ),
    ).resolves.toEqual({ assinatura: null });
    expect(Toast.info).toHaveBeenCalledWith(
      'Registro salvo sem assinatura. Você pode adicioná-la depois.',
    );
    expect(Toast.warning).not.toHaveBeenCalled();
  });

  it('avisa quando modal retorna data URL invalida e segue sem assinatura', async () => {
    const SignatureModal = {
      CANCELED: Symbol('canceled'),
      request: vi.fn(async () => 'javascript:alert(1)'),
    };
    const Toast = { warning: vi.fn(), info: vi.fn() };

    await expect(
      captureRegistroSignatureIfNeeded(
        {
          registroId: 'reg-1',
          equipNome: 'Split 01',
          canUseSignature: true,
          SignatureModal,
        },
        {
          isSafeSignatureCaptureDataUrl: vi.fn(() => false),
          Toast,
          handleError: vi.fn(),
          ErrorCodes: { VALIDATION_ERROR: 'VALIDATION_ERROR' },
        },
      ),
    ).resolves.toEqual({ assinatura: null });
    expect(Toast.warning).toHaveBeenCalledWith('Assinatura ignorada por conter dados inválidos.');
  });

  it('preserva fallback quando SignatureModal falha', async () => {
    const error = new Error('modal failed');
    const SignatureModal = {
      CANCELED: Symbol('canceled'),
      request: vi.fn(async () => {
        throw error;
      }),
    };
    const handleError = vi.fn();

    await expect(
      captureRegistroSignatureIfNeeded(
        {
          registroId: 'reg-1',
          equipNome: 'Split 01',
          canUseSignature: true,
          SignatureModal,
        },
        {
          isSafeSignatureCaptureDataUrl: vi.fn(),
          Toast: { warning: vi.fn(), info: vi.fn() },
          handleError,
          ErrorCodes: { VALIDATION_ERROR: 'VALIDATION_ERROR' },
        },
      ),
    ).resolves.toEqual({ assinatura: null });
    expect(handleError).toHaveBeenCalledWith(error, {
      code: 'VALIDATION_ERROR',
      severity: 'warning',
      message: 'Não foi possível registrar a assinatura digital.',
      context: { action: 'registro.saveRegistro.signatureRequest', registroId: 'reg-1' },
    });
  });

  it('persiste assinatura com saveSignatureForRecord e retorna reference', async () => {
    const signatureReference = { provider: 'supabase', path: 'signatures/reg-1.png' };
    const saveSignatureForRecord = vi.fn(async () => signatureReference);

    await expect(
      persistRegistroSignatureForSave(
        { registroId: 'reg-1', assinatura: safeDataUrl, saveSignatureForRecord },
        {
          Toast: { info: vi.fn() },
          handleError: vi.fn(),
          ErrorCodes: { SYNC_FAILED: 'SYNC_FAILED' },
        },
      ),
    ).resolves.toBe(signatureReference);
    expect(saveSignatureForRecord).toHaveBeenCalledWith('reg-1', safeDataUrl);
  });

  it('preserva aviso de fallback quando storage retorna null', async () => {
    const saveSignatureForRecord = vi.fn(async () => null);
    const Toast = { info: vi.fn() };

    await expect(
      persistRegistroSignatureForSave(
        { registroId: 'reg-1', assinatura: safeDataUrl, saveSignatureForRecord },
        {
          Toast,
          handleError: vi.fn(),
          ErrorCodes: { SYNC_FAILED: 'SYNC_FAILED' },
        },
      ),
    ).resolves.toBeNull();
    expect(Toast.info).toHaveBeenCalledWith(
      'Assinatura salva no dispositivo. Será sincronizada quando conectar.',
    );
  });

  it('preserva fallback quando storage falha', async () => {
    const error = new Error('offline');
    const saveSignatureForRecord = vi.fn(async () => {
      throw error;
    });
    const handleError = vi.fn();

    await expect(
      persistRegistroSignatureForSave(
        { registroId: 'reg-1', assinatura: safeDataUrl, saveSignatureForRecord },
        {
          Toast: { info: vi.fn() },
          handleError,
          ErrorCodes: { SYNC_FAILED: 'SYNC_FAILED' },
        },
      ),
    ).resolves.toBeNull();
    expect(handleError).toHaveBeenCalledWith(error, {
      code: 'SYNC_FAILED',
      severity: 'warning',
      message: 'Assinatura ficou salva localmente. Tentaremos sincronizar depois.',
      context: { action: 'registro.saveRegistro.signatureUpload', registroId: 'reg-1' },
    });
  });

  it('monta payload preservando reference ou boolean fallback', () => {
    const signatureReference = { provider: 'supabase', path: 'signatures/reg-1.png' };

    expect(buildRegistroSignaturePayload({ assinatura: safeDataUrl, signatureReference })).toBe(
      signatureReference,
    );
    expect(
      buildRegistroSignaturePayload({ assinatura: safeDataUrl, signatureReference: null }),
    ).toBe(true);
    expect(buildRegistroSignaturePayload({ assinatura: null, signatureReference: null })).toBe(
      false,
    );
  });

  it('limpa draft por callbacks sem depender de DOM ou adapter', () => {
    const clearDraft = vi.fn();
    const remountResult = Promise.resolve('mounted');
    const remountSignature = vi.fn(() => remountResult);

    expect(clearRegistroSignatureAfterSave({ clearDraft, remountSignature })).toBe(remountResult);
    expect(clearDraft).toHaveBeenCalledTimes(1);
    expect(remountSignature).toHaveBeenCalledTimes(1);
  });

  it('nao importa o adapter legado nem UI/storage diretamente', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'src/features/registro/save/signature.js'),
      'utf8',
    );

    expect(source).not.toContain('ui/views/registro');
    expect(source).not.toContain('components/signature');
    expect(source).not.toContain('signatureStorage');
    expect(source).not.toContain('core/toast');
    expect(source).not.toContain('core/modal');
  });
});
