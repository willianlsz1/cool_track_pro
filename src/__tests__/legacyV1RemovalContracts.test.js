import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readSource(path) {
  return readFileSync(path, 'utf8');
}

function listSourceFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = `${dir}/${entry}`;
    const stats = statSync(path);

    if (stats.isDirectory()) {
      return listSourceFiles(path);
    }

    if (/\.(?:ts|tsx|js|jsx|html|sql)$/.test(entry)) {
      return [path];
    }

    return [];
  });
}

function findMatches(files, pattern) {
  return files.flatMap((file) => {
    const source = readSource(file);
    return pattern.test(source) ? [file] : [];
  });
}

const MOJIBAKE_PATTERN = /(?:\u00c3[\u0080-\u00bf]|\u00c2[\u0080-\u00bf]|\ufffd)/;

describe('legacy v1 removal contracts', () => {
  it('does not keep the skipped legacy core-flow e2e smoke after v2 promotion', () => {
    expect(existsSync('e2e/specs/core-flow-smoke.spec.js')).toBe(false);
  });

  it('does not keep the legacy navigation and modal e2e after v2 promotion', () => {
    expect(existsSync('e2e/specs/navigation-and-modal.spec.js')).toBe(false);
  });

  it('does not keep the skipped legacy equipamentos visual e2e after v2 promotion', () => {
    expect(existsSync('e2e/specs/equipamentos-visual-smoke.spec.js')).toBe(false);
  });

  it('does not keep the skipped legacy unicode escapes e2e after v2 promotion', () => {
    expect(existsSync('e2e/specs/unicode-escapes.spec.js')).toBe(false);
  });

  it('does not keep the skipped legacy registro post-save e2e after v2 promotion', () => {
    expect(existsSync('e2e/specs/registro-post-save.spec.js')).toBe(false);
  });

  it('does not keep the legacy orcamentos visual e2e after v2 promotion', () => {
    expect(existsSync('e2e/specs/orcamentos-visual-smoke.spec.js')).toBe(false);
  });

  it('does not keep the legacy orcamentos v1 view, modal or handler', () => {
    const shellViewsSource = readSource('src/ui/shell/templates/views.js');
    const navigationModeSource = readSource('src/ui/shell/navigationMode.js');
    const navigationHandlersSource = readSource('src/ui/controller/handlers/navigationHandlers.js');
    const clientesPageSource = readSource('src/ui/views/clientes/pageRenderer.js');

    expect(existsSync('src/ui/views/orcamentos.js')).toBe(false);
    expect(existsSync('src/ui/components/orcamentoModal.js')).toBe(false);
    expect(existsSync('src/ui/controller/handlers/orcamentoHandlers.js')).toBe(false);
    expect(existsSync('src/ui/viewModels/orcamentosViewModel.js')).toBe(false);
    expect(shellViewsSource).not.toContain('view-orcamentos');
    expect(navigationModeSource).not.toContain("'orcamentos'");
    expect(navigationHandlersSource).not.toContain('go-orcamentos');
    expect(clientesPageSource).not.toContain('Novo orçamento');
  });

  it('keeps app-v2 independent from legacy relatorio, PDF/share and PMOC runtime', () => {
    const appV2Sources = listSourceFiles('src/app-v2');
    const checkpointsSummary = readSource('docs/rewrite/checkpoints-recentes-resumo.md');
    const forbiddenLegacyRuntimePattern =
      /(?:ui\/views\/relatorio|ui\\views\\relatorio|ui\/controller\/handlers\/reportExportHandlers|ui\\controller\\handlers\\reportExportHandlers|domain\/pdf|domain\\pdf|components\/pmocModal|components\\pmocModal|components\/pmocInfoModal|components\\pmocInfoModal)/;

    expect(checkpointsSummary).toContain('PDF/share v1');
    expect(checkpointsSummary).toContain('PMOC visual/copy');
    expect(findMatches(appV2Sources, forbiddenLegacyRuntimePattern)).toEqual([]);
  });

  it('does not keep the legacy PDF/share handler, feedback components or preview modal', () => {
    const shellModalsSource = readSource('src/ui/shell/templates/modals.js');

    expect(existsSync('src/ui/controller/handlers/reportExportHandlers.js')).toBe(false);
    expect(existsSync('src/ui/components/pdfSuccessToast.js')).toBe(false);
    expect(existsSync('src/ui/components/shareSuccessToast.js')).toBe(false);
    expect(existsSync('src/ui/components/pdfQuotaBadge.js')).toBe(false);
    expect(existsSync('src/__tests__/reportExportHandlers.test.js')).toBe(false);
    expect(existsSync('src/__tests__/reportExportContracts.test.js')).toBe(false);
    expect(existsSync('src/__tests__/pdfSuccessToast.test.js')).toBe(false);
    expect(existsSync('src/__tests__/shareSuccessToast.test.js')).toBe(false);
    expect(existsSync('src/__tests__/pdfQuotaBadge.test.js')).toBe(false);
    expect(shellModalsSource).not.toContain('modal-pdf-preview');
    expect(shellModalsSource).not.toContain('pdf-preview-confirm');
    expect(shellModalsSource).not.toContain('pdf-preview-frame');
  });

  it('does not keep legacy PDF share, WhatsApp export or report export domain helpers', () => {
    expect(existsSync('src/domain/pdf/shareReport.js')).toBe(false);
    expect(existsSync('src/domain/pdf/shareReportHelpers.js')).toBe(false);
    expect(existsSync('src/domain/whatsapp.js')).toBe(false);
    expect(existsSync('src/domain/reportExportHelpers.js')).toBe(false);
    expect(existsSync('src/__tests__/shareReport.test.js')).toBe(false);
    expect(existsSync('src/__tests__/shareReportHelpers.test.js')).toBe(false);
    expect(existsSync('src/__tests__/whatsappExport.test.js')).toBe(false);
    expect(existsSync('src/__tests__/reportExportHelpers.test.js')).toBe(false);
  });

  it('does not keep the legacy technical PDF generator or report sections', () => {
    expect(existsSync('src/domain/pdf.js')).toBe(false);
    expect(existsSync('src/domain/pdf/generatorHelpers.js')).toBe(false);
    expect(existsSync('src/domain/pdf/reportModel.js')).toBe(false);
    expect(existsSync('src/domain/pdf/sections/cover.js')).toBe(false);
    expect(existsSync('src/domain/pdf/sections/coverHelpers.js')).toBe(false);
    expect(existsSync('src/domain/pdf/sections/footer.js')).toBe(false);
    expect(existsSync('src/domain/pdf/sections/services.js')).toBe(false);
    expect(existsSync('src/domain/pdf/sections/servicesHelpers.js')).toBe(false);
    expect(existsSync('src/domain/pdf/sections/signatureHelpers.js')).toBe(false);
    expect(existsSync('src/domain/pdf/sections/signatures.js')).toBe(false);
    expect(existsSync('src/__tests__/pdfCover.contract.test.js')).toBe(false);
    expect(existsSync('src/__tests__/pdfCover.helpers.test.js')).toBe(false);
    expect(existsSync('src/__tests__/pdfCoverChecklistCursor.contract.test.js')).toBe(false);
    expect(existsSync('src/__tests__/pdfGenerator.helpers.test.js')).toBe(false);
    expect(existsSync('src/__tests__/pdfGenerator.mediaChecklist.contract.test.js')).toBe(false);
    expect(existsSync('src/__tests__/pdfGenerator.registroId.test.js')).toBe(false);
    expect(existsSync('src/__tests__/pdfServices.helpers.test.js')).toBe(false);
    expect(existsSync('src/__tests__/pdfSignature.helpers.test.js')).toBe(false);
    expect(existsSync('src/__tests__/reportModel.registroId.test.js')).toBe(false);
  });

  it('does not keep the legacy quote PDF generator after v2 quotes became local-only', () => {
    expect(existsSync('src/domain/pdf/orcamentoPdf.js')).toBe(false);
  });

  it('does not keep legacy PMOC/checklist PDF generators or PDF primitives', () => {
    expect(existsSync('src/domain/pdf/constants.js')).toBe(false);
    expect(existsSync('src/domain/pdf/primitives.js')).toBe(false);
    expect(existsSync('src/domain/pdf/safeLinks.js')).toBe(false);
    expect(existsSync('src/domain/pdf/sanitizers.js')).toBe(false);
    expect(existsSync('src/domain/pdf/sections/checklist.js')).toBe(false);
    expect(existsSync('src/domain/pdf/sections/checklistHelpers.js')).toBe(false);
    expect(existsSync('src/domain/pdf/sections/upsell.js')).toBe(false);
    expect(existsSync('src/domain/pdf/pmoc/constants.js')).toBe(false);
    expect(existsSync('src/domain/pdf/pmoc/pmocReport.js')).toBe(false);
    expect(existsSync('src/domain/pdf/pmoc/primitives.js')).toBe(false);
    expect(existsSync('src/domain/pdf/pmoc/sections/anexos.js')).toBe(false);
    expect(existsSync('src/domain/pdf/pmoc/sections/cover.js')).toBe(false);
    expect(existsSync('src/domain/pdf/pmoc/sections/plano.js')).toBe(false);
    expect(existsSync('src/domain/pdf/pmoc/sections/registry.js')).toBe(false);
    expect(existsSync('src/domain/pdf/pmoc/sections/schedule.js')).toBe(false);
    expect(existsSync('src/domain/pdf/pmoc/sections/termo.js')).toBe(false);
    expect(existsSync('src/__tests__/pdfChecklist.helpers.test.js')).toBe(false);
    expect(existsSync('src/__tests__/pdfSanitizers.test.js')).toBe(false);
    expect(existsSync('src/__tests__/pmocPdfLinks.security.test.js')).toBe(false);
    expect(existsSync('src/__tests__/pmocReport.test.js')).toBe(false);
  });

  it('does not keep the legacy relatorio v1 DOM view or renderers', () => {
    const shellViewsSource = readSource('src/ui/shell/templates/views.js');
    const navigationModeSource = readSource('src/ui/shell/navigationMode.js');
    const historicoSource = readSource('src/ui/views/historico.js');

    expect(existsSync('src/ui/views/relatorio.js')).toBe(false);
    expect(existsSync('src/ui/views/relatorio/cardsRenderer.js')).toBe(false);
    expect(existsSync('src/ui/views/relatorio/controlsRenderer.js')).toBe(false);
    expect(existsSync('src/ui/viewModels/relatorioContracts.js')).toBe(false);
    expect(existsSync('src/ui/viewModels/relatorioViewModel.js')).toBe(false);
    expect(shellViewsSource).not.toContain('view-relatorio');
    expect(shellViewsSource).not.toContain('relatorio-corpo');
    expect(navigationModeSource).not.toContain("'relatorio'");
    expect(historicoSource).not.toContain('data-nav="relatorio"');
  });

  it('does not keep the legacy historico functional e2e after v2 promotion', () => {
    expect(existsSync('e2e/specs/historico-functional-smoke.spec.js')).toBe(false);
  });

  it('does not keep the legacy relatorio visual e2e after v2 promotion', () => {
    expect(existsSync('e2e/specs/relatorio-visual-smoke.spec.js')).toBe(false);
  });

  it('does not keep the legacy registro visual e2e after v2 promotion', () => {
    expect(existsSync('e2e/specs/registro-visual-smoke.spec.js')).toBe(false);
  });

  it('does not keep the legacy relatorio export PMOC e2e after v2 promotion', () => {
    expect(existsSync('e2e/specs/relatorio-export-pmoc.spec.js')).toBe(false);
  });

  it('does not keep the unused legacy app bootstrap entrypoint', () => {
    const primaryHtml = readSource('index.html');
    const serviceWorkerRegisterSource = readSource('public/sw-register.js');

    expect(existsSync('src/app.js')).toBe(false);
    expect(primaryHtml).toContain('src="/src/app-v2/main.tsx"');
    expect(primaryHtml).not.toContain('/src/app.js');
    expect(serviceWorkerRegisterSource).not.toContain('app.js');
  });

  it('keeps the primary app-v2 entrypoint independent from the legacy v1 shell runtime', () => {
    const primaryHtml = readSource('index.html');
    const appV2Sources = listSourceFiles('src/app-v2');
    const primaryRuntimeSources = ['index.html', 'vite.config.js', ...appV2Sources];
    const forbiddenLegacyShellPattern =
      /src\/ui\/(?:controller|shell)|\.\.\/ui\/(?:controller|shell)|\.\.\/\.\.\/ui\/(?:controller|shell)/;

    expect(primaryHtml).toContain('src="/src/app-v2/main.tsx"');
    expect(primaryHtml).not.toContain('/src/ui/');
    expect(primaryHtml).not.toContain('/src/app.js');
    expect(findMatches(primaryRuntimeSources, forbiddenLegacyShellPattern)).toEqual([]);
  });

  it('does not keep the legacy feature Profile shim after moving callers to core', () => {
    expect(existsSync('src/features/profile.js')).toBe(false);
  });

  it('does not keep the legacy onboarding barrel or dashboard view', () => {
    expect(existsSync('src/ui/components/onboarding.js')).toBe(false);
    expect(existsSync('src/ui/views/dashboard.js')).toBe(false);
  });

  it('does not keep the legacy relatorio feature helper after moving copy to domain', () => {
    expect(existsSync('src/features/relatorio/export/reportExportHelpers.js')).toBe(false);
    expect(existsSync('src/features/relatorio/__tests__/export/reportExportHelpers.test.js')).toBe(
      false,
    );
  });

  it('does not keep legacy historico helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/historico')).toBe(false);
  });

  it('does not keep equipamentos view state under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/state')).toBe(false);
  });

  it('does not keep equipamentos view bridges under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/bridges')).toBe(false);
  });

  it('does not keep equipamentos view utils under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/utils')).toBe(false);
  });

  it('does not keep equipamentos nameplate helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/nameplate')).toBe(false);
  });

  it('does not keep equipamentos list renderer under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/ui/listRenderer.js')).toBe(false);
  });

  it('does not keep equipamentos header mount under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/ui/headerMount.js')).toBe(false);
  });

  it('does not keep equipamentos toolbar under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/ui/toolbar.js')).toBe(false);
  });

  it('does not keep equipamentos flat list renderer under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/ui/renderFlatList.js')).toBe(false);
  });

  it('does not keep equipamentos main renderer under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/ui/renderEquip.js')).toBe(false);
  });

  it('does not keep equipamentos setor UI/state under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/setor/setorUI.js')).toBe(false);
    expect(existsSync('src/features/equipamentos/setor/setorState.js')).toBe(false);
  });

  it('does not keep equipamentos setor navigation under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/setor/setorNavigation.js')).toBe(false);
  });

  it('does not keep equipamentos setor persistence under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/setor/setorPersist.js')).toBe(false);
  });

  it('does not keep equipamentos CRUD under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/crud')).toBe(false);
  });

  it('does not keep registro lifecycle helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/registro/lifecycle')).toBe(false);
  });

  it('does not keep registro checklist PMOC helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/registro/checklist')).toBe(false);
  });

  it('does not keep registro payload helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/registro/save/payload.js')).toBe(false);
    expect(existsSync('src/features/registro/__tests__/save/payload.test.js')).toBe(false);
  });

  it('does not keep registro persistence helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/registro/save/persistence.js')).toBe(false);
    expect(existsSync('src/features/registro/__tests__/save/persistence.test.js')).toBe(false);
  });

  it('does not keep registro photo helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/registro/save/photos.js')).toBe(false);
    expect(existsSync('src/features/registro/__tests__/save/photos.test.js')).toBe(false);
  });

  it('does not keep registro v1 photo capture/upload surface', () => {
    const registroSource = readSource('src/ui/views/registro.js');
    const registroTemplateSource = readSource('src/ui/shell/templates/views.js');
    expect(existsSync('src/ui/components/photos.js')).toBe(false);
    expect(existsSync('src/ui/views/registro/save/photos.js')).toBe(false);
    expect(existsSync('src/__tests__/registroSavePhotosHelpers.test.js')).toBe(false);
    expect(existsSync('src/__tests__/registroLegacyPhotosRender.test.js')).toBe(false);
    expect(existsSync('src/__tests__/exploratory/photo-base64-payload.test.js')).toBe(false);
    expect(existsSync('src/__tests__/regressions/photo-failure-path.test.js')).toBe(false);
    expect(registroSource).not.toContain('uploadPendingPhotos');
    expect(registroSource).not.toContain('Photos.render');
    expect(registroSource).not.toContain('Photos.pending');
    expect(registroSource).not.toContain('persistRegistroPhotosForSave');
    expect(registroTemplateSource).not.toContain('input-fotos');
    expect(registroTemplateSource).not.toContain('registro-photos-root');
    expect(registroTemplateSource).not.toContain('photo-drop-zone');
  });

  it('does not keep legacy photo lightbox runtime surface', () => {
    const historicoSource = readSource('src/ui/views/historico.js');
    const historicoTimelineSource = readSource('src/ui/views/historico/timelineRenderer.js');
    const equipamentosDetailControllerSource = readSource(
      'src/ui/views/equipamentos/ui/detailController.js',
    );
    const shellModalsSource = readSource('src/ui/shell/templates/modals.js');
    const navigationHandlersSource = readSource('src/ui/controller/handlers/navigationHandlers.js');
    const routerSource = readSource('src/core/router.js');
    const modalSource = readSource('src/core/modal.js');
    const eventsSource = readSource('src/core/events.js');

    expect(existsSync('src/ui/components/photos.js')).toBe(false);
    expect(historicoSource).not.toContain('Photos.openLightbox');
    expect(historicoSource).not.toContain('components/photos');
    expect(historicoTimelineSource).not.toContain('hist-open-photo');
    expect(historicoTimelineSource).not.toContain('data-photo-url');
    expect(equipamentosDetailControllerSource).not.toContain('Photos.openLightbox');
    expect(equipamentosDetailControllerSource).not.toContain('components/photos');
    expect(shellModalsSource).not.toContain('id="lightbox"');
    expect(shellModalsSource).not.toContain('lightbox-img');
    expect(navigationHandlersSource).not.toContain('close-lightbox');
    expect(navigationHandlersSource).not.toContain('components/photos');
    expect(routerSource).not.toContain('lightbox');
    expect(modalSource).not.toContain('lightbox');
    expect(eventsSource).not.toContain('lightbox');
  });

  it('does not keep equipamentos v1 photo editor/upload surface', () => {
    const equipamentosSource = readSource('src/ui/views/equipamentos.js');
    const equipamentoDetailSource = readSource('src/ui/views/equipamentos/ui/detail.js');
    const equipmentCardsSource = readSource('src/ui/views/equipamentos/equipmentCards.js');
    const shellModalsSource = readSource('src/ui/shell/templates/modals.js');
    const equipmentHandlersSource = readSource('src/ui/controller/handlers/equipmentHandlers.js');

    expect(existsSync('src/ui/views/equipamentos/fotos.js')).toBe(false);
    expect(existsSync('src/ui/components/equipmentPhotos.js')).toBe(false);
    expect(existsSync('src/__tests__/equipPhotosEditor.test.js')).toBe(false);
    expect(existsSync('src/__tests__/equipPhotosGate.test.js')).toBe(false);
    for (const source of [
      equipamentosSource,
      equipamentoDetailSource,
      equipmentCardsSource,
      shellModalsSource,
      equipmentHandlersSource,
    ]) {
      expect(source).not.toContain('open-eq-photos-editor');
      expect(source).not.toContain('save-eq-photos');
      expect(source).not.toContain('modal-eq-photos');
      expect(source).not.toContain('EquipmentPhotos');
    }
  });

  it('does not keep registro signature helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/registro/save/signature.js')).toBe(false);
    expect(existsSync('src/features/registro/__tests__/save/signature.test.js')).toBe(false);
  });

  it('does not keep legacy signature capture/viewer UI after retiring signature flows', () => {
    expect(existsSync('src/ui/components/signature.js')).toBe(false);
    expect(existsSync('src/ui/components/signature/signature-canvas.js')).toBe(false);
    expect(existsSync('src/ui/components/signature/signature-modal.js')).toBe(false);
    expect(existsSync('src/ui/components/signature/signature-viewer-modal.js')).toBe(false);
    expect(existsSync('src/__tests__/registroLegacySignatureRender.test.js')).toBe(false);
  });

  it('does not keep legacy signature storage after retiring signature flows', () => {
    const storageSource = readSource('src/core/storage.js');

    expect(existsSync('src/core/signatureStorage.js')).toBe(false);
    expect(existsSync('src/ui/components/signature/signature-storage.js')).toBe(false);
    expect(existsSync('src/__tests__/signatureStorage.test.js')).toBe(false);
    expect(existsSync('src/__tests__/signatureFlush.test.js')).toBe(false);
    expect(existsSync('src/__tests__/signatureResolver.test.js')).toBe(false);
    expect(storageSource).not.toContain('flushPendingSignatures');
    expect(storageSource).not.toContain('signatureStorage');
  });

  it('does not keep legacy signature modal ids in router blocking layers', () => {
    const routerSource = readSource('src/core/router.js');

    expect(routerSource).not.toContain('modal-signature-overlay');
    expect(routerSource).not.toContain('modal-signature-viewer-overlay');
    expect(routerSource).not.toContain('signature-capture');
    expect(routerSource).not.toContain('signature-viewer');
  });

  it('does not keep legacy registro signature surface after retiring signature flows', () => {
    const registroSource = readSource('src/ui/views/registro.js');
    const registroHandlersSource = readSource('src/ui/controller/handlers/registroHandlers.js');
    const registroTemplateSource = readSource('src/ui/shell/templates/views.js');

    expect(existsSync('src/ui/views/registro/save/signature.js')).toBe(false);
    expect(existsSync('src/ui/views/registro/signatureHint.js')).toBe(false);
    expect(existsSync('src/ui/viewModels/registroSignatureModel.js')).toBe(false);
    expect(existsSync('src/__tests__/registroSaveSignatureHelpers.test.js')).toBe(false);
    expect(existsSync('src/__tests__/registroSignatureHint.test.js')).toBe(false);
    expect(existsSync('src/__tests__/registroSignatureLegacyHandlers.test.jsx')).toBe(false);
    expect(registroSource).not.toContain('captureRegistroSignatureFromHint');
    expect(registroSource).not.toContain('mountRegistroSignature');
    expect(registroHandlersSource).not.toContain('REGISTRO_SIGNATURE_ACTIONS');
    expect(registroTemplateSource).not.toContain('registro-signature-hint');
    expect(registroTemplateSource).not.toContain('tour-signature-anchor');
  });

  it('does not keep legacy historico signature runtime after retiring signature flows', () => {
    const historicoSource = readSource('src/ui/views/historico.js');

    expect(historicoSource).not.toContain('cooltrack-sig-');
    expect(historicoSource).not.toContain('signature:');
  });

  it('does not keep legacy onboarding/tour copy surfaces after v1 removal', () => {
    expect(existsSync('src/ui/components/tour.js')).toBe(false);
    expect(existsSync('src/ui/components/onboarding/onboardingChecklist.js')).toBe(false);
    expect(existsSync('src/ui/components/onboarding/firstTimeExperience.css')).toBe(false);
  });

  it('does not keep the legacy PMOC formal modal surface', () => {
    const uiSources = listSourceFiles('src/ui');
    const offenders = findMatches(uiSources, /open-pmoc-modal/);

    expect(existsSync('src/ui/components/pmocModal.js')).toBe(false);
    expect(existsSync('src/ui/components/pmocInfoModal.js')).toBe(false);
    expect(offenders).toEqual([]);
  });

  it('does not keep the legacy Clientes PMOC panel surface', () => {
    const uiSources = listSourceFiles('src/ui');
    const offenders = findMatches(uiSources, /open-pmoc-panel|pmoc-focus|ClientePmocPanel/);

    expect(existsSync('src/ui/components/clientePmocPanel.js')).toBe(false);
    expect(offenders).toEqual([]);
  });

  it('does not keep the legacy Dashboard runtime cluster after app-v2 promotion', () => {
    const retiredDashboardFiles = [
      'src/ui/views/dashboard.js',
      'src/ui/views/dashboard/chartsRefresh.js',
      'src/ui/views/dashboard/onboarding.js',
      'src/ui/views/dashboard/proDraft.js',
      'src/ui/views/dashboard/readOnlyBlocks.js',
      'src/ui/viewModels/dashboardContracts.js',
      'src/ui/viewModels/dashboardViewModel.js',
      'src/ui/components/overflowBanner.js',
    ];
    const uiSources = listSourceFiles('src/ui');
    const offenders = findMatches(
      uiSources,
      /views\/dashboard|dashboardContracts|dashboardViewModel|renderDashboard|OverflowBanner|overflowBanner|dash-/,
    );

    expect(retiredDashboardFiles.filter((path) => existsSync(path))).toEqual([]);
    expect(offenders).toEqual([]);
  });

  it('does not keep legacy Historico PMOC attention surface', () => {
    const historicoSource = readSource('src/ui/views/historico.js');
    const historicoRenderHelpersSource = readSource(
      'src/ui/views/historico/helpers/render/renderHelpers.js',
    );

    expect(historicoSource).not.toContain('buildClientePmocDetails');
    expect(historicoSource).not.toContain('pmoc-');
    expect(historicoRenderHelpersSource).not.toContain('buildClientePmocDetails');
  });

  it('does not keep the legacy Cliente PMOC core helper after removing PMOC surfaces', () => {
    const runtimeSources = listSourceFiles('src').filter(
      (file) =>
        !file.startsWith('src/__tests__/') &&
        file !== 'src/__tests__/legacyV1RemovalContracts.test.js',
    );

    expect(existsSync('src/core/clientePmoc.js')).toBe(false);
    expect(existsSync('src/__tests__/clientePmoc.test.js')).toBe(false);
    expect(findMatches(runtimeSources, /buildClientePmocDetails|clientePmoc/)).toEqual([]);
  });

  it('does not keep the legacy PMOC progress core helper after removing client PMOC surfaces', () => {
    const runtimeSources = listSourceFiles('src').filter(
      (file) =>
        !file.startsWith('src/__tests__/') &&
        file !== 'src/__tests__/legacyV1RemovalContracts.test.js',
    );

    expect(existsSync('src/core/pmocProgress.js')).toBe(false);
    expect(existsSync('src/__tests__/pmocProgress.test.js')).toBe(false);
    expect(findMatches(runtimeSources, /getPmocSummaryForCliente|pmocProgress/)).toEqual([]);
  });

  it('does not keep the legacy PMOC report context helper after retiring PDF/share PMOC', () => {
    const runtimeSources = listSourceFiles('src').filter(
      (file) =>
        !file.startsWith('src/__tests__/') &&
        file !== 'src/__tests__/legacyV1RemovalContracts.test.js',
    );

    expect(existsSync('src/domain/pmoc/reportContext.js')).toBe(false);
    expect(existsSync('src/__tests__/pmocReportContext.test.js')).toBe(false);
    expect(
      findMatches(runtimeSources, /buildContextualPmocReportSummary|pmoc\/reportContext/),
    ).toEqual([]);
  });

  it('does not keep legacy Equipamentos PMOC context surface', () => {
    const detailSource = readSource('src/ui/views/equipamentos/ui/detail.js');
    const detailModelSource = readSource('src/ui/views/equipamentos/ui/detailModel.js');

    expect(detailSource).not.toContain('eq-pmoc-context');
    expect(detailSource).not.toContain('PMOC / Preventiva');
    expect(detailSource).not.toContain('pmocContext');
    expect(detailModelSource).not.toContain('buildEquipmentPmocContext');
    expect(detailModelSource).not.toContain('pmocContext');
    expect(detailModelSource).not.toContain('domain/pmoc/serviceType');
    expect(detailModelSource).not.toContain('isPreventivaOrPmocServiceType');
  });

  it('does not keep legacy PMOC service type detector', () => {
    const registroSource = readSource('src/ui/views/registro.js');
    const runtimeSources = listSourceFiles('src').filter(
      (file) =>
        !file.startsWith('src/__tests__/') &&
        file !== 'src/__tests__/legacyV1RemovalContracts.test.js',
    );

    expect(existsSync('src/domain/pmoc/serviceType.js')).toBe(false);
    expect(existsSync('src/__tests__/pmocServiceType.test.js')).toBe(false);
    expect(registroSource).not.toContain('isPreventivaOrPmocServiceType');
    expect(registroSource).not.toContain('pmocRecommended');
    expect(findMatches(runtimeSources, /domain\/pmoc\/serviceType|isPmocLikeServiceType/)).toEqual(
      [],
    );
  });

  it('does not keep legacy Android TWA or Netlify deploy artifacts in the web app repository', () => {
    const checkedSources = [
      '.env.example',
      'package.json',
      'vite.config.js',
      'index.html',
      'public/_headers',
      'public/sw.js',
      'src/core/auth.js',
      'src/core/emailNotification.js',
      'e2e/specs/app-v2-primary-entrypoint.spec.js',
      ...listSourceFiles('src').filter(
        (file) => file !== 'src/__tests__/legacyV1RemovalContracts.test.js',
      ),
      ...listSourceFiles('.github'),
    ];

    expect(existsSync('twa-build')).toBe(false);
    expect(existsSync('public/.well-known/assetlinks.json')).toBe(false);
    expect(existsSync('public/icons-backup-pre-redesign')).toBe(false);
    expect(existsSync('netlify.toml')).toBe(false);
    expect(
      findMatches(
        checkedSources,
        /twa-build|bubblewrap-cli|assetlinks|icons-backup-pre-redesign|netlify/i,
      ),
    ).toEqual([]);
  });

  it('does not keep legacy public landing images after app-v2 promotion', () => {
    const checkedSources = [
      'index.html',
      'public/manifest.json',
      'public/sw.js',
      'public/sw-register.js',
      ...listSourceFiles('src').filter(
        (file) => file !== 'src/__tests__/legacyV1RemovalContracts.test.js',
      ),
    ];

    [
      'public/brand/antes.png',
      'public/brand/depois.png',
      'public/brand/hero-app-equipamentos.png',
      'public/brand/passo-1-cadastro.png',
      'public/brand/passo-2-registro.png',
      'public/brand/passo-3-pdf.png',
      'public/brand/Perfil.jpg',
      'brand/antes.png',
      'brand/depois.png',
      'brand/hero-app-equipamentos.png',
      'brand/passo-1-cadastro.png',
      'brand/passo-2-registro.png',
      'brand/passo-3-pdf.png',
      'brand/Perfil.jpg',
    ].forEach((path) => {
      expect(existsSync(path)).toBe(false);
    });

    expect(existsSync('public/brand/favicon.svg')).toBe(true);
    expect(
      findMatches(
        checkedSources,
        /\/brand\/(?:antes|depois|hero-app-equipamentos|passo-[123]-|Perfil)|passo-3-pdf|hero-app-equipamentos/,
      ),
    ).toEqual([]);
  });

  it('keeps the public manifest aligned with the app-v2 primary experience', () => {
    const manifestSource = readSource('public/manifest.json');
    const manifest = JSON.parse(manifestSource);
    const searchableLabels = [
      manifest.description,
      ...(manifest.screenshots || []).map((item) => item.label),
      ...(manifest.shortcuts || []).flatMap((item) => [
        item.name,
        item.short_name,
        item.description,
        item.url,
      ]),
    ].join('\n');

    expect(searchableLabels).not.toMatch(/Dashboard|shortcut=dashboard/);
    expect(searchableLabels).not.toMatch(MOJIBAKE_PATTERN);
    expect(manifest.shortcuts.map((item) => item.name)).toContain('Hoje');
  });

  it('does not keep legacy internal route wording in public robots comments', () => {
    const robotsSource = readSource('public/robots.txt');

    expect(robotsSource).not.toMatch(/dashboard|\/registro|\/equipamentos/i);
    expect(robotsSource).not.toMatch(MOJIBAKE_PATTERN);
    expect(robotsSource).toContain('Cloudflare Pages');
  });

  it('keeps public entrypoint metadata readable in UTF-8', () => {
    const indexSource = readSource('index.html');
    const metadataSlice = indexSource.slice(0, indexSource.indexOf('<body>'));

    expect(metadataSlice).not.toMatch(MOJIBAKE_PATTERN);
    expect(metadataSlice).toContain('Gest\u00e3o de manuten\u00e7\u00e3o HVAC para campo');
    expect(metadataSlice).toContain(
      'experi\u00eancia web focada na opera\u00e7\u00e3o t\u00e9cnica',
    );
  });

  it('does not keep legacy wording in active public HTML comments', () => {
    const indexSource = readSource('index.html');

    expect(indexSource).not.toContain('plugins legacy');
  });

  it('does not keep retired-app wording in neutralized router comments', () => {
    const routerSource = readSource('src/core/router.js');

    expect(routerSource).not.toMatch(/\blegado\b|legacy|\bv1\.1\b/i);
    expect(routerSource).not.toMatch(MOJIBAKE_PATTERN);
  });

  it('does not keep the legacy nameplate capture component', () => {
    expect(existsSync('src/ui/components/nameplateCapture.js')).toBe(false);
  });

  it('does not keep legacy onboarding helper components', () => {
    expect(existsSync('src/ui/components/onboarding/firstTimeExperience.js')).toBe(false);
    expect(existsSync('src/ui/components/onboarding/onboardingBanner.js')).toBe(false);
  });

  it('does not keep retired-app wording in neutralized profile local names', () => {
    const profileSource = readSource('src/core/profile.js');

    expect(profileSource).not.toMatch(/\blegacyRaw\b|\blegacy\b/);
  });

  it('does not keep v1-era wording in public legal styles or active config comments', () => {
    const joined = [
      readSource('public/legal/_style.css'),
      readSource('eslint.config.js'),
      readSource('src/core/onlineStatus.js'),
      readSource('src/core/swUpdate.js'),
      readSource('src/core/toast.js'),
    ].join('\n');

    expect(joined).not.toMatch(/legacy e nova|v1\.0\.0/);
    expect(joined).not.toMatch(MOJIBAKE_PATTERN);
  });

  it('does not keep legacy PMOC copy in client, profile and equipment helper surfaces', () => {
    const checkedSources = [
      readSource('src/ui/views/equipamentos.js'),
      readSource('src/ui/views/equipamentos/setor/setorUI.js'),
      readSource('src/ui/views/equipamentos/crud/payload.js'),
      readSource('src/core/clientes.js'),
      readSource('src/core/state.js'),
      readSource('src/ui/controller/handlers/navigationHandlers.js'),
      readSource('src/ui/shell/templates/modals.js'),
    ];

    for (const source of checkedSources) {
      expect(source).not.toMatch(/PMOC|NBR 13971|pmoc_clientes_empresa/);
    }

    expect(readSource('src/ui/shell/templates/views.js')).not.toContain(
      'Checklist PMOC aparece só quando fizer sentido para o equipamento.',
    );
  });

  it('does not expose legacy PMOC wording in Registro checklist user-facing copy', () => {
    const checkedSources = [
      readSource('src/ui/views/registro.js'),
      readSource('src/ui/views/registro/checklist/pmocChecklist.js'),
      readSource('src/ui/views/registro/checklistRenderer.js'),
      readSource('src/ui/shell/templates/views.js'),
    ];

    for (const source of checkedSources) {
      expect(source).not.toMatch(
        /Checklist PMOC|PMOC formal|para PMOC|p\/ PMOC|pmoc_checklist_upsell_clicked/,
      );
    }
  });

  it('does not keep mojibake in active Registro checklist copy', () => {
    const joined = [
      readSource('src/ui/views/registro.js'),
      readSource('src/ui/views/registro/checklist/pmocChecklist.js'),
    ].join('\n');

    const forbiddenMojibakeSnippets = [
      'Manuten\u00c3\u00a7\u00c3\u00a3o preventiva agendada',
      'periodicidade n\u00c3\u00a3o definida',
      'Servi\u00c3\u00a7o',
      'itens obrigat\u00c3\u00b3rios pendentes',
      'item obrigat\u00c3\u00b3rio pendente',
    ];

    forbiddenMojibakeSnippets.forEach((snippet) => {
      expect(joined).not.toContain(snippet);
    });
  });

  it('does not keep legacy assinatura field in Registro create payload', () => {
    const registroSource = readSource('src/ui/views/registro.js');
    const persistenceSource = readSource('src/ui/views/registro/save/persistence.js');

    expect(registroSource).not.toContain('assinaturaPayload');
    expect(persistenceSource).not.toContain('assinaturaPayload');
    expect(persistenceSource).not.toContain('assinatura:');
  });

  it('does not keep legacy assinatura field in Registro storage and sync payloads', () => {
    const storageNormalizersSource = readSource('src/core/storage/storageNormalizers.js');
    const normalizersSource = readSource('src/core/storage/normalizers.js');
    const storageRemoteSyncSource = readSource('src/core/storage/storageRemoteSync.js');
    const remoteSource = readSource('src/core/storage/remote.js');

    for (const source of [
      storageNormalizersSource,
      normalizersSource,
      storageRemoteSyncSource,
      remoteSource,
    ]) {
      expect(source).not.toContain('assinatura:');
      expect(source).not.toContain('r.assinatura');
    }
  });

  it('does not keep Supabase Registro signature gate as an active test target', () => {
    const retirementMigration = readSource(
      'supabase/migrations/20260524193000_retire_registro_signature_gate.sql',
    );
    const storageDependencyMigration = readSource(
      'supabase/migrations/20260524194500_remove_registro_signature_storage_dependency.sql',
    );
    expect(existsSync('supabase/tests/10_signature_plan_gate.test.sql')).toBe(false);
    expect(existsSync('supabase/tests/README.md')).toBe(false);
    expect(retirementMigration).toContain('drop column if exists assinatura');
    expect(retirementMigration).toContain(
      'drop trigger if exists enforce_registro_signature_plan_gate_trigger',
    );
    expect(retirementMigration).toContain(
      'drop function if exists public.enforce_registro_signature_plan_gate()',
    );
    expect(storageDependencyMigration).not.toContain(
      'can_write_registro_signature_storage_object(',
    );
  });

  it('does not keep legacy wording in Supabase migration comments after sensitive retirements', () => {
    const migrationSources = listSourceFiles('supabase/migrations').map(readSource).join('\n');

    expect(migrationSources).not.toMatch(/\blegada?s?\b|legacy|\bdo v1\b/i);
  });

  it('does not keep legacy orcamento digital signature runtime or database surface', () => {
    const retirementMigration = readSource(
      'supabase/migrations/20260524200000_retire_orcamento_signature.sql',
    );

    expect(existsSync('src/core/orcamentos.js')).toBe(false);
    expect(existsSync('src/domain/orcamentoFollowUp.js')).toBe(false);
    expect(existsSync('src/__tests__/orcamentoFollowUp.test.js')).toBe(false);
    expect(retirementMigration).toContain('drop function if exists public.sign_orcamento_by_token');
    expect(retirementMigration).toContain('drop function if exists public.get_orcamento_by_token');
    expect(retirementMigration).toContain('drop column if exists share_token');
    expect(retirementMigration).toContain('drop column if exists assinatura_cliente_dataurl');
    expect(retirementMigration).toContain("where status = 'aguardando_assinatura'");
  });

  it('does not keep legacy digital signature as a commercial feature flag', () => {
    const operationalAccessPolicySource = readSource('src/core/plans/operationalAccessPolicy.js');

    expect(operationalAccessPolicySource).not.toContain('FEATURE_DIGITAL_SIGNATURE');
    expect(operationalAccessPolicySource).not.toContain('digital_signature');
  });
});
