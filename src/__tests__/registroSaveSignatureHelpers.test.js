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
} from '../ui/views/registro/save/signature.js';

const safeDataUrl = 'data:image/png;base64,abc123==';

describe('registro save signature helpers', () => {
  it('aposenta assinatura legada mesmo quando o gate antigo permitiria uso', () => {
    expect(getRegistroSignatureState({ registroId: 'reg-1', canUseSignature: true })).toEqual({
      registroId: 'reg-1',
      canUseSignature: false,
      disabledReason: 'legacy_signature_retired',
    });

    expect(getRegistroSignatureState({ registroId: 'reg-1', canUseSignature: false })).toEqual({
      registroId: 'reg-1',
      canUseSignature: false,
      disabledReason: 'not_available',
    });
  });

  it('nao carrega modulo de assinatura legado', async () => {
    const loadSignatureModule = vi.fn(async () => ({
      SignatureModal: { request: vi.fn() },
      saveSignatureForRecord: vi.fn(),
    }));

    await expect(
      loadRegistroSignatureSaveModule(
        { registroId: 'reg-1', canUseSignature: true },
        { loadSignatureModule },
      ),
    ).resolves.toEqual({});
    expect(loadSignatureModule).not.toHaveBeenCalled();
  });

  it('nao captura assinatura nem aciona modal legado', async () => {
    const SignatureModal = {
      CANCELED: Symbol('canceled'),
      request: vi.fn(async () => safeDataUrl),
    };

    await expect(
      captureRegistroSignatureIfNeeded(
        {
          registroId: 'reg-1',
          equipNome: 'Split 01',
          canUseSignature: true,
          SignatureModal,
        },
        {
          isSafeSignatureCaptureDataUrl: vi.fn(() => true),
          Toast: { warning: vi.fn(), info: vi.fn() },
          handleError: vi.fn(),
          ErrorCodes: { VALIDATION_ERROR: 'VALIDATION_ERROR' },
        },
      ),
    ).resolves.toEqual({ assinatura: null });
    expect(SignatureModal.request).not.toHaveBeenCalled();
  });

  it('nao persiste assinatura nem aciona storage legado', async () => {
    const saveSignatureForRecord = vi.fn(async () => ({ provider: 'supabase' }));

    await expect(
      persistRegistroSignatureForSave(
        { registroId: 'reg-1', assinatura: safeDataUrl, saveSignatureForRecord },
        {
          Toast: { info: vi.fn() },
          handleError: vi.fn(),
          ErrorCodes: { SYNC_FAILED: 'SYNC_FAILED' },
        },
      ),
    ).resolves.toBeNull();
    expect(saveSignatureForRecord).not.toHaveBeenCalled();
  });

  it('mantem payload de registro sem assinatura', () => {
    const signatureReference = { provider: 'supabase', path: 'signatures/reg-1.png' };

    expect(buildRegistroSignaturePayload({ assinatura: safeDataUrl, signatureReference })).toBe(
      false,
    );
    expect(
      buildRegistroSignaturePayload({ assinatura: safeDataUrl, signatureReference: null }),
    ).toBe(false);
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
      path.resolve(process.cwd(), 'src/ui/views/registro/save/signature.js'),
      'utf8',
    );

    expect(source).not.toContain('ui/views/registro');
    expect(source).not.toContain('components/signature');
    expect(source).not.toContain('signatureStorage');
    expect(source).not.toContain('core/toast');
    expect(source).not.toContain('core/modal');
  });
});
