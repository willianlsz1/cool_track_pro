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
  runRegistroEditNavigationAfterSave,
  runRegistroPreventivaPromptAfterSave,
} from '../ui/views/registro/save/postSave.js';

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

  it('chama prompt de preventiva sem aguardar retorno', () => {
    const showProximaPreventivaPrompt = vi.fn(() => Promise.resolve('shown'));

    expect(
      runRegistroPreventivaPromptAfterSave('reg-1', { showProximaPreventivaPrompt }),
    ).toBeUndefined();
    expect(showProximaPreventivaPrompt).toHaveBeenCalledWith('reg-1');
  });

  it('preserva toast simples de criacao sem CTAs de PDF e WhatsApp', () => {
    let toastOptions;
    const PostSaveRegistroToast = {
      show: vi.fn((options) => {
        toastOptions = options;
        return true;
      }),
    };
    const Toast = { success: vi.fn() };

    notifyRegistroCreateSaved(
      {
        equipId: 'eq-1',
        registroId: 'reg-1',
        saveContext: { equipamentos: [{ id: 'eq-1', nome: 'Split 01' }] },
      },
      { PostSaveRegistroToast, Toast },
    );

    expect(PostSaveRegistroToast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        equipId: 'eq-1',
        registroId: 'reg-1',
        equipName: 'Split 01',
      }),
    );
    expect(toastOptions.onAction).toBeUndefined();
    expect(toastOptions.onFallback).toBeUndefined();
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
        Toast,
      },
    );

    expect(Toast.success).toHaveBeenCalledWith('Serviço registrado com sucesso.');
  });

  it('nao importa o adapter legado nem efeitos concretos diretamente', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'src/ui/views/registro/save/postSave.js'),
      'utf8',
    );

    expect(source).not.toContain('ui/views/registro');
    expect(source).not.toContain('core/toast');
    expect(source).not.toContain('core/router');
    expect(source).not.toContain('reportExportHandlers');
    expect(source).not.toContain('postSaveRegistroToast');
    expect(source).not.toContain('reportShare');
    expect(source).not.toContain('onboarding');
  });
});
