import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  stateRef: {
    current: {
      equipamentos: [{ id: 'eq-1', nome: 'Split Recepção', tipo: 'split', status: 'ok' }],
      registros: [],
      tecnicos: [],
      setores: [],
      clientes: [],
    },
  },
  setState: vi.fn((updater) => {
    mocks.stateRef.current =
      typeof updater === 'function' ? updater(mocks.stateRef.current) : updater;
    return mocks.stateRef.current;
  }),
  toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn(), info: vi.fn() },
  goTo: vi.fn(),
  setRouteGuard: vi.fn(),
  clearRouteGuard: vi.fn(),
  photos: { pending: [], render: vi.fn(), clear: vi.fn(), unmount: vi.fn() },
  profile: {
    getDefaultTecnico: vi.fn(() => ''),
    saveLastTecnico: vi.fn(),
    get: vi.fn(() => ({ nome: 'Tecnico' })),
    save: vi.fn(),
  },
  postSaveToast: { show: vi.fn(() => false) },
}));

vi.mock('../core/state.js', () => ({
  getState: vi.fn(() => mocks.stateRef.current),
  findEquip: vi.fn(
    (id) => mocks.stateRef.current.equipamentos.find((equip) => equip.id === id) || null,
  ),
  setState: mocks.setState,
  lastRegForEquip: vi.fn(() => null),
}));
vi.mock('../core/toast.js', () => ({ Toast: mocks.toast }));
vi.mock('../core/router.js', () => ({
  goTo: mocks.goTo,
  setRouteGuard: mocks.setRouteGuard,
  clearRouteGuard: mocks.clearRouteGuard,
}));
vi.mock('../ui/components/photos.js', () => ({ Photos: mocks.photos }));
vi.mock('../ui/components/onboarding.js', () => ({
  SavedHighlight: { markForHighlight: vi.fn() },
}));
vi.mock('../core/profile.js', () => ({ Profile: mocks.profile }));
vi.mock('../core/errors.js', () => ({
  ErrorCodes: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    SYNC_FAILED: 'SYNC_FAILED',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
  },
  handleError: vi.fn(),
}));
vi.mock('../core/photoStorage.js', () => ({ uploadPendingPhotos: vi.fn() }));
vi.mock('../core/equipmentRules.js', () => ({
  getOperationalStatus: vi.fn(() => ({ uiStatus: 'ok', label: 'Operando normalmente' })),
  validateOperationalPayload: vi.fn(() => ({ valid: true, errors: [] })),
}));
vi.mock('../domain/registroStatus.js', () => ({
  reconcileEquipmentStatusesAfterRegistroEdit: vi.fn(({ equipamentos }) => equipamentos),
}));
vi.mock('../core/telemetry.js', () => ({ trackEvent: vi.fn() }));
vi.mock('../ui/components/skeleton.js', () => ({
  withSkeleton: vi.fn((_root, _options, callback) => callback()),
}));
vi.mock('../core/plans/planCache.js', () => ({
  isCachedPlanPlusOrHigher: vi.fn(() => false),
  isCachedPlanPro: vi.fn(() => false),
}));
vi.mock('../ui/components/postSaveRegistroToast.js', () => ({
  PostSaveRegistroToast: mocks.postSaveToast,
}));
vi.mock('../core/phoneMask.js', () => ({ bindSmartContactMaskInput: vi.fn() }));

function mountRegistroDom() {
  document.body.innerHTML = `
    <section id="view-registro">
      <input id="r-equip" value="eq-1" />
      <input id="r-data" value="2026-05-01T09:30" />
      <input id="r-tipo" value="Inspeção Geral" />
      <input id="r-tipo-custom" value="" />
      <div id="r-tipo-custom-wrap" hidden></div>
      <textarea id="r-obs">Observação longa o suficiente</textarea>
      <input id="r-tecnico" value="Tecnico" />
      <details id="registro-impact-details">
        <summary aria-expanded="false">+ Houve algum problema?</summary>
        <select id="r-status"><option value="ok" selected>Operando normalmente</option><option value="warn">Requer atenção</option></select>
        <select id="r-prioridade"><option value="media" selected>Média</option><option value="alta">Alta</option></select>
      </details>
      <input id="r-pecas" value="" />
      <input id="r-proxima" value="" />
      <input id="r-custo-pecas" value="" />
      <input id="r-custo-mao-obra" value="" />
      <input id="r-cliente-nome" value="" />
      <input id="r-cliente-documento" value="" />
      <input id="r-local-atendimento" value="" />
      <input id="r-cliente-contato" value="" />
      <button data-action="save-registro"><span>Salvar serviço</span></button>
    </section>`;
}

function resetState() {
  mocks.stateRef.current = {
    equipamentos: [{ id: 'eq-1', nome: 'Split Recepção', tipo: 'split', status: 'ok' }],
    registros: [],
    tecnicos: [],
    setores: [],
    clientes: [],
  };
}

async function flushAsyncWork() {
  for (let index = 0; index < 8; index += 1) await Promise.resolve();
}

async function saveAndWaitForPrompt(options) {
  const { saveRegistro } = await import('../ui/views/registro.js');
  await expect(saveRegistro(options)).resolves.toBe(true);
  await flushAsyncWork();
  return document.querySelector('[data-testid="registro-proxima-preventiva-prompt"]');
}

function latestRegistro() {
  return mocks.stateRef.current.registros.at(-1);
}

describe('registro próxima preventiva prompt', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-05T12:00:00Z'));
    globalThis.requestAnimationFrame = (callback) => {
      callback();
      return 1;
    };
    resetState();
    sessionStorage.clear();
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('impacto começa colapsado em criação nova com defaults', async () => {
    mountRegistroDom();
    const { initRegistro } = await import('../ui/views/registro.js');

    initRegistro();
    await flushAsyncWork();

    const details = document.getElementById('registro-impact-details');
    expect(details.open).toBe(false);
    expect(details.querySelector('summary').getAttribute('aria-expanded')).toBe('false');
  });

  it('loadRegistroForEdit expande impacto quando status ou prioridade fogem do default', async () => {
    resetState();
    mocks.stateRef.current.registros = [
      {
        id: 'reg-1',
        equipId: 'eq-1',
        data: '2026-05-01T09:30',
        tipo: 'Inspeção Geral',
        obs: 'Observação longa o suficiente',
        tecnico: 'Tecnico',
        status: 'warn',
        prioridade: 'media',
        pecas: '',
        custoPecas: 0,
        custoMaoObra: 0,
      },
    ];
    mountRegistroDom();
    const { loadRegistroForEdit } = await import('../ui/views/registro.js');

    loadRegistroForEdit('reg-1');

    const details = document.getElementById('registro-impact-details');
    expect(details.open).toBe(true);
    expect(details.querySelector('summary').getAttribute('aria-expanded')).toBe('true');
  });

  it('loadRegistroForEdit mantém impacto colapsado com status e prioridade default', async () => {
    resetState();
    mocks.stateRef.current.registros = [
      {
        id: 'reg-1',
        equipId: 'eq-1',
        data: '2026-05-01T09:30',
        tipo: 'Inspeção Geral',
        obs: 'Observação longa o suficiente',
        tecnico: 'Tecnico',
        status: 'ok',
        prioridade: 'media',
        pecas: '',
        custoPecas: 0,
        custoMaoObra: 0,
      },
    ];
    mountRegistroDom();
    document.getElementById('registro-impact-details').setAttribute('open', '');
    const { loadRegistroForEdit } = await import('../ui/views/registro.js');

    loadRegistroForEdit('reg-1');

    const details = document.getElementById('registro-impact-details');
    expect(details.open).toBe(false);
    expect(details.querySelector('summary').getAttribute('aria-expanded')).toBe('false');
  });

  it('prompt aparece após save bem-sucedido', async () => {
    mountRegistroDom();

    const prompt = await saveAndWaitForPrompt();

    expect(prompt).not.toBeNull();
    expect(prompt.textContent).toContain('30 dias');
  });

  it('30 dias atualiza proxima com a data exata', async () => {
    mountRegistroDom();
    await saveAndWaitForPrompt();

    document.querySelector('[data-rpp-days="30"]').click();
    await flushAsyncWork();

    expect(latestRegistro().proxima).toBe('2026-06-04');
  });

  it('60 dias atualiza proxima com a data exata', async () => {
    mountRegistroDom();
    await saveAndWaitForPrompt();

    document.querySelector('[data-rpp-days="60"]').click();
    await flushAsyncWork();

    expect(latestRegistro().proxima).toBe('2026-07-04');
  });

  it('90 dias atualiza proxima com a data exata', async () => {
    mountRegistroDom();
    await saveAndWaitForPrompt();

    document.querySelector('[data-rpp-days="90"]').click();
    await flushAsyncWork();

    expect(latestRegistro().proxima).toBe('2026-08-03');
  });

  it('Sem retorno limpa proxima explicitamente', async () => {
    mountRegistroDom();
    document.getElementById('r-proxima').value = '2026-06-10';
    await saveAndWaitForPrompt();

    document.getElementById('rpp-no-return').click();
    await flushAsyncWork();

    expect(latestRegistro().proxima).toBeNull();
  });

  it('dismiss por close, backdrop e Escape preserva proxima inalterada', async () => {
    for (const dismiss of ['close', 'backdrop', 'escape']) {
      vi.resetModules();
      vi.clearAllMocks();
      resetState();
      mountRegistroDom();
      document.getElementById('r-proxima').value = '2026-06-10';
      await saveAndWaitForPrompt();

      const overlay = document.getElementById('registro-proxima-preventiva-overlay');
      if (dismiss === 'close') overlay.querySelector('#rpp-close').click();
      if (dismiss === 'backdrop') overlay.click();
      if (dismiss === 'escape') {
        overlay.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      }
      await flushAsyncWork();

      expect(latestRegistro().proxima).toBe('2026-06-10');
    }
  });

  it('aposenta WhatsApp direto e exibe prompt preventiva depois do salvamento', async () => {
    mountRegistroDom();
    const { saveRegistro } = await import('../ui/views/registro.js');

    const savePromise = saveRegistro();
    await flushAsyncWork();

    await expect(savePromise).resolves.toBe(true);
    await flushAsyncWork();
    expect(
      document.querySelector('[data-testid="registro-proxima-preventiva-prompt"]'),
    ).not.toBeNull();
  });
});
