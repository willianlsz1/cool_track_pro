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

    if (/\.(?:ts|tsx|js|jsx|html)$/.test(entry)) {
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
    const clientesContractsSource = readSource('src/ui/viewModels/clientesContracts.js');
    const clientesPageSource = readSource('src/ui/views/clientes/pageRenderer.js');

    expect(existsSync('src/ui/views/orcamentos.js')).toBe(false);
    expect(existsSync('src/ui/components/orcamentoModal.js')).toBe(false);
    expect(existsSync('src/ui/controller/handlers/orcamentoHandlers.js')).toBe(false);
    expect(existsSync('src/ui/viewModels/orcamentosViewModel.js')).toBe(false);
    expect(shellViewsSource).not.toContain('view-orcamentos');
    expect(navigationModeSource).not.toContain("'orcamentos'");
    expect(navigationHandlersSource).not.toContain('go-orcamentos');
    expect(clientesContractsSource).not.toContain('novo-orcamento');
    expect(clientesPageSource).not.toContain('Novo orçamento');
  });

  it('keeps app-v2 independent from legacy relatorio, PDF/share and PMOC runtime', () => {
    const appV2Sources = listSourceFiles('src/app-v2');
    const forbiddenLegacyRuntimePattern =
      /(?:ui\/views\/relatorio|ui\\views\\relatorio|ui\/controller\/handlers\/reportExportHandlers|ui\\controller\\handlers\\reportExportHandlers|domain\/pdf|domain\\pdf|components\/pmocModal|components\\pmocModal|components\/pmocInfoModal|components\\pmocInfoModal)/;

    expect(existsSync('docs/rewrite/app-v2-remocao-v1-cp54b-relatorio-readiness.md')).toBe(true);
    expect(existsSync('docs/rewrite/app-v2-remocao-v1-cp54c-pdf-share-readiness.md')).toBe(true);
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

  it('does not keep Profile re-exported by the legacy onboarding barrel', () => {
    const onboardingBarrelSource = readSource('src/ui/components/onboarding.js');

    expect(onboardingBarrelSource).not.toMatch(/export\s+\{\s*Profile\s*\}/);
    expect(readSource('src/ui/views/dashboard.js')).toContain(
      "import { Profile } from '../../core/profile.js';",
    );
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
    const registroContractsSource = readSource('src/ui/viewModels/registroContracts.js');
    const registroViewModelSource = readSource('src/ui/viewModels/registroViewModel.js');

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
    expect(registroContractsSource).not.toContain('registro-signature-capture');
    expect(registroContractsSource).not.toContain('registro-signature-open');
    expect(registroContractsSource).not.toContain('registro-signature-remove');
    expect(registroContractsSource).not.toContain('tour-signature-anchor');
    expect(registroViewModelSource).not.toContain('signature:');
    expect(registroViewModelSource).not.toContain('isPlusOrHigher');
  });

  it('does not keep legacy historico signature runtime after retiring signature flows', () => {
    const historicoSource = readSource('src/ui/views/historico.js');
    const historicoViewModelSource = readSource('src/ui/viewModels/historicoViewModel.js');

    expect(historicoSource).not.toContain('cooltrack-sig-');
    expect(historicoSource).not.toContain('signature:');
    expect(historicoViewModelSource).not.toContain('hasSignature');
  });

  it('does not keep legacy signature promises in onboarding and PMOC copy', () => {
    const tourSource = readSource('src/ui/components/tour.js');
    const onboardingChecklistSource = readSource(
      'src/ui/components/onboarding/onboardingChecklist.js',
    );
    const firstTimeExperienceCss = readSource(
      'src/ui/components/onboarding/firstTimeExperience.css',
    );
    const pmocInfoModalSource = readSource('src/ui/components/pmocInfoModal.js');

    expect(tourSource).not.toContain('assinatura');
    expect(onboardingChecklistSource).not.toContain('assinatura');
    expect(firstTimeExperienceCss).not.toContain('ftx-signature');
    expect(pmocInfoModalSource).not.toContain('assinatura');
    expect(pmocInfoModalSource).not.toContain('assinaturas');
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
    const supabaseTestsReadme = readSource('supabase/tests/README.md');

    expect(existsSync('supabase/tests/10_signature_plan_gate.test.sql')).toBe(false);
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
    expect(supabaseTestsReadme).not.toContain('10_signature_plan_gate.test.sql');
  });

  it('does not keep legacy orcamento digital signature runtime or database surface', () => {
    const orcamentosSource = readSource('src/core/orcamentos.js');
    const followUpSource = readSource('src/domain/orcamentoFollowUp.js');
    const retirementMigration = readSource(
      'supabase/migrations/20260524200000_retire_orcamento_signature.sql',
    );

    expect(orcamentosSource).not.toContain('generateShareToken');
    expect(orcamentosSource).not.toContain('buildShareUrl');
    expect(orcamentosSource).not.toContain('fetchOrcamentoByToken');
    expect(orcamentosSource).not.toContain('signOrcamentoByToken');
    expect(orcamentosSource).not.toContain('share_token');
    expect(orcamentosSource).not.toContain('assinatura_cliente_dataurl');
    expect(orcamentosSource).not.toContain('orc-sign');
    expect(followUpSource).not.toContain('aguardando_assinatura');
    expect(followUpSource).not.toContain('assinadoEm');
    expect(retirementMigration).toContain('drop function if exists public.sign_orcamento_by_token');
    expect(retirementMigration).toContain('drop function if exists public.get_orcamento_by_token');
    expect(retirementMigration).toContain('drop column if exists share_token');
    expect(retirementMigration).toContain('drop column if exists assinatura_cliente_dataurl');
    expect(retirementMigration).toContain("where status = 'aguardando_assinatura'");
  });

  it('does not keep legacy digital signature as a commercial feature flag', () => {
    const subscriptionPlansSource = readSource('src/core/plans/subscriptionPlans.js');

    expect(subscriptionPlansSource).not.toContain('FEATURE_DIGITAL_SIGNATURE');
    expect(subscriptionPlansSource).not.toContain('digital_signature');
  });

  it('does not keep registro post-save/share helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/registro/save/postSave.js')).toBe(false);
    expect(existsSync('src/features/registro/save/reportShare.js')).toBe(false);
    expect(existsSync('src/features/registro/__tests__/save/postSave.test.js')).toBe(false);
    expect(existsSync('src/features/registro/__tests__/save/reportShare.test.js')).toBe(false);
  });

  it('does not keep registro legacy post-save share/fork adapters after retiring PDF/WhatsApp CTAs', () => {
    expect(existsSync('src/ui/views/registro/save/reportShare.js')).toBe(false);
    expect(existsSync('src/ui/components/registroClienteForkSheet.js')).toBe(false);
    expect(existsSync('src/__tests__/registroSaveReportShareHelpers.test.js')).toBe(false);
    expect(existsSync('src/__tests__/registroClientFork.test.js')).toBe(false);
    expect(existsSync('src/__tests__/registroPostSaveLegacyFlow.test.js')).toBe(false);
  });

  it('does not keep user data account handlers under src/features after co-locating with account UI', () => {
    expect(existsSync('src/features/userData.js')).toBe(false);
  });

  it('does not keep equipamentos detail/view helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/ui/detail.js')).toBe(false);
    expect(existsSync('src/features/equipamentos/ui/detailController.js')).toBe(false);
    expect(existsSync('src/features/equipamentos/ui/detailModel.js')).toBe(false);
    expect(existsSync('src/features/equipamentos/ui/viewEquip.js')).toBe(false);
  });

  it('does not keep equipamentos edit/delete UI helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/ui/openEditEquip.js')).toBe(false);
    expect(existsSync('src/features/equipamentos/ui/deleteEquip.js')).toBe(false);
  });

  it('does not keep the legacy configuracoes route, view or dedicated styles', () => {
    const shellViewsSource = readSource('src/ui/shell/templates/views.js');

    expect(existsSync('src/ui/controller/routes.js')).toBe(false);
    expect(existsSync('src/ui/views/configuracoes.js')).toBe(false);
    expect(shellViewsSource).not.toContain('view-configuracoes');
    expect(existsSync('src/ui/shell/templates/sidebar.js')).toBe(false);
    expect(existsSync('src/ui/shell/templates/header.js')).toBe(false);
    expect(existsSync('src/assets/styles/redesign.css')).toBe(false);
    expect(existsSync('src/assets/styles/components.css')).toBe(false);
  });

  it('does not keep orphan legacy top-level stylesheets after v2 promotion', () => {
    const primaryHtml = readSource('index.html');

    expect(existsSync('src/assets/styles/base.css')).toBe(false);
    expect(existsSync('src/assets/styles/components.css')).toBe(false);
    expect(existsSync('src/assets/styles/desktop-fonts.css')).toBe(false);
    expect(existsSync('src/assets/styles/equipment-detail-cp-h.css')).toBe(false);
    expect(existsSync('src/assets/styles/equipment-list-cp-i.css')).toBe(false);
    expect(existsSync('src/assets/styles/layout.css')).toBe(false);
    expect(existsSync('src/assets/styles/redesign.css')).toBe(false);
    expect(existsSync('src/assets/styles/theme-premium.css')).toBe(false);
    expect(existsSync('src/assets/styles/tokens.css')).toBe(false);
    expect(existsSync('src/assets/styles/ux-polish.css')).toBe(false);
    expect(primaryHtml).not.toContain('base.css');
    expect(primaryHtml).not.toContain('components.css');
    expect(primaryHtml).not.toContain('desktop-fonts.css');
    expect(primaryHtml).not.toContain('equipment-detail-cp-h.css');
    expect(primaryHtml).not.toContain('equipment-list-cp-i.css');
    expect(primaryHtml).not.toContain('layout.css');
    expect(primaryHtml).not.toContain('redesign.css');
    expect(primaryHtml).not.toContain('theme-premium.css');
    expect(primaryHtml).not.toContain('tokens.css');
    expect(primaryHtml).not.toContain('ux-polish.css');
  });

  it('does not keep orphan legacy component stylesheets after v2 promotion', () => {
    const legacyComponentStyles = [
      'src/assets/styles/components/_checklist.css',
      'src/assets/styles/components/_clientes.css',
      'src/assets/styles/components/_equip-hero.css',
      'src/assets/styles/components/_install-app.css',
      'src/assets/styles/components/_onboarding-checklist.css',
      'src/assets/styles/components/_orcamento-modal.css',
      'src/assets/styles/components/_pmoc.css',
      'src/assets/styles/components/_push-optin.css',
      'src/assets/styles/components/_setor-card.css',
      'src/assets/styles/components/_setor-modal.css',
      'src/assets/styles/components/_tour.css',
    ];

    expect(legacyComponentStyles.filter((path) => existsSync(path))).toEqual([]);
  });

  it('does not keep the legacy privacidade route or internal static view', () => {
    const shellViewsSource = readSource('src/ui/shell/templates/views.js');

    expect(existsSync('src/ui/controller/routes.js')).toBe(false);
    expect(existsSync('src/ui/views/privacidade.js')).toBe(false);
    expect(existsSync('src/ui/views/conta.js')).toBe(false);
    expect(shellViewsSource).not.toContain('view-privacidade');
    expect(shellViewsSource).not.toContain('view-conta');
  });

  it('does not keep the legacy alertas standalone route, view or shell shortcuts', () => {
    const shellViewsSource = readSource('src/ui/shell/templates/views.js');
    const headerComposableSource = readSource('src/ui/composables/header.js');
    const navigationHandlersSource = readSource('src/ui/controller/handlers/navigationHandlers.js');
    const navigationModeSource = readSource('src/ui/shell/navigationMode.js');

    expect(existsSync('src/ui/controller/routes.js')).toBe(false);
    expect(existsSync('src/ui/views/alertas.js')).toBe(false);
    expect(existsSync('src/ui/viewModels/alertasViewModel.js')).toBe(false);
    expect(shellViewsSource).not.toContain('view-alertas');
    expect(shellViewsSource).not.toContain('alertas-contextual');
    expect(shellViewsSource).not.toContain('lista-alertas');
    expect(existsSync('src/ui/shell/templates/sidebar.js')).toBe(false);
    expect(existsSync('src/ui/shell/templates/header.js')).toBe(false);
    expect(headerComposableSource).not.toContain('header-alert-pill');
    expect(headerComposableSource).not.toContain('header-help-menu-alert-badge');
    expect(navigationHandlersSource).not.toContain("on('go-alertas'");
    expect(navigationModeSource).not.toContain("'alertas'");
  });
});
