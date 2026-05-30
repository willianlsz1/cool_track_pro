import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  CONTEXTUAL_ONBOARDING_STORAGE_KEY,
  OAUTH_PENDING_STORAGE_KEY,
} from '../core/storage/constants.js';

function readSource(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function listSourceFiles(dir) {
  if (!existsSync(dir)) return [];
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

function findUnexpectedLineMatches(files, matchPattern, allowedPatternsByFile) {
  return files.flatMap((file) => {
    const allowedPatterns = allowedPatternsByFile.get(file) || [];
    return readSource(file)
      .split(/\r?\n/)
      .flatMap((line, index) => {
        if (!matchPattern.test(line)) return [];
        if (allowedPatterns.some((pattern) => pattern.test(line))) return [];
        return [`${file}:${index + 1}: ${line.trim()}`];
      });
  });
}

const MOJIBAKE_PATTERN = /(?:\u00c3[\u0080-\u00bf]|\u00c2[\u0080-\u00bf]|\ufffd)/;

describe('legacy v1 removal storage and asset contracts', () => {
  it('does not keep the legacy photo storage/upload runtime', () => {
    expect(existsSync('src/core/photoStorage.js')).toBe(false);
    expect(existsSync('src/core/storage/storageMigrations.js')).toBe(false);
    expect(existsSync('src/__tests__/photoStorage.test.js')).toBe(false);

    const storageSource = readSource('src/core/storage.js');
    const photoRefsSource = readSource('src/core/storage/photoRefs.js');

    expect(storageSource).not.toContain('flushPendingPhotos');
    expect(storageSource).not.toContain('migrateLegacyPhotosInState');
    expect(storageSource).not.toContain('_migrateLegacyPhotosAsync');
    expect(photoRefsSource).not.toContain('supabase');
    expect(photoRefsSource).not.toContain('createSignedUrl');
    expect(photoRefsSource).not.toContain('uploadPendingPhotos');
    expect(photoRefsSource).not.toContain('localStorage');
    expect(photoRefsSource).not.toContain('registro-fotos');
  });

  it('does not reintroduce client-side writes to the legacy registro-fotos bucket', () => {
    const runtimeFiles = listSourceFiles('src').filter(
      (file) => !file.startsWith('src/__tests__/'),
    );

    expect(findMatches(runtimeFiles, /registro-fotos/)).toEqual([]);
  });

  it('does not keep stale photoStorage mocks in tests after removing the runtime', () => {
    expect(existsSync('src/ui/viewModels/registroPhotosModel.js')).toBe(false);

    const testFiles = listSourceFiles('src/__tests__').filter(
      (file) =>
        !file.endsWith('legacyV1RemovalContracts.test.js') &&
        !file.endsWith('legacyV1RemovalStorageAndAssetsContracts.test.js'),
    );

    expect(
      findMatches(
        testFiles,
        /photoStorage\.js|uploadPendingPhotos|ui\/components\/photos\.js|registroPhotosModel\.js/,
      ),
    ).toEqual([]);
  });

  it('does not keep the duplicate legacy photo migration bridge in storage normalizers', () => {
    const storageNormalizersSource = readSource('src/core/storage/normalizers.js');

    expect(storageNormalizersSource).not.toContain('migrateLegacyPhotosInState');
    expect(storageNormalizersSource).not.toContain('migrateLegacyPhotosForRegistros');
  });

  it('uses neutral names for equipment schema compatibility fallbacks', () => {
    const joined = [
      readSource('src/core/storage/storageNormalizers.js'),
      readSource('src/core/storage/normalizers.js'),
      readSource('src/core/storage/remote.js'),
    ].join('\n');

    expect(joined).not.toMatch(
      /\bisLegacyEquipmentSchemaError\b|\blegacyRows\b|\blegacy:\s*true\b|\blegacy\s*=\s*false\b/,
    );
  });

  it('uses neutral names for previous local storage compatibility helpers', () => {
    const joined = [
      readSource('src/core/userStorage.js'),
      readSource('src/ui/views/registro.js'),
    ].join('\n');

    expect(joined).not.toMatch(/\bmigrateLegacyKey\b|\blegacyKey\b|\bLEGACY_TIPO_OUTRO_PREFIX\b/);
  });

  it('keeps sync storage keys centralized instead of duplicated in runtime consumers', () => {
    const consumers = [readSource('src/core/storage.js'), readSource('src/core/devWipeData.js')];

    for (const source of consumers) {
      expect(source).not.toMatch(
        /['"]cooltrack-sync-dirty-v1['"]|['"]cooltrack-sync-deletions-v1['"]|['"]cooltrack-cache-owner-v1['"]/,
      );
    }
  });

  it('keeps app-owned persisted storage keys centralized', () => {
    const consumers = [
      readSource('src/core/auth.js'),
      readSource('src/__tests__/auth.integration.test.js'),
    ];
    const centralizedKeyPattern = new RegExp(
      [OAUTH_PENDING_STORAGE_KEY, CONTEXTUAL_ONBOARDING_STORAGE_KEY].map(escapeRegExp).join('|'),
    );

    for (const source of consumers) {
      expect(source).not.toMatch(centralizedKeyPattern);
    }
  });

  it('limits remaining runtime v1 tokens to endpoint versions and persisted storage keys', () => {
    const runtimeFiles = [
      ...listSourceFiles('src/app-v2'),
      ...listSourceFiles('src/ui'),
      ...listSourceFiles('src/core'),
      ...listSourceFiles('src/domain'),
      ...listSourceFiles('scripts'),
      ...listSourceFiles('public'),
      'index.html',
      'preview.html',
    ];
    const allowedPatternsByFile = new Map([
      ['src/core/emailNotification.js', [/api\/v1\.0\/email\/send/]],
      [
        'src/core/storage/constants.js',
        [
          /cooltrack-oauth-pending-v1/,
          /contextual-onboarding-v1/,
          /cooltrack-sync-dirty-v1/,
          /cooltrack-sync-deletions-v1/,
          /cooltrack-cache-owner-v1/,
        ],
      ],
      ['src/domain/nameplateAnalysis.js', [/functions\/v1\/analyze-nameplate/]],
      [
        'src/ui/account/userData.js',
        [/functions\/v1\/export-user-data/, /functions\/v1\/delete-user-account/],
      ],
    ]);

    expect(findUnexpectedLineMatches(runtimeFiles, /\bv1\b/i, allowedPatternsByFile)).toEqual([]);
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

  it('does not keep visible legacy PDF promises in onboarding and profile copy', () => {
    const copySources = ['src/ui/shell/templates/views.js', 'src/core/inputValidation.js'].map(
      readSource,
    );

    const joined = copySources.join('\n');

    expect(joined).not.toContain('Gere seu primeiro PDF');
    expect(joined).not.toContain('capa do PDF');
    expect(joined).not.toContain('PDFs');
    expect(joined).not.toContain('PDF do cliente');
    expect(joined).not.toContain('pdf gerado');
  });

  it('does not keep legacy sensitive integration comments in neutralized helper files', () => {
    const neutralizedSources = [
      'src/core/utils.js',
      'src/domain/dadosPlacaDisplay.js',
      'src/domain/dadosPlacaInsights.js',
      'src/ui/views/registro.js',
      'src/ui/views/registro/save/postSave.js',
      'src/ui/views/historico.js',
      'src/ui/views/equipamentos/placaData.js',
    ].map(readSource);

    const joined = neutralizedSources.join('\n');

    expect(joined).not.toContain('PDF');
    expect(joined).not.toContain('WhatsApp');
    expect(joined).not.toContain('assinatura');
  });

  it('does not keep domain constants tied to legacy Dashboard wording', () => {
    const statusConstantsSource = readSource('src/domain/constants/statuses.js');
    const alertConstantsSource = readSource('src/domain/constants/alerts.js');

    expect(alertConstantsSource).not.toMatch(/dashboard/i);
    expect(alertConstantsSource).not.toMatch(MOJIBAKE_PATTERN);
    expect(statusConstantsSource).not.toMatch(/dashboard/i);
    expect(statusConstantsSource).not.toContain('ui/views/dashboard.js');
    expect(statusConstantsSource).not.toContain('dashboard/constants');
    expect(statusConstantsSource).not.toMatch(MOJIBAKE_PATTERN);
  });

  it('does not keep legacy Dashboard wording in neutralized runtime comments', () => {
    const joined = [readSource('src/core/auth.js'), readSource('src/ui/views/registro.js')].join(
      '\n',
    );

    expect(joined).not.toMatch(/dashboard/i);
    expect(joined).not.toMatch(/\bdash\b/i);
    expect(joined).not.toContain('V10:');
    expect(joined).not.toContain('Body V6:');
    expect(joined).not.toMatch(MOJIBAKE_PATTERN);
  });

  it('does not keep legacy wording in pure nameplate domain comments', () => {
    const joined = [
      readSource('src/domain/dadosPlacaDisplay.js'),
      readSource('src/domain/dadosPlacaInsights.js'),
    ].join('\n');

    expect(joined).not.toMatch(/\blegado\b|legacy/i);
    expect(joined).not.toMatch(MOJIBAKE_PATTERN);
  });

  it('does not keep generic legacy wording in neutralized UI comments', () => {
    const joined = [
      readSource('src/ui/controller/handlers/equipmentHandlers.js'),
      readSource('src/ui/controller/handlers/navigationHandlers.js'),
      readSource('src/ui/views/clientes.js'),
      readSource('src/ui/views/equipamentos.js'),
      readSource('src/ui/views/equipamentos/setor/setorPersist.js'),
      readSource('src/ui/views/equipamentos/state/editingState.js'),
      readSource('src/ui/views/equipamentos/ui/detailModel.js'),
      readSource('src/ui/views/historico.js'),
      readSource('src/ui/shell/templates/modals.js'),
    ].join('\n');

    expect(joined).not.toMatch(/\blegado\b|legacy/i);
    expect(joined).not.toMatch(MOJIBAKE_PATTERN);
  });

  it('does not keep generic legacy wording in neutralized Clientes core comments', () => {
    const clientesCoreSource = readSource('src/core/clientes.js');

    expect(clientesCoreSource).not.toMatch(/\blegado\b|legacy/i);
    expect(clientesCoreSource).not.toMatch(MOJIBAKE_PATTERN);
  });

  it('does not keep neutralized legacy wording in Registro comments', () => {
    const registroSource = readSource('src/ui/views/registro.js');

    expect(registroSource).not.toContain('view legado');
    expect(registroSource).not.toContain('fallback pro legado .section-title');
    expect(registroSource).not.toContain('.section-title legado');
    expect(registroSource).not.toMatch(MOJIBAKE_PATTERN);
  });

  it('does not keep neutralized v1 wording in equipment card comments', () => {
    const equipmentCardsSource = readSource('src/ui/views/equipamentos/equipmentCards.js');

    expect(equipmentCardsSource).not.toContain('wall of text" da V1');
    expect(equipmentCardsSource).not.toMatch(MOJIBAKE_PATTERN);
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

  it('does not keep CSS proof helper scoped to retired React or legacy CSS trees', () => {
    const cssProofSource = readSource('scripts/css-proof.mjs');

    expect(cssProofSource).not.toContain('src/react');
    expect(cssProofSource).not.toContain('src/tests');
    expect(cssProofSource).not.toContain('src/assets/styles');
    expect(cssProofSource).not.toContain('src/ui');
    expect(cssProofSource).toContain('src/app-v2/styles');
    expect(cssProofSource).toContain('public/legal');
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
    const navigationHandlersSource = readSource('src/ui/controller/handlers/navigationHandlers.js');
    const navigationModeSource = readSource('src/ui/shell/navigationMode.js');

    expect(existsSync('src/ui/controller/routes.js')).toBe(false);
    expect(existsSync('src/ui/views/alertas.js')).toBe(false);
    expect(existsSync('src/ui/viewModels/alertasViewModel.js')).toBe(false);
    expect(existsSync('src/ui/composables/header.js')).toBe(false);
    expect(shellViewsSource).not.toContain('view-alertas');
    expect(shellViewsSource).not.toContain('alertas-contextual');
    expect(shellViewsSource).not.toContain('lista-alertas');
    expect(existsSync('src/ui/shell/templates/sidebar.js')).toBe(false);
    expect(existsSync('src/ui/shell/templates/header.js')).toBe(false);
    expect(navigationHandlersSource).not.toContain("on('go-alertas'");
    expect(navigationModeSource).not.toContain("'alertas'");
  });
});
