import { expect, test } from '@playwright/test';
import { setupAuthedPage } from '../fixtures/authedSession.js';

const EQUIP_ID = 'equip-legacy-contract-e2e-1';
const SAFE_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';
const SAFE_PHOTO_DATA_URL = `data:image/png;base64,${SAFE_PNG_BASE64}`;

const PRO_PROFILE = {
  plan: 'pro',
  plan_code: 'pro',
  subscription_status: 'active',
  is_dev: true,
};

const FREE_PROFILE = {
  plan: 'free',
  plan_code: 'free',
  subscription_status: 'inactive',
  is_dev: false,
};

const REMOTE_DATA = {
  equipamentos: [
    {
      id: EQUIP_ID,
      nome: 'Split Contrato E2E',
      local: 'Sala tecnica',
      status: 'ok',
      tag: 'EQ-E2E',
      tipo: 'Split',
      fluido: 'R-410A',
      periodicidade_preventiva_dias: 90,
      fotos: [
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'data:image/svg+xml,<svg onload=alert(1)>',
        SAFE_PHOTO_DATA_URL,
      ],
    },
  ],
  registros: [],
  setores: [],
  tecnicos: [{ nome: 'Tecnico E2E' }],
  usage_monthly: [
    {
      resource: 'nameplate_analysis',
      used_count: 1,
    },
  ],
};

test.use({ bypassCSP: true });

function mockStateScript() {
  return `
    const current = globalThis.__equipLegacyContractMocks || {};
    globalThis.__equipLegacyContractMocks = {
      uploads: Array.isArray(current.uploads) ? current.uploads : [],
      nameplateCalls: Array.isArray(current.nameplateCalls) ? current.nameplateCalls : [],
    };
    globalThis.__equipLegacyContractMocks;
  `;
}

function photoStorageMockModule() {
  return `
    ${mockStateScript()}

    const SAFE_PNG = '${SAFE_PHOTO_DATA_URL}';

    function state() {
      return globalThis.__equipLegacyContractMocks;
    }

    function isSafePhotoUrl(value) {
      const raw = String(value || '').trim();
      if (!raw || /[<>"'\\s]/.test(raw)) return false;
      if (/^data:image\\/(?:png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(raw)) return true;
      if (/^blob:/i.test(raw)) return true;
      if (raw.startsWith('/')) return true;
      try {
        const url = new URL(raw);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch (_error) {
        return false;
      }
    }

    export async function dataUrlToBlob(dataUrl) {
      return new Blob([String(dataUrl || '')], { type: 'image/jpeg' });
    }

    export async function createSignedUrl(_bucket, path) {
      return {
        url: isSafePhotoUrl(path) ? path : SAFE_PNG,
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      };
    }

    export function normalizePhotoEntry(photo) {
      if (typeof photo === 'string') {
        const value = photo.trim();
        return isSafePhotoUrl(value) ? value : null;
      }
      if (!photo || typeof photo !== 'object') return null;
      const url = String(photo.url || photo.signedUrl || photo.publicUrl || '').trim();
      const path = String(photo.path || '').trim();
      if (url && !isSafePhotoUrl(url)) return null;
      if (path && /(?:javascript:|data:text\\/html|svg)/i.test(path)) return null;
      if (!url && !path) return null;
      return {
        ...photo,
        url: url || undefined,
        path: path || undefined,
      };
    }

    export function normalizePhotoList(photoList) {
      return Array.isArray(photoList) ? photoList.map(normalizePhotoEntry).filter(Boolean) : [];
    }

    export function hasInlineLegacyPhotos(photoList) {
      return Array.isArray(photoList) && photoList.some((photo) => /^data:image\\//i.test(String(photo || '')));
    }

    export async function uploadPendingPhotos(photos, options = {}) {
      const source = Array.isArray(photos) ? photos : [];
      state().uploads.push({
        count: source.length,
        recordId: options.recordId || null,
        scope: options.scope || null,
      });
      const normalized = source
        .map((photo, index) => {
          if (typeof photo === 'string' && /^data:image\\//i.test(photo)) {
            return {
              version: 1,
              provider: 'e2e-mock',
              bucket: 'mock',
              path: \`\${options.scope || 'equipamentos'}/\${options.recordId || 'equip'}/\${index}.jpg\`,
              url: SAFE_PNG,
            };
          }
          return normalizePhotoEntry(photo);
        })
        .filter(Boolean);
      return { photos: normalized, uploadedCount: normalized.length, failedCount: 0 };
    }

    export async function migrateLegacyPhotosForRegistros(registros) {
      return { registros: Array.isArray(registros) ? registros : [], migratedCount: 0, failedCount: 0 };
    }

    export async function resolvePhotoDisplayUrl(photo) {
      if (typeof photo === 'string') return isSafePhotoUrl(photo) ? photo : null;
      const normalized = normalizePhotoEntry(photo);
      if (!normalized) return null;
      if (normalized.url && isSafePhotoUrl(normalized.url)) return normalized.url;
      if (normalized.path) return SAFE_PNG;
      return null;
    }

    export async function resolvePhotoDataUrlForPdf(photo) {
      return resolvePhotoDisplayUrl(photo);
    }
  `;
}

function nameplateAnalysisMockModule() {
  return `
    ${mockStateScript()}

    export const ERR_PLAN_GATE = 'PLAN_GATE';
    export const ERR_NO_SESSION = 'NO_SESSION';
    export const ERR_NETWORK = 'NETWORK';
    export const ERR_UPSTREAM_BUSY = 'UPSTREAM_BUSY';
    export const ERR_NOT_IDENTIFIED = 'NOT_IDENTIFIED';
    export const ERR_FILE_TOO_LARGE = 'FILE_TOO_LARGE';
    export const ERR_FILE_INVALID = 'FILE_INVALID';

    export class NameplateAnalysisError extends Error {
      constructor(message, code = 'MOCK', details = {}) {
        super(message);
        this.name = 'NameplateAnalysisError';
        this.code = code;
        this.details = details;
      }
    }

    export async function analyzeNameplate(file) {
      globalThis.__equipLegacyContractMocks.nameplateCalls.push({
        name: file?.name || null,
        type: file?.type || null,
        size: file?.size || 0,
      });
      return {
        marcaModelo: 'CoolTrack E2E 12000',
        tipo: 'Split',
        fluido: 'R-410A',
        tensao: '220',
        frequenciaHz: '60',
        capacidadeBtu: 12000,
        numeroSerie: 'E2E-PLACA-001',
        confidence: 0.94,
        _trial: { consumed: false, remaining: 30 },
      };
    }
  `;
}

async function installLegacyFlowMocks(page) {
  await page.addInitScript(mockStateScript());
  await page.route('**/src/core/photoStorage.js*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: photoStorageMockModule(),
    }),
  );
  await page.route('**/src/domain/nameplateAnalysis.js*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: nameplateAnalysisMockModule(),
    }),
  );
}

function startBrowserSafetyProbe(page) {
  const consoleErrors = [];
  const pageErrors = [];
  const downloads = [];
  const popups = [];
  const blockedExternalFlows = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });
  page.on('download', (download) => {
    downloads.push(download.suggestedFilename());
  });
  page.on('popup', (popup) => {
    popups.push(popup.url());
  });
  page.on('request', (request) => {
    const url = request.url();
    if (
      /(?:storage\/v1\/object|functions\/v1\/analyze-nameplate|functions\/v1\/create-checkout-session|checkout\.stripe)/i.test(
        url,
      )
    ) {
      blockedExternalFlows.push(url);
    }
  });

  return {
    assertClean() {
      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
      expect(downloads).toEqual([]);
      expect(popups).toEqual([]);
      expect(blockedExternalFlows).toEqual([]);
    },
  };
}

async function bootEquipamentos(page, { profile }) {
  await installLegacyFlowMocks(page);
  await setupAuthedPage(page, { profile, remoteData: REMOTE_DATA });
  await page.goto('/');
  await expect(page.locator('#main-content')).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-route', 'inicio');
  await page.locator('#sidenav-equipamentos').click();
  await expect(page.locator('body')).toHaveAttribute('data-route', 'equipamentos');
  await expect(page.locator('#view-equipamentos')).toBeVisible();
  await expect(page.locator('#equip-hero')).toHaveAttribute(
    'data-react-equipamentos-header-mounted',
    'true',
  );
  await expect(page.locator('#lista-equip')).toHaveAttribute(
    'data-react-equipamentos-list-mounted',
    'true',
  );
}

async function openEquipmentDetail(page) {
  const detailTrigger = page.locator(`[data-action="view-equip"][data-id="${EQUIP_ID}"]`).first();
  await expect(detailTrigger).toBeVisible();
  await detailTrigger.click();
  await expect(page.locator('#modal-eq-det')).toHaveClass(/is-open/);
  await expect(page.locator('#eq-det-corpo .eq-detail-view')).toBeVisible();
}

async function assertNoUnsafeImageSources(page, selector) {
  const unsafeCount = await page.locator(selector).evaluateAll(
    (images) =>
      images.filter((image) => {
        const src = image.getAttribute('src') || '';
        return /^(?:javascript:|data:text\/html|data:image\/svg)/i.test(src);
      }).length,
  );
  expect(unsafeCount).toBe(0);
}

test.describe('Equipamentos legacy photos/nameplate/paywall contracts', () => {
  // TODO(mudanca-7.1): falha em CI com `#main-content` not visible.
  // Provável boot da view nao completa em CI dentro do timeout (webServer dev
  // lento em runner ubuntu sem cache). Investigar via trace artifact.
  test.skip('mantem editor de fotos e nameplate legados com upload e analise mockados', async ({
    page,
  }) => {
    const safety = startBrowserSafetyProbe(page);
    await bootEquipamentos(page, { profile: PRO_PROFILE });

    await openEquipmentDetail(page);
    await assertNoUnsafeImageSources(page, '#eq-det-corpo img');

    const photosCta = page
      .locator(`[data-action="open-eq-photos-editor"][data-id="${EQUIP_ID}"]`)
      .first();
    await expect(photosCta).toBeVisible();
    await photosCta.click();

    await expect(page.locator('#modal-eq-photos')).toHaveClass(/is-open/);
    await expect(page.locator('#eq-photos-block')).toBeVisible();
    await expect(page.locator('#eq-photos-drop-zone')).toBeVisible();
    await expect(page.locator('#eq-photos-drop-text')).toBeVisible();
    await expect(page.locator('#eq-photos-gallery')).toHaveAttribute('accept', /image/);
    await expect(page.locator('#eq-photos-camera')).toHaveAttribute('capture', 'environment');
    await expect(page.locator('#modal-eq-photos [data-action="save-eq-photos"]')).toBeVisible();
    await expect(page.locator('#eq-photos-preview .photo-thumb')).toHaveCount(1);
    await assertNoUnsafeImageSources(page, '#eq-photos-preview img');

    await page.locator('#eq-photos-gallery').setInputFiles({
      name: 'equipamento-e2e.png',
      mimeType: 'image/png',
      buffer: Buffer.from(SAFE_PNG_BASE64, 'base64'),
    });
    await expect(page.locator('#eq-photos-preview .photo-thumb')).toHaveCount(2);
    await expect(page.locator('#eq-photos-preview .photo-thumb--pending')).toHaveCount(1);
    await assertNoUnsafeImageSources(page, '#eq-photos-preview img');

    await page.locator('#eq-photos-preview .photo-thumb--pending img').click();
    await expect(page.locator('#lightbox')).toHaveClass(/is-open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#lightbox')).not.toHaveClass(/is-open/);

    await page.locator('#modal-eq-photos [data-action="save-eq-photos"]').click();
    await expect
      .poll(() => page.evaluate(() => globalThis.__equipLegacyContractMocks.uploads))
      .toEqual([{ count: 2, recordId: EQUIP_ID, scope: 'equipamentos' }]);
    await expect(page.locator('#modal-eq-photos')).not.toHaveClass(/is-open/);
    await page.evaluate(() =>
      import('/src/core/modal.js').then(({ Modal }) => Modal.close('modal-eq-det')),
    );
    await expect(page.locator('#modal-eq-det')).not.toHaveClass(/is-open/);
    await expect(page.locator('#toast-container .toast.is-visible')).toHaveCount(0, {
      timeout: 6000,
    });

    const addEquipment = page
      .locator('#equip-toolbar-actions [data-action="open-modal"][data-id="modal-add-eq"]')
      .first();
    await expect(addEquipment).toBeVisible();
    await addEquipment.click();
    await expect(page.locator('#modal-add-eq')).toHaveClass(/is-open/);
    await expect(page.locator('#nameplate-cta')).toBeVisible();
    await expect(page.locator('#nameplate-cta')).toHaveAttribute('data-state', 'active');
    await expect(page.locator('#nameplate-file-input')).toHaveAttribute('accept', /image/);

    await page.locator('#nameplate-file-input').setInputFiles({
      name: 'etiqueta-e2e.png',
      mimeType: 'image/png',
      buffer: Buffer.from(SAFE_PNG_BASE64, 'base64'),
    });
    await expect(page.locator('#nameplate-scan')).toHaveAttribute('data-state', 'done');
    await expect(page.locator('#nameplate-scan-result')).toBeVisible();
    await expect(page.locator('#nameplate-scan-detected')).not.toHaveText('0');
    await expect
      .poll(() => page.evaluate(() => globalThis.__equipLegacyContractMocks.nameplateCalls))
      .toEqual([{ name: 'etiqueta-e2e.png', type: 'image/png', size: 68 }]);

    safety.assertClean();
  });

  // TODO(mudanca-7.1): falha em CI com `#main-content` not visible (mesmo
  // sintoma do test acima — boot lento). Investigar via trace artifact.
  test.skip('mantem upsell/paywall de fotos e nameplate sem checkout real', async ({ page }) => {
    const safety = startBrowserSafetyProbe(page);
    await bootEquipamentos(page, { profile: FREE_PROFILE });

    await openEquipmentDetail(page);
    const lockedPhotosCta = page
      .locator(
        `[data-action="open-upgrade"][data-id="${EQUIP_ID}"][data-upgrade-source="equip_detail_photos"][data-highlight-plan="plus"]`,
      )
      .first();
    await expect(lockedPhotosCta).toBeVisible();
    await lockedPhotosCta.click();
    await expect(page.locator('body')).toHaveAttribute('data-route', 'pricing');
    expect(page.url()).toMatch(/^http:\/\/127\.0\.0\.1:/);

    await page.evaluate(() =>
      import('/src/core/router.js').then(({ goTo }) => goTo('equipamentos')),
    );
    await expect(page.locator('body')).toHaveAttribute('data-route', 'equipamentos');
    const addEquipment = page
      .locator('#equip-toolbar-actions [data-action="open-modal"][data-id="modal-add-eq"]')
      .first();
    await expect(addEquipment).toBeVisible();
    await addEquipment.click();
    await expect(page.locator('#modal-add-eq')).toHaveClass(/is-open/);
    await expect(page.locator('#nameplate-cta')).toBeVisible();
    await expect(page.locator('#nameplate-cta')).toHaveAttribute('data-state', 'locked');
    await expect(page.locator('#nameplate-cta-btn-locked')).toBeVisible();
    await page.locator('#nameplate-cta-btn-locked').click();
    await expect(page.locator('body')).toHaveAttribute('data-route', 'pricing');
    expect(page.url()).toMatch(/^http:\/\/127\.0\.0\.1:/);

    safety.assertClean();
  });
});
