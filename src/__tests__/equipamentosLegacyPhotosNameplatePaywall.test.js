import { readFileSync } from 'node:fs';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindEvents } from '../core/events.js';
import { getEquipmentPhotoUrl } from '../ui/components/equipmentVisual.js';
import { applyNameplateCtaGate } from '../ui/components/nameplateCapture.js';
import { bindEquipmentHandlers } from '../ui/controller/handlers/equipmentHandlers.js';
import { bindNavigationHandlers } from '../ui/controller/handlers/navigationHandlers.js';
import { renderShellModals } from '../ui/shell/templates/modals.js';

const mocks = vi.hoisted(() => ({
  modalOpen: vi.fn(),
  modalClose: vi.fn(),
  goTo: vi.fn(),
  trackEvent: vi.fn(),
  openEquipPhotosEditor: vi.fn(),
  saveEquipPhotos: vi.fn(),
  saveEquip: vi.fn(),
  viewEquip: vi.fn(),
  deleteEquip: vi.fn(),
  openEditEquip: vi.fn(),
  setActiveSector: vi.fn(),
  setActiveQuickFilter: vi.fn(),
  renderEquip: vi.fn(),
  clearForcedEquipContext: vi.fn(),
  applyEquipModalExperience: vi.fn(),
  clearEditingState: vi.fn(),
  clearSetorEditingState: vi.fn(),
  clearEquipPhotosEditingState: vi.fn(),
  lockEquipContext: vi.fn(),
  toastWarning: vi.fn(),
}));

vi.mock('../core/modal.js', () => ({
  Modal: {
    open: mocks.modalOpen,
    close: mocks.modalClose,
  },
  CustomConfirm: {
    show: vi.fn(async () => true),
  },
}));

vi.mock('../core/router.js', () => ({
  goTo: mocks.goTo,
}));

vi.mock('../core/telemetry.js', () => ({
  trackEvent: mocks.trackEvent,
}));

vi.mock('../core/toast.js', () => ({
  Toast: {
    success: vi.fn(),
    warning: mocks.toastWarning,
    error: vi.fn(),
    info: vi.fn(),
    show: vi.fn(),
  },
}));

vi.mock('../core/state.js', () => ({
  getState: vi.fn(() => ({ clientes: [], equipamentos: [], registros: [], setores: [] })),
}));

vi.mock('../ui/views/equipamentos.js', () => ({
  saveEquip: mocks.saveEquip,
  viewEquip: mocks.viewEquip,
  deleteEquip: mocks.deleteEquip,
  openEditEquip: mocks.openEditEquip,
  openEquipPhotosEditor: mocks.openEquipPhotosEditor,
  saveEquipPhotos: mocks.saveEquipPhotos,
  saveSetor: vi.fn(),
  deleteSetor: vi.fn(),
  setActiveSector: mocks.setActiveSector,
  setActiveQuickFilter: mocks.setActiveQuickFilter,
  initSetorColorPicker: vi.fn(),
  openEditSetor: vi.fn(),
  clearSetorEditingState: mocks.clearSetorEditingState,
  moveEquipsToSetor: vi.fn(),
  renderEquip: mocks.renderEquip,
  clearForcedEquipContext: mocks.clearForcedEquipContext,
  applyEquipModalExperience: mocks.applyEquipModalExperience,
  clearEditingState: mocks.clearEditingState,
  clearEquipPhotosEditingState: mocks.clearEquipPhotosEditingState,
  lockEquipContext: mocks.lockEquipContext,
  syncComponenteVisibility: vi.fn(),
}));

vi.mock('../ui/components/actionFeedback.js', () => ({
  runAsyncAction: async (_el, _opts, action) => action(),
}));

vi.mock('../core/errors.js', () => ({
  ErrorCodes: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
  },
  handleError: vi.fn(),
}));

vi.mock('../ui/components/photos.js', () => ({
  Photos: {
    closeLightbox: vi.fn(),
  },
}));

vi.mock('../ui/components/supportFeedbackModal.js', () => ({
  SupportFeedbackModal: {
    open: vi.fn(),
  },
}));

vi.mock('../ui/components/tour.js', () => ({
  Tour: {
    restart: vi.fn(),
  },
}));

vi.mock('../ui/components/onboarding/onboardingChecklist.js', () => ({
  OnboardingChecklist: {
    dismiss: vi.fn(),
  },
}));

vi.mock('../ui/components/authscreen.js', () => ({
  AuthScreen: {
    show: vi.fn(),
  },
}));

vi.mock('../core/plans/planCache.js', () => ({
  isCachedPlanPlusOrHigher: vi.fn(() => false),
}));

vi.mock('../ui/components/pushOptInCard.js', () => ({
  PushOptInCard: {
    enable: vi.fn(),
    disable: vi.fn(),
    render: vi.fn(),
  },
}));

vi.mock('../ui/components/installAppPrompt.js', () => ({
  InstallAppPrompt: {
    prompt: vi.fn(),
    dismiss: vi.fn(),
  },
}));

vi.mock('../domain/nameplateAnalysis.js', () => ({
  analyzeNameplate: vi.fn(),
  NameplateAnalysisError: class NameplateAnalysisError extends Error {},
  ERR_PLAN_GATE: 'PLAN_GATE',
  ERR_NO_SESSION: 'NO_SESSION',
  ERR_NETWORK: 'NETWORK',
  ERR_UPSTREAM_BUSY: 'UPSTREAM_BUSY',
  ERR_NOT_IDENTIFIED: 'NOT_IDENTIFIED',
  ERR_FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  ERR_FILE_INVALID: 'FILE_INVALID',
}));

function click(elOrSelector) {
  const el = typeof elOrSelector === 'string' ? document.querySelector(elOrSelector) : elOrSelector;
  expect(el).not.toBeNull();
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return Promise.resolve().then(() => Promise.resolve());
}

beforeAll(() => {
  bindEvents();
});

beforeEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = `
    ${renderShellModals()}
    <section id="view-equipamentos">
      <section id="equip-hero" data-react-equipamentos-header-mounted="true"></section>
      <nav id="equip-filters"></nav>
      <div id="equip-context-chip"></div>
      <div id="lista-equip" data-react-equipamentos-list-mounted="true"></div>
      <div id="eq-det-corpo"></div>
    </section>
  `;
  bindEquipmentHandlers();
  bindNavigationHandlers();
});

describe('equipamentos legacy photos/nameplate/paywall contracts', () => {
  it('preserva contratos DOM do editor legado de fotos e da captura de etiqueta', () => {
    expect(document.getElementById('modal-eq-photos')).not.toBeNull();
    expect(document.getElementById('eq-photos-block')).not.toBeNull();
    expect(document.getElementById('eq-photos-drop-zone')).not.toBeNull();
    expect(document.getElementById('eq-photos-gallery')?.getAttribute('accept')).toBe('image/*');
    expect(document.getElementById('eq-photos-camera')?.getAttribute('capture')).toBe(
      'environment',
    );
    expect(document.getElementById('eq-photos-preview')?.getAttribute('role')).toBe('list');
    expect(
      document.querySelector('#eq-photos-locked [data-action="eq-photos-upsell-cta"]'),
    ).not.toBeNull();
    expect(document.querySelector('[data-action="save-eq-photos"]')).not.toBeNull();

    expect(document.getElementById('nameplate-cta')?.dataset.state).toBe('hidden');
    expect(document.getElementById('nameplate-cta-sub')).not.toBeNull();
    expect(document.getElementById('nameplate-cta-btn-active')?.getAttribute('for')).toBe(
      'nameplate-file-input',
    );
    expect(document.getElementById('nameplate-file-input')?.getAttribute('accept')).toBe(
      'image/jpeg,image/png,image/webp',
    );
    expect(document.getElementById('nameplate-scan')?.dataset.state).toBe('idle');
    expect(document.getElementById('nameplate-scan-review-list')).not.toBeNull();

    const lockedNameplate = document.getElementById('nameplate-cta-btn-locked');
    expect(lockedNameplate).not.toBeNull();
    expect(lockedNameplate?.hasAttribute('data-action')).toBe(false);
    expect(lockedNameplate?.classList.contains('nameplate-cta__btn--locked')).toBe(true);
  });

  it('mantem handlers legados acionaveis para abrir/salvar fotos e aviso comercial desativado', async () => {
    const openPhotos = document.createElement('button');
    openPhotos.type = 'button';
    openPhotos.dataset.action = 'open-eq-photos-editor';
    openPhotos.dataset.id = 'eq-1';
    openPhotos.dataset.mode = 'gallery';
    openPhotos.textContent = 'Gerenciar fotos';

    const savePhotos = document.querySelector('[data-action="save-eq-photos"]');
    const upgrade = document.createElement('button');
    upgrade.type = 'button';
    upgrade.dataset.action = 'open-upgrade';
    upgrade.dataset.upgradeSource = 'equip_detail_photos';
    upgrade.dataset.highlightPlan = 'plus';
    upgrade.dataset.tier = 'free';
    upgrade.textContent = 'Desbloquear com Plus';

    document.getElementById('modal-eq-det')?.classList.add('is-open');
    document.body.append(openPhotos, upgrade);

    await click(openPhotos);
    expect(openPhotos.dataset).toMatchObject({ id: 'eq-1', mode: 'gallery' });
    expect(mocks.openEquipPhotosEditor).toHaveBeenCalledWith('eq-1');

    await click(savePhotos);
    expect(mocks.saveEquipPhotos).toHaveBeenCalledTimes(1);

    await click(upgrade);
    await vi.waitFor(() => {
      expect(mocks.toastWarning).toHaveBeenCalledWith('Planos pagos foram removidos desta versao.');
    });
    expect(mocks.trackEvent).toHaveBeenCalledWith('upgrade_cta_clicked', {
      source: 'equip_detail_photos',
      highlight_plan: 'plus',
    });
    expect(mocks.modalClose).toHaveBeenCalledWith('modal-eq-det');
  });

  it('preserva estados do nameplate gate e aciona upsell legado sem analise real', async () => {
    const cta = document.getElementById('nameplate-cta');
    const sub = document.getElementById('nameplate-cta-sub');

    applyNameplateCtaGate({ isPlusOrPro: true, trialRemaining: null });
    expect(cta?.hidden).toBe(false);
    expect(cta?.dataset.state).toBe('active');
    expect(cta?.dataset.trialRemaining).toBeUndefined();
    expect(sub?.textContent).toContain('etiqueta');

    applyNameplateCtaGate({ isPlusOrPro: false, trialRemaining: 1 });
    expect(cta?.dataset.state).toBe('trial');
    expect(cta?.dataset.trialRemaining).toBe('1');
    expect(sub?.textContent).toContain('1');

    applyNameplateCtaGate({ isPlusOrPro: false, trialRemaining: 0 });
    expect(cta?.dataset.state).toBe('locked');
    expect(cta?.dataset.trialRemaining).toBe('0');

    mocks.trackEvent.mockClear();
    const lockedButton = document.getElementById('nameplate-cta-btn-locked');
    await click(lockedButton);

    expect(mocks.trackEvent).toHaveBeenCalledWith('nameplate_upsell_clicked', {
      source: 'equip_modal',
    });
    expect(mocks.modalClose).toHaveBeenCalledWith('modal-add-eq');
    expect(mocks.toastWarning).toHaveBeenCalledWith('Planos pagos foram removidos desta versao.');
    expect(mocks.goTo).not.toHaveBeenCalled();
  });

  it('mantem payloads maliciosos inertes em fotos, paywall e atributos data-*', async () => {
    const unsafeEq = {
      fotos: [
        { url: 'javascript:alert(1)' },
        { url: 'data:text/html,<script>alert(2)</script>' },
        { url: 'data:image/svg+xml,<svg onload=alert(3) />' },
        { url: 'data:image/png;base64,AAAA' },
      ],
    };

    expect(getEquipmentPhotoUrl(unsafeEq)).toBe('data:image/png;base64,AAAA');

    const maliciousUpgrade = document.createElement('button');
    maliciousUpgrade.type = 'button';
    maliciousUpgrade.dataset.action = 'open-upgrade';
    maliciousUpgrade.dataset.upgradeSource = 'javascript:alert(1)';
    maliciousUpgrade.dataset.highlightPlan = 'javascript:alert(2)';
    maliciousUpgrade.dataset.tier = 'free<script>';
    maliciousUpgrade.textContent = '<img src=x onerror=alert(1)>';
    document.body.appendChild(maliciousUpgrade);

    await click(maliciousUpgrade);
    await vi.waitFor(() => {
      expect(mocks.toastWarning).toHaveBeenCalledWith('Planos pagos foram removidos desta versao.');
    });
    expect(mocks.trackEvent).toHaveBeenCalledWith('upgrade_cta_clicked', {
      source: 'dashboard',
      highlight_plan: 'pro',
    });
    expect(document.querySelector('script')).toBeNull();
    expect(document.querySelector('[onerror]')).toBeNull();
    expect(document.querySelector('[onclick]')).toBeNull();

    const source = readFileSync('src/ui/views/equipamentos.js', 'utf8');
    expect(source).not.toMatch(/react-dom\/client|createRoot/);
  });
});
