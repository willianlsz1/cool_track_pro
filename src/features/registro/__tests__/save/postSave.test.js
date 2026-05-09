import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import {
  applyRegistroSavedHighlight,
  notifyRegistroCreateSaved,
  notifyRegistroEditSaved,
  persistRegistroLastClientAfterSave,
  resetRegistroCreateAfterSave,
  resetRegistroEditAfterSave,
  runRegistroDirectShareAfterSave,
  runRegistroEditNavigationAfterSave,
  runRegistroPreventivaPromptAfterSave,
} from '../../save/postSave.js';

describe('registro save post-save helpers', () => {
  it('persiste ultimo cliente via callback injetado', () => {
    const persistedPayload = { clienteNome: 'Cliente A', clienteContato: '11999990000' };
    const saveRegistroLastClient = vi.fn();

    persistRegistroLastClientAfterSave(persistedPayload, { saveRegistroLastClient });

    expect(saveRegistroLastClient).toHaveBeenCalledWith(persistedPayload);
  });

  it('marca highlight do registro salvo via SavedHighlight injetado', () => {
    const SavedHighlight = { markForHighlight: vi.fn() };

    applyRegistroSavedHighlight('reg-1', { SavedHighlight });

    expect(SavedHighlight.markForHighlight).toHaveBeenCalledWith('reg-1');
  });

  it('reseta edicao antes de limpar formulario', () => {
    const resetEditingState = vi.fn();
    const clearRegistro = vi.fn();

    resetRegistroEditAfterSave({ resetEditingState, clearRegistro });

    expect(resetEditingState).toHaveBeenCalledTimes(1);
    expect(clearRegistro).toHaveBeenCalledTimes(1);
    expect(resetEditingState.mock.invocationCallOrder[0]).toBeLessThan(
      clearRegistro.mock.invocationCallOrder[0],
    );
  });

  it('limpa formulario no pos-save de criacao', () => {
    const clearRegistro = vi.fn();

    resetRegistroCreateAfterSave({ clearRegistro });

    expect(clearRegistro).toHaveBeenCalledTimes(1);
  });

  it('notifica e navega no pos-save de edicao com contratos preservados', () => {
    const Toast = { success: vi.fn() };
    const goTo = vi.fn();

    notifyRegistroEditSaved({ Toast });
    runRegistroEditNavigationAfterSave({ goTo });

    expect(Toast.success).toHaveBeenCalledWith('Registro atualizado.');
    expect(goTo).toHaveBeenCalledWith('historico');
  });

  it('executa share direto na ordem Toast -> share -> prompt quando WhatsApp abre', async () => {
    const Toast = { success: vi.fn() };
    const shareWhatsAppFlow = vi.fn(async () => true);
    const goTo = vi.fn();
    const showProximaPreventivaPrompt = vi.fn();

    await expect(
      runRegistroDirectShareAfterSave(
        { equipId: 'eq-1', registroId: 'reg-1' },
        { Toast, shareWhatsAppFlow, goTo, showProximaPreventivaPrompt },
      ),
    ).resolves.toBe(true);

    expect(Toast.success).toHaveBeenCalledWith('Serviço salvo. Abrindo WhatsApp...');
    expect(shareWhatsAppFlow).toHaveBeenCalledWith({
      filters: { equipId: 'eq-1', registroId: 'reg-1' },
    });
    expect(goTo).not.toHaveBeenCalled();
    expect(showProximaPreventivaPrompt).toHaveBeenCalledWith('reg-1');
    expect(Toast.success.mock.invocationCallOrder[0]).toBeLessThan(
      shareWhatsAppFlow.mock.invocationCallOrder[0],
    );
    expect(shareWhatsAppFlow.mock.invocationCallOrder[0]).toBeLessThan(
      showProximaPreventivaPrompt.mock.invocationCallOrder[0],
    );
  });

  it('preserva fallback para relatorio quando share direto retorna falso', async () => {
    const Toast = { success: vi.fn() };
    const shareWhatsAppFlow = vi.fn(async () => false);
    const goTo = vi.fn();
    const showProximaPreventivaPrompt = vi.fn();

    await runRegistroDirectShareAfterSave(
      { equipId: 'eq-1', registroId: 'reg-1' },
      { Toast, shareWhatsAppFlow, goTo, showProximaPreventivaPrompt },
    );

    expect(goTo).toHaveBeenCalledWith('relatorio', {
      equipId: 'eq-1',
      intent: 'whatsapp',
      registroId: 'reg-1',
    });
    expect(goTo.mock.invocationCallOrder[0]).toBeLessThan(
      showProximaPreventivaPrompt.mock.invocationCallOrder[0],
    );
  });

  it('preserva fallback para relatorio quando share direto falha', async () => {
    const shareWhatsAppFlow = vi.fn(async () => {
      throw new Error('share failed');
    });
    const goTo = vi.fn();

    await runRegistroDirectShareAfterSave(
      { equipId: 'eq-1', registroId: 'reg-1' },
      {
        Toast: { success: vi.fn() },
        shareWhatsAppFlow,
        goTo,
        showProximaPreventivaPrompt: vi.fn(),
      },
    );

    expect(goTo).toHaveBeenCalledWith('relatorio', {
      equipId: 'eq-1',
      intent: 'whatsapp',
      registroId: 'reg-1',
    });
  });

  it('chama prompt de preventiva sem aguardar retorno', () => {
    const showProximaPreventivaPrompt = vi.fn(() => Promise.resolve('shown'));

    expect(
      runRegistroPreventivaPromptAfterSave('reg-1', { showProximaPreventivaPrompt }),
    ).toBeUndefined();
    expect(showProximaPreventivaPrompt).toHaveBeenCalledWith('reg-1');
  });

  it('preserva toast rico de criacao com CTAs de PDF e WhatsApp', async () => {
    let toastOptions;
    const PostSaveRegistroToast = {
      show: vi.fn((options) => {
        toastOptions = options;
        return true;
      }),
    };
    const exportPdfFlow = vi.fn(async () => 'pdf');
    const shareWhatsAppFlow = vi.fn(async () => 'whatsapp');
    const goTo = vi.fn();
    const Toast = { success: vi.fn() };

    notifyRegistroCreateSaved(
      {
        equipId: 'eq-1',
        registroId: 'reg-1',
        saveContext: { equipamentos: [{ id: 'eq-1', nome: 'Split 01' }] },
      },
      { PostSaveRegistroToast, exportPdfFlow, shareWhatsAppFlow, goTo, Toast },
    );

    expect(PostSaveRegistroToast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        equipId: 'eq-1',
        registroId: 'reg-1',
        equipName: 'Split 01',
      }),
    );
    await expect(
      toastOptions.onAction({ destination: 'pdf', equipId: 'eq-1', registroId: 'reg-1' }),
    ).resolves.toBe('pdf');
    expect(exportPdfFlow).toHaveBeenCalledWith({
      filters: { equipId: 'eq-1', registroId: 'reg-1' },
    });
    await expect(
      toastOptions.onAction({ destination: 'whatsapp', equipId: 'eq-1', registroId: 'reg-1' }),
    ).resolves.toBe('whatsapp');
    expect(shareWhatsAppFlow).toHaveBeenCalledWith({
      filters: { equipId: 'eq-1', registroId: 'reg-1' },
    });

    toastOptions.onFallback({ destination: 'pdf', equipId: 'eq-1', registroId: 'reg-1' });
    expect(goTo).toHaveBeenCalledWith('relatorio', {
      equipId: 'eq-1',
      intent: 'pdf',
      registroId: 'reg-1',
    });
    expect(Toast.success).not.toHaveBeenCalled();
  });

  it('usa toast simples quando toast rico recusa renderizacao', () => {
    const PostSaveRegistroToast = { show: vi.fn(() => false) };
    const Toast = { success: vi.fn() };

    notifyRegistroCreateSaved(
      {
        equipId: 'eq-1',
        registroId: 'reg-1',
        saveContext: { equipamentos: [] },
      },
      {
        PostSaveRegistroToast,
        exportPdfFlow: vi.fn(),
        shareWhatsAppFlow: vi.fn(),
        goTo: vi.fn(),
        Toast,
      },
    );

    expect(Toast.success).toHaveBeenCalledWith('Serviço registrado com sucesso.');
  });

  it('nao importa o adapter legado nem efeitos concretos diretamente', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'src/features/registro/save/postSave.js'),
      'utf8',
    );

    expect(source).not.toContain('ui/views/registro');
    expect(source).not.toContain('core/toast');
    expect(source).not.toContain('core/router');
    expect(source).not.toContain('reportExportHandlers');
    expect(source).not.toContain('postSaveRegistroToast');
    expect(source).not.toContain('onboarding');
  });
});
