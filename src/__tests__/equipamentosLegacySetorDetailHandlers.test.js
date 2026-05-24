import { readFileSync } from 'node:fs';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindEvents } from '../core/events.js';
import { bindEquipmentHandlers } from '../ui/controller/handlers/equipmentHandlers.js';
import { bindNavigationHandlers } from '../ui/controller/handlers/navigationHandlers.js';

const mocks = vi.hoisted(() => ({
  modalOpen: vi.fn(),
  modalClose: vi.fn(),
  confirmShow: vi.fn(),
  goTo: vi.fn(),
  setActiveSector: vi.fn(),
  deleteSetor: vi.fn(),
  openEditSetor: vi.fn(),
  initSetorColorPicker: vi.fn(),
  clearSetorEditingState: vi.fn(),
  openEquipPhotosEditor: vi.fn(),
  openEditEquip: vi.fn(),
  deleteEquip: vi.fn(),
  clearEquipEditingState: vi.fn(),
  clearForcedEquipContext: vi.fn(),
  clearEquipPhotosEditingState: vi.fn(),
  lockEquipContext: vi.fn(),
  syncComponenteVisibility: vi.fn(),
  applyEquipModalExperience: vi.fn(),
  loadClientes: vi.fn(),
  getState: vi.fn(),
  applyNameplateCtaGate: vi.fn(),
  resetNameplateCtaState: vi.fn(),
  isCachedPlanPlusOrHigher: vi.fn(),
  isCachedPlanPro: vi.fn(),
}));

vi.mock('../core/modal.js', () => ({
  Modal: {
    open: mocks.modalOpen,
    close: mocks.modalClose,
  },
  CustomConfirm: {
    show: mocks.confirmShow,
  },
}));

vi.mock('../core/router.js', () => ({
  goTo: mocks.goTo,
}));

vi.mock('../core/state.js', () => ({
  getState: mocks.getState,
}));

vi.mock('../core/clientes.js', () => ({
  loadClientes: mocks.loadClientes,
}));

vi.mock('../ui/views/equipamentos.js', () => ({
  saveEquip: vi.fn(),
  viewEquip: vi.fn(),
  deleteEquip: mocks.deleteEquip,
  openEditEquip: mocks.openEditEquip,
  openEquipPhotosEditor: mocks.openEquipPhotosEditor,
  saveEquipPhotos: vi.fn(),
  saveSetor: vi.fn(),
  deleteSetor: mocks.deleteSetor,
  setActiveSector: mocks.setActiveSector,
  setActiveQuickFilter: vi.fn(),
  initSetorColorPicker: mocks.initSetorColorPicker,
  openEditSetor: mocks.openEditSetor,
  clearSetorEditingState: mocks.clearSetorEditingState,
  moveEquipsToSetor: vi.fn(),
  renderEquip: vi.fn(),
  clearForcedEquipContext: mocks.clearForcedEquipContext,
  applyEquipModalExperience: mocks.applyEquipModalExperience,
  clearEditingState: mocks.clearEquipEditingState,
  clearEquipPhotosEditingState: mocks.clearEquipPhotosEditingState,
  lockEquipContext: mocks.lockEquipContext,
  syncComponenteVisibility: mocks.syncComponenteVisibility,
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

vi.mock('../core/toast.js', () => ({
  Toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../core/telemetry.js', () => ({
  trackEvent: vi.fn(),
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

vi.mock('../ui/components/nameplateCapture.js', () => ({
  applyNameplateCtaGate: mocks.applyNameplateCtaGate,
  resetNameplateCtaState: mocks.resetNameplateCtaState,
}));

vi.mock('../core/plans/planCache.js', () => ({
  isCachedPlanPlusOrHigher: mocks.isCachedPlanPlusOrHigher,
  isCachedPlanPro: mocks.isCachedPlanPro,
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

function setShell() {
  document.body.innerHTML = `
    <section id="view-equipamentos">
      <section id="equip-hero" data-equipamentos-header-mounted="true"></section>
      <nav id="equip-filters"></nav>
      <div id="equip-context-chip"></div>
      <div id="lista-equip" data-react-equipamentos-list-mounted="true"></div>
      <div id="equip-toolbar-actions"></div>
      <div class="setor-grid"></div>
      <div id="eq-det-corpo"></div>
    </section>
    <select id="setor-cliente-select"></select>
    <input id="setor-cliente-id" />
    <p id="setor-cliente-help"></p>
  `;
}

function makeButton(action, dataset = {}, text = action) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.action = action;
  Object.entries(dataset).forEach(([key, value]) => {
    button.dataset[key] = value;
  });
  button.textContent = text;
  return button;
}

function appendSetorCard(id = 'setor-1') {
  const grid = document.querySelector('.setor-grid');
  const card = document.createElement('article');
  card.className = 'setor-card';
  card.dataset.action = 'open-setor';
  card.dataset.id = id;
  card.dataset.setorId = id;
  card.textContent = 'Casa de Maquinas';

  const toggle = makeButton('toggle-setor-menu', { id }, 'Menu');
  toggle.setAttribute('aria-expanded', 'false');
  card.appendChild(toggle);

  const menu = document.createElement('div');
  menu.id = `setor-menu-${id}`;
  menu.className = 'setor-card__menu';
  menu.hidden = true;
  menu.appendChild(makeButton('edit-setor', { id }, 'Editar'));
  menu.appendChild(makeButton('delete-setor', { id }, 'Excluir'));
  card.appendChild(menu);

  grid.appendChild(card);
  return { card, menu, toggle };
}

function appendDetail(id = 'eq-1') {
  const root = document.getElementById('eq-det-corpo');
  const view = document.createElement('section');
  view.className = 'eq-detail-view';

  const title = document.createElement('h2');
  title.id = 'eq-det-title';
  title.textContent = 'Split Alpha';
  view.appendChild(title);

  const footer = document.createElement('footer');
  footer.className = 'eq-modal-footer';

  const photos = makeButton('open-eq-photos-editor', { id, mode: 'gallery' }, 'Fotos');
  footer.appendChild(photos);

  const register = makeButton(
    'go-register-equip',
    { id, afterSave: 'back-to-equip-detail' },
    'Registrar',
  );
  footer.appendChild(register);

  const edit = makeButton('edit-equip', { id, mode: 'edit', focusField: 'modelo' }, 'Editar');
  footer.appendChild(edit);

  const toggle = makeButton('toggle-eq-detail-menu', { id }, 'Menu');
  toggle.setAttribute('aria-expanded', 'false');
  footer.appendChild(toggle);

  const menu = document.createElement('div');
  menu.id = `eq-detail-menu-${id}`;
  menu.className = 'eq-modal-footer__menu';
  menu.hidden = true;
  menu.appendChild(makeButton('delete-equip', { id }, 'Excluir'));
  footer.appendChild(menu);

  view.appendChild(footer);
  root.appendChild(view);

  return { root, menu, toggle, photos, register, edit };
}

async function click(elOrSelector) {
  const el = typeof elOrSelector === 'string' ? document.querySelector(elOrSelector) : elOrSelector;
  expect(el).not.toBeNull();
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  await Promise.resolve();
  await Promise.resolve();
  return el;
}

beforeAll(() => {
  bindEvents();
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.confirmShow.mockResolvedValue(true);
  mocks.loadClientes.mockResolvedValue([]);
  mocks.getState.mockReturnValue({
    clientes: [{ id: 'cli-1', nome: 'Cliente Alpha' }],
  });
  setShell();
  bindEquipmentHandlers();
  bindNavigationHandlers();
});

afterEach(() => {
  document.dispatchEvent(new Event('app:route-changed'));
  document.body.innerHTML = '';
});

afterAll(() => {
  delete document.body.dataset.setorKebabBound;
  delete document.body.dataset.helpMenuBound;
});

describe('equipamentos legacy setor/detail handlers contracts', () => {
  it('abre e fecha o menu de setor sem disparar drill-down do card', async () => {
    const { menu, toggle } = appendSetorCard('setor-1');

    await click(toggle);

    expect(menu.hidden).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(mocks.setActiveSector).not.toHaveBeenCalled();

    await click(toggle);

    expect(menu.hidden).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('aciona open-setor, back-to-setores e open-setor-modal preservando data-*', async () => {
    const { card } = appendSetorCard('setor-1');
    const openModal = makeButton(
      'open-setor-modal',
      { clienteId: 'cli-1', afterSave: 'select-in-eq-modal' },
      'Novo setor',
    );
    document.getElementById('equip-toolbar-actions').appendChild(openModal);
    document.getElementById('equip-toolbar-actions').appendChild(makeButton('back-to-setores'));

    await click(card);
    expect(card.dataset).toMatchObject({ id: 'setor-1', setorId: 'setor-1' });
    expect(mocks.setActiveSector).toHaveBeenCalledWith('setor-1');

    await click('[data-action="back-to-setores"]');
    expect(mocks.setActiveSector).toHaveBeenCalledWith(null);

    await click(openModal);
    await vi.waitFor(() => {
      expect(mocks.modalOpen).toHaveBeenCalledWith('modal-add-setor');
    });
    expect(openModal.dataset).toMatchObject({
      clienteId: 'cli-1',
      afterSave: 'select-in-eq-modal',
    });
    expect(mocks.clearSetorEditingState).toHaveBeenCalled();
    expect(mocks.initSetorColorPicker).toHaveBeenCalled();
    expect(document.getElementById('setor-cliente-select')?.value).toBe('cli-1');
    expect(document.getElementById('setor-cliente-id')?.value).toBe('cli-1');
  });

  it('aciona edit-setor e delete-setor com confirmacao mockada sem executar storage real', async () => {
    const { menu, toggle } = appendSetorCard('setor-1');

    await click(toggle);
    expect(menu.hidden).toBe(false);

    await click('[data-action="edit-setor"][data-id="setor-1"]');
    expect(menu.hidden).toBe(true);
    expect(mocks.openEditSetor).toHaveBeenCalledWith('setor-1');
    expect(mocks.initSetorColorPicker).toHaveBeenCalled();

    await click(toggle);
    await click('[data-action="delete-setor"][data-id="setor-1"]');
    await vi.waitFor(() => {
      expect(mocks.deleteSetor).toHaveBeenCalledWith('setor-1');
    });
    expect(mocks.confirmShow).toHaveBeenCalledWith(
      'Excluir Setor',
      expect.stringContaining('equipamentos deste setor'),
      expect.objectContaining({ tone: 'danger' }),
    );
  });

  it('aciona handlers principais do detalhe/modal preservando data-id, data-mode e data-after-save', async () => {
    const { menu, toggle, photos, register, edit } = appendDetail('eq-1');

    await click(toggle);
    expect(menu.hidden).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    await click(toggle);
    expect(menu.hidden).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    await click(photos);
    expect(photos.dataset).toMatchObject({ id: 'eq-1', mode: 'gallery' });
    expect(mocks.openEquipPhotosEditor).toHaveBeenCalledWith('eq-1');

    await click(register);
    expect(register.dataset).toMatchObject({
      id: 'eq-1',
      afterSave: 'back-to-equip-detail',
    });
    expect(mocks.modalClose).toHaveBeenCalledWith('modal-eq-det');
    expect(mocks.goTo).toHaveBeenCalledWith('registro', { equipId: 'eq-1' });

    await click(edit);
    expect(edit.dataset).toMatchObject({ id: 'eq-1', mode: 'edit' });
    expect(mocks.openEditEquip).toHaveBeenCalledWith('eq-1', { focusField: 'modelo' });

    await click('[data-action="delete-equip"][data-id="eq-1"]');
    await vi.waitFor(() => {
      expect(mocks.deleteEquip).toHaveBeenCalledWith('eq-1');
    });
    expect(mocks.confirmShow).toHaveBeenCalledWith(
      'Excluir Equipamento',
      expect.stringContaining('todo o histórico vinculado'),
      expect.objectContaining({ tone: 'danger' }),
    );
  });

  it('mantem payloads maliciosos inertes nos handlers e sem import direto de createRoot', async () => {
    const malicious = 'javascript:alert(1)"][onclick="alert(2)';
    const setor = appendSetorCard(malicious);
    const detail = appendDetail(malicious);
    setor.card.textContent = '<script>alert(1)</script>';
    detail.root.querySelector('#eq-det-title').textContent = '<img src=x onerror=alert(1)>';

    await expect(click(setor.toggle)).resolves.toBe(setor.toggle);
    await click(detail.photos);
    await click(detail.edit);

    expect(mocks.openEquipPhotosEditor).toHaveBeenCalledWith(malicious);
    expect(mocks.openEditEquip).toHaveBeenCalledWith(malicious, { focusField: 'modelo' });
    expect(document.querySelector('script')).toBeNull();
    expect(document.querySelector('[onerror]')).toBeNull();
    expect(document.querySelector('[onclick]')).toBeNull();

    const source = readFileSync('src/ui/views/equipamentos.js', 'utf8');
    expect(source).not.toMatch(/react-dom\/client|createRoot/);
  });
});
