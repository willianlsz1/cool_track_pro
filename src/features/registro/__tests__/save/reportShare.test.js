import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import {
  buildRegistroPostSaveToastActions,
  buildRegistroReportFilters,
  buildRegistroReportRoute,
  notifyRegistroShareStarted,
  runRegistroPdfAction,
  runRegistroReportFallback,
  runRegistroWhatsappAction,
  runRegistroWhatsappShare,
} from '../../save/reportShare.js';

describe('registro report/share helpers', () => {
  it('buildRegistroReportFilters preserva equipId e registroId', () => {
    expect(buildRegistroReportFilters({ equipId: 'eq-1', registroId: 'reg-1' })).toEqual({
      equipId: 'eq-1',
      registroId: 'reg-1',
    });
  });

  it('buildRegistroReportRoute preserva rota fallback com registroId opcional', () => {
    expect(
      buildRegistroReportRoute({ destination: 'pdf', equipId: 'eq-1', registroId: 'reg-1' }),
    ).toEqual({
      equipId: 'eq-1',
      intent: 'pdf',
      registroId: 'reg-1',
    });
    expect(
      buildRegistroReportRoute({
        destination: 'whatsapp',
        equipId: 'eq-1',
        includeEmptyRegistroId: true,
      }),
    ).toEqual({
      equipId: 'eq-1',
      intent: 'whatsapp',
      registroId: undefined,
    });
  });

  it('notifyRegistroShareStarted chama Toast com mensagem preservada', () => {
    const Toast = { success: vi.fn() };

    notifyRegistroShareStarted({ Toast });

    expect(Toast.success).toHaveBeenCalledWith('Serviço salvo. Abrindo WhatsApp...');
  });

  it('runRegistroWhatsappShare chama shareWhatsAppFlow com filters.registroId', async () => {
    const shareWhatsAppFlow = vi.fn(async () => true);

    await expect(
      runRegistroWhatsappShare({ equipId: 'eq-1', registroId: 'reg-1' }, { shareWhatsAppFlow }),
    ).resolves.toBe(true);

    expect(shareWhatsAppFlow).toHaveBeenCalledWith({
      filters: { equipId: 'eq-1', registroId: 'reg-1' },
    });
  });

  it('runRegistroReportFallback chama goTo com relatorio e registroId preservado', () => {
    const goTo = vi.fn();

    runRegistroReportFallback(
      { destination: 'whatsapp', equipId: 'eq-1', registroId: 'reg-1' },
      { goTo },
    );

    expect(goTo).toHaveBeenCalledWith('relatorio', {
      equipId: 'eq-1',
      intent: 'whatsapp',
      registroId: 'reg-1',
    });
  });

  it('runRegistroPdfAction chama exportPdfFlow com filters.registroId', () => {
    const exportPdfFlow = vi.fn(() => 'pdf');

    expect(runRegistroPdfAction({ equipId: 'eq-1', registroId: 'reg-1' }, { exportPdfFlow })).toBe(
      'pdf',
    );
    expect(exportPdfFlow).toHaveBeenCalledWith({
      filters: { equipId: 'eq-1', registroId: 'reg-1' },
    });
  });

  it('runRegistroWhatsappAction chama shareWhatsAppFlow com filters.registroId', async () => {
    const shareWhatsAppFlow = vi.fn(async () => 'whatsapp');

    await expect(
      runRegistroWhatsappAction({ equipId: 'eq-1', registroId: 'reg-1' }, { shareWhatsAppFlow }),
    ).resolves.toBe('whatsapp');
    expect(shareWhatsAppFlow).toHaveBeenCalledWith({
      filters: { equipId: 'eq-1', registroId: 'reg-1' },
    });
  });

  it('buildRegistroPostSaveToastActions preserva registroId em CTAs e fallback', async () => {
    const exportPdfFlow = vi.fn(async () => 'pdf');
    const shareWhatsAppFlow = vi.fn(async () => 'whatsapp');
    const goTo = vi.fn();
    const actions = buildRegistroPostSaveToastActions({
      exportPdfFlow,
      shareWhatsAppFlow,
      goTo,
    });

    await expect(
      actions.onAction({ destination: 'pdf', equipId: 'eq-1', registroId: 'reg-1' }),
    ).resolves.toBe('pdf');
    await expect(
      actions.onAction({ destination: 'whatsapp', equipId: 'eq-1', registroId: 'reg-1' }),
    ).resolves.toBe('whatsapp');
    actions.onFallback({ destination: 'pdf', equipId: 'eq-1', registroId: 'reg-1' });

    expect(exportPdfFlow).toHaveBeenCalledWith({
      filters: { equipId: 'eq-1', registroId: 'reg-1' },
    });
    expect(shareWhatsAppFlow).toHaveBeenCalledWith({
      filters: { equipId: 'eq-1', registroId: 'reg-1' },
    });
    expect(goTo).toHaveBeenCalledWith('relatorio', {
      equipId: 'eq-1',
      intent: 'pdf',
      registroId: 'reg-1',
    });
  });

  it('nao importa adapters, handlers, relatorio ou dominio PDF', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'src/features/registro/save/reportShare.js'),
      'utf8',
    );

    expect(source).not.toContain('ui/views/registro');
    expect(source).not.toContain('reportExportHandlers');
    expect(source).not.toContain('ui/views/relatorio');
    expect(source).not.toContain('domain/pdf');
    expect(source).not.toContain('ui/views/historico');
    expect(source).not.toContain('core/toast');
    expect(source).not.toContain('core/router');
  });
});
