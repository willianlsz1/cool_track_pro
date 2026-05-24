import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

import { filterRegistrosForReport } from '../domain/pdf/reportModel.js';
import {
  notifyRegistroCreateSaved,
  runRegistroDirectShareAfterSave,
} from '../features/registro/save/postSave.js';
import { buildReportFilters } from '../ui/controller/handlers/reportExportHandlers.js';
import { REGISTRO_ACTIONS } from '../ui/viewModels/registroContracts.js';

describe('registroId contract for Registro PDF/WhatsApp flows', () => {
  it('preserva registroId no save-and-share direto e no fallback para relatorio', async () => {
    const Toast = { success: vi.fn() };
    const shareWhatsAppFlow = vi.fn(async () => false);
    const goTo = vi.fn();
    const showProximaPreventivaPrompt = vi.fn();

    await runRegistroDirectShareAfterSave(
      { equipId: 'eq-1', registroId: 'reg-target' },
      { Toast, shareWhatsAppFlow, goTo, showProximaPreventivaPrompt },
    );

    expect(shareWhatsAppFlow).toHaveBeenCalledWith({
      filters: { equipId: 'eq-1', registroId: 'reg-target' },
    });
    expect(goTo).toHaveBeenCalledWith('relatorio', {
      equipId: 'eq-1',
      intent: 'whatsapp',
      registroId: 'reg-target',
    });
    expect(showProximaPreventivaPrompt).toHaveBeenCalledWith('reg-target');
  });

  it('preserva registroId nos CTAs PDF/WhatsApp do toast pos-save', async () => {
    let toastOptions;
    const PostSaveRegistroToast = {
      show: vi.fn((options) => {
        toastOptions = options;
        return true;
      }),
    };
    const exportPdfFlow = vi.fn(async () => true);
    const shareWhatsAppFlow = vi.fn(async () => true);
    const goTo = vi.fn();

    notifyRegistroCreateSaved(
      {
        equipId: 'eq-1',
        registroId: 'reg-target',
        saveContext: { equipamentos: [{ id: 'eq-1', nome: 'Split 01' }] },
      },
      {
        PostSaveRegistroToast,
        exportPdfFlow,
        shareWhatsAppFlow,
        goTo,
        Toast: { success: vi.fn() },
      },
    );

    expect(PostSaveRegistroToast.show).toHaveBeenCalledWith(
      expect.objectContaining({ equipId: 'eq-1', registroId: 'reg-target' }),
    );

    await toastOptions.onAction({
      destination: 'pdf',
      equipId: 'eq-1',
      registroId: 'reg-target',
    });
    await toastOptions.onAction({
      destination: 'whatsapp',
      equipId: 'eq-1',
      registroId: 'reg-target',
    });
    toastOptions.onFallback({
      destination: 'whatsapp',
      equipId: 'eq-1',
      registroId: 'reg-target',
    });

    expect(exportPdfFlow).toHaveBeenCalledWith({
      filters: { equipId: 'eq-1', registroId: 'reg-target' },
    });
    expect(shareWhatsAppFlow).toHaveBeenCalledWith({
      filters: { equipId: 'eq-1', registroId: 'reg-target' },
    });
    expect(goTo).toHaveBeenCalledWith('relatorio', {
      equipId: 'eq-1',
      intent: 'whatsapp',
      registroId: 'reg-target',
    });
  });

  it('preserva registroId nos filtros enviados ao relatorio/PDF/WhatsApp', () => {
    expect(buildReportFilters({ registroId: 'reg-target', equipId: 'eq-old' })).toEqual({
      registroId: 'reg-target',
      filtEq: 'eq-old',
      de: '',
      ate: '',
    });
  });

  it('prioriza filters.registroId sobre filtros antigos do relatorio', () => {
    const registros = [
      { id: 'reg-old', equipId: 'eq-old', data: '2026-05-01T08:00' },
      { id: 'reg-target', equipId: 'eq-new', data: '2026-05-02T08:00' },
    ];

    expect(
      filterRegistrosForReport(registros, {
        registroId: 'reg-target',
        filtEq: 'eq-old',
        de: '2026-05-01',
        ate: '2026-05-31',
      }),
    ).toEqual([{ id: 'reg-target', equipId: 'eq-new', data: '2026-05-02T08:00' }]);
  });

  it('mantem actions publicas e data-registro-id nos pontos DOM do fluxo', () => {
    const timelineSource = readFileSync('src/ui/views/historico/timelineRenderer.js', 'utf8');
    const registroContracts = Object.values(REGISTRO_ACTIONS);

    expect(registroContracts).toEqual(
      expect.arrayContaining(['save-and-share-registro', 'save-and-share-other-registro']),
    );
    expect(timelineSource).toContain('data-action="export-pdf"');
    expect(timelineSource).toContain('data-action="whatsapp-export"');
    expect(timelineSource).toContain('data-registro-id="${escapeAttr(');
  });
});
