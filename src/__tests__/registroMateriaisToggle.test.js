import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const templateSource = fs.readFileSync(
  path.resolve(process.cwd(), 'src/ui/shell/templates/views.js'),
  'utf8',
);

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
  toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  goTo: vi.fn(),
  setRouteGuard: vi.fn(),
  clearRouteGuard: vi.fn(),
  photos: {
    pending: [],
    render: vi.fn(),
    clear: vi.fn(),
    unmount: vi.fn(),
  },
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
vi.mock('../core/modal.js', () => ({ CustomConfirm: { ask: vi.fn(() => Promise.resolve(true)) } }));
vi.mock('../ui/components/photos.js', () => ({ Photos: mocks.photos }));
vi.mock('../ui/components/onboarding.js', () => ({
  SavedHighlight: { markForHighlight: vi.fn() },
}));
vi.mock('../core/profile.js', () => ({ Profile: mocks.profile }));
vi.mock('../core/errors.js', () => ({
  ErrorCodes: { NETWORK_ERROR: 'NETWORK_ERROR', SYNC_FAILED: 'SYNC_FAILED' },
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

function mountRegistroDom({ materialOpen = false } = {}) {
  document.body.innerHTML = `
    <section id="view-registro">
      <input id="r-equip" value="eq-1" />
      <input id="r-data" value="2026-05-01T09:30" />
      <input id="r-tipo" value="Inspeção Geral" />
      <div id="r-tipo-custom-wrap" hidden><input id="r-tipo-custom" value="" /></div>
      <textarea id="r-obs">Observação longa o suficiente</textarea>
      <input id="r-tecnico" value="Tecnico" />
      <input id="r-status" value="ok" />
      <input id="r-prioridade" value="media" />
      <input id="r-proxima" value="" />
      <input id="r-cliente-nome" value="" />
      <input id="r-cliente-documento" value="" />
      <input id="r-local-atendimento" value="" />
      <input id="r-cliente-contato" value="" />
      <details class="registro-details" id="registro-materiais-details" ${materialOpen ? 'open' : ''}>
        <summary class="registro-details__summary" aria-expanded="${materialOpen ? 'true' : 'false'}">
          <span>+ Usei peças neste serviço</span>
        </summary>
        <div class="registro-details__body">
          <input id="r-pecas" value="" />
          <input id="r-custo-pecas" value="" />
          <input id="r-custo-mao-obra" value="" />
        </div>
      </details>
      <button data-action="save-registro"><span>Salvar serviço</span></button>
    </section>
  `;
}

function resetState(registros = []) {
  mocks.stateRef.current = {
    equipamentos: [{ id: 'eq-1', nome: 'Split Recepção', tipo: 'split', status: 'ok' }],
    registros,
    tecnicos: [],
    setores: [],
    clientes: [],
  };
}

function latestRegistro() {
  return mocks.stateRef.current.registros.at(-1);
}

async function flushAsyncWork() {
  for (let index = 0; index < 5; index += 1) {
    await Promise.resolve();
  }
}

describe('registro materiais toggle', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resetState();
    sessionStorage.clear();
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('seção começa colapsada em criação nova', async () => {
    mountRegistroDom();
    const { initRegistro } = await import('../ui/views/registro.js');

    initRegistro();
    await flushAsyncWork();

    const details = document.getElementById('registro-materiais-details');
    expect(details.open).toBe(false);
    expect(details.querySelector('summary').getAttribute('aria-expanded')).toBe('false');
    expect(templateSource).toContain('+ Usei peças neste serviço');
  });

  it('toque no toggle expande os 3 campos', async () => {
    mountRegistroDom();
    const { initRegistro } = await import('../ui/views/registro.js');
    initRegistro();
    await flushAsyncWork();

    const details = document.getElementById('registro-materiais-details');
    details.querySelector('summary').click();
    await flushAsyncWork();

    expect(details.open).toBe(true);
    expect(details.querySelector('summary').getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById('r-pecas')).not.toBeNull();
    expect(document.getElementById('r-custo-pecas')).not.toBeNull();
    expect(document.getElementById('r-custo-mao-obra')).not.toBeNull();
  });

  it('salvar com toggle ativado mas campos vazios salva sem erro', async () => {
    mountRegistroDom({ materialOpen: true });
    const { initRegistro, saveRegistro } = await import('../ui/views/registro.js');
    initRegistro();
    await flushAsyncWork();

    await expect(saveRegistro()).resolves.toBe(true);

    expect(mocks.toast.error).not.toHaveBeenCalled();
    expect(latestRegistro()).toMatchObject({ pecas: '', custoPecas: 0, custoMaoObra: 0 });
  });

  it('salvar com toggle ativado e campos preenchidos persiste valores', async () => {
    mountRegistroDom({ materialOpen: true });
    document.getElementById('r-pecas').value = 'Filtro G4';
    document.getElementById('r-custo-pecas').value = '120.5';
    document.getElementById('r-custo-mao-obra').value = '80';
    const { initRegistro, saveRegistro } = await import('../ui/views/registro.js');
    initRegistro();
    await flushAsyncWork();

    await expect(saveRegistro()).resolves.toBe(true);

    expect(latestRegistro()).toMatchObject({
      pecas: 'Filtro G4',
      custoPecas: 120.5,
      custoMaoObra: 80,
    });
  });

  it('em loadRegistroForEdit com r-pecas preenchido começa expandida', async () => {
    resetState([
      {
        id: 'reg-1',
        equipId: 'eq-1',
        data: '2026-05-01T09:30',
        tipo: 'Inspeção Geral',
        obs: 'Observação longa o suficiente',
        tecnico: 'Tecnico',
        status: 'ok',
        prioridade: 'media',
        pecas: 'Filtro G4',
        custoPecas: 0,
        custoMaoObra: 0,
      },
    ]);
    mountRegistroDom();
    const { loadRegistroForEdit } = await import('../ui/views/registro.js');

    loadRegistroForEdit('reg-1');

    const details = document.getElementById('registro-materiais-details');
    expect(details.open).toBe(true);
    expect(details.querySelector('summary').getAttribute('aria-expanded')).toBe('true');
  });

  it('em loadRegistroForEdit com tudo vazio começa colapsada', async () => {
    resetState([
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
    ]);
    mountRegistroDom({ materialOpen: true });
    const { loadRegistroForEdit } = await import('../ui/views/registro.js');

    loadRegistroForEdit('reg-1');

    const details = document.getElementById('registro-materiais-details');
    expect(details.open).toBe(false);
    expect(details.querySelector('summary').getAttribute('aria-expanded')).toBe('false');
  });
});
