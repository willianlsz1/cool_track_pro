import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const registroSource = fs.readFileSync(path.join(root, 'src/ui/views/registro.js'), 'utf8');
const templateSource = fs.readFileSync(path.join(root, 'src/ui/shell/templates/views.js'), 'utf8');
const sheetSource = fs.readFileSync(
  path.join(root, 'src/ui/components/registroClienteForkSheet.js'),
  'utf8',
);

const mocks = vi.hoisted(() => ({
  handlers: new Map(),
  stateRef: {
    current: { equipamentos: [], registros: [], tecnicos: [], setores: [], clientes: [] },
  },
  on: vi.fn((action, handler) => mocks.handlers.set(action, handler)),
  getState: vi.fn(() => mocks.stateRef.current),
  findEquip: vi.fn(() => null),
  setState: vi.fn((updater) => {
    mocks.stateRef.current =
      typeof updater === 'function' ? updater(mocks.stateRef.current) : updater;
    return mocks.stateRef.current;
  }),
  lastRegForEquip: vi.fn(() => null),
  shareWhatsAppFlow: vi.fn(),
  exportPdfFlow: vi.fn(),
}));

vi.mock('../core/events.js', () => ({
  on: mocks.on,
}));

vi.mock('../core/state.js', () => ({
  getState: mocks.getState,
  findEquip: mocks.findEquip,
  setState: mocks.setState,
  lastRegForEquip: mocks.lastRegForEquip,
}));

vi.mock('../ui/controller/handlers/reportExportHandlers.js', () => ({
  exportPdfFlow: mocks.exportPdfFlow,
  shareWhatsAppFlow: mocks.shareWhatsAppFlow,
}));

function mountMinimalRegistroDom() {
  document.body.innerHTML = `
    <button data-action="save-and-share-registro"><span>Salvar e enviar pro cliente</span></button>
    <input id="r-equip" value="eq-1" />
    <input id="r-data" value="2026-05-01T09:30" />
    <input id="r-tipo" value="Manutenção Preventiva" />
    <input id="r-tipo-custom" value="" />
    <input id="r-obs" value="Observação longa o suficiente" />
    <input id="r-tecnico" value="Tecnico" />
    <input id="r-status" value="ok" />
    <input id="r-prioridade" value="media" />
    <input id="r-pecas" value="" />
    <input id="r-proxima" value="" />
    <input id="r-custo-pecas" value="0" />
    <input id="r-custo-mao-obra" value="0" />
    <input id="r-cliente-nome" value="" />
    <input id="r-cliente-documento" value="" />
    <input id="r-local-atendimento" value="" />
    <input id="r-cliente-contato" value="" />
  `;
}

function latestRegistro() {
  return mocks.stateRef.current.registros.at(-1);
}

async function flushAsyncWork() {
  for (let index = 0; index < 8; index += 1) {
    await Promise.resolve();
  }
}

async function startSaveAndShare() {
  const { bindRegistroHandlers } = await import('../ui/controller/handlers/registroHandlers.js');
  bindRegistroHandlers();
  const button = document.querySelector('[data-action="save-and-share-registro"]');
  const savePromise = mocks.handlers.get('save-and-share-registro')(button);
  await flushAsyncWork();
  return { button, savePromise };
}

describe('registro cliente fork', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.handlers.clear();
    mocks.stateRef.current = {
      equipamentos: [],
      registros: [],
      tecnicos: [],
      setores: [],
      clientes: [],
    };
    globalThis.requestAnimationFrame = (callback) => {
      callback();
      return 1;
    };
    vi.useFakeTimers();
    document.body.innerHTML = '';
  });

  it('fork aparece sem contexto, seção inline escondida', () => {
    expect(registroSource).toContain('details.hidden = true');
    expect(registroSource).toContain('_resolveRegistroClientFork');
    expect(sheetSource).toContain('Pra quem é esse PDF?');
  });

  it('fork não aparece com contexto, auto-fill funciona, label mostra nome', () => {
    expect(registroSource).toContain('if (!forceClientFork && hasResolvedClient) return true');
    expect(registroSource).toContain("Utils.setVal('r-cliente-nome', context.cliente.nome || '')");
    expect(registroSource).toContain('Salvar e enviar pro ${clienteNome}');
  });

  it('Enviar sem identificar persiste cliente vazio', () => {
    expect(sheetSource).toContain('Enviar sem identificar');
    expect(sheetSource).toContain("clienteNome: ''");
    expect(sheetSource).toContain("clienteContato: ''");
  });

  it('Cliente identificado preenche e salva', () => {
    expect(sheetSource).toContain('Cliente identificado');
    expect(sheetSource).toContain('readIdentifiedClient');
    expect(registroSource).toContain('_applyRegistroClientFields(result)');
  });

  it('Kebab força fork mesmo com contexto', () => {
    expect(templateSource).toContain('save-and-share-other-registro');
    expect(registroSource).toContain('forceClientFork = false');
    expect(registroSource).toContain('forceClientFork });');
  });

  it('dismiss do sheet via close button reseta loading state', async () => {
    mountMinimalRegistroDom();
    const { button, savePromise } = await startSaveAndShare();

    expect(button.disabled).toBe(true);
    document.getElementById('rcf-close').click();
    await savePromise;
    vi.runOnlyPendingTimers();

    expect(latestRegistro()).toBeUndefined();
    expect(mocks.shareWhatsAppFlow).not.toHaveBeenCalled();
    expect(button.disabled).toBe(false);
    expect(button.classList.contains('is-loading')).toBe(false);
  });

  it('dismiss do sheet via backdrop click reseta loading state', async () => {
    mountMinimalRegistroDom();
    const { button, savePromise } = await startSaveAndShare();

    const overlay = document.getElementById('registro-cliente-fork-overlay');
    expect(overlay).not.toBeNull();
    overlay.click();
    await savePromise;
    vi.runOnlyPendingTimers();

    expect(latestRegistro()).toBeUndefined();
    expect(mocks.shareWhatsAppFlow).not.toHaveBeenCalled();
    expect(button.disabled).toBe(false);
    expect(button.classList.contains('is-loading')).toBe(false);
  });
});
