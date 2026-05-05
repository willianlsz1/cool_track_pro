import { __resetTelemetryForTests, __setIdGeneratorForTests } from '../../core/telemetry.js';

function mountRouterDom() {
  document.body.innerHTML = `
    <main id="main-content" tabindex="-1"></main>
    <button id="nav-inicio" class="nav-btn"></button>
    <button id="nav-registros" class="nav-btn"></button>
    <section id="view-inicio"></section>
    <section id="view-registros"></section>
  `;
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true,
  });
}

async function loadRouterModule() {
  vi.resetModules();
  return import('../../core/router.js');
}

describe('router error boundary correlation id', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    __resetTelemetryForTests();
    mountRouterDom();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renderiza fallback com CID-TEST para erro síncrono no onEnter', async () => {
    const { registerRoute, goTo } = await loadRouterModule();
    const telemetry = await import('../../core/telemetry.js');
    telemetry.__resetTelemetryForTests();
    telemetry.__setIdGeneratorForTests(() => 'CID-TEST');
    registerRoute('inicio', () => {
      throw new Error('sync boom');
    });

    goTo('inicio');

    const view = document.getElementById('view-inicio');
    expect(view.querySelector('.view-error-boundary')).toBeTruthy();
    expect(view.textContent).toContain('CID-TEST');
  });

  it('renderiza fallback com CID-TEST para erro assíncrono no onEnter', async () => {
    const { registerRoute, goTo } = await loadRouterModule();
    const telemetry = await import('../../core/telemetry.js');
    telemetry.__resetTelemetryForTests();
    telemetry.__setIdGeneratorForTests(() => 'CID-TEST');
    registerRoute('inicio', () => Promise.reject(new Error('async boom')));

    goTo('inicio');
    await Promise.resolve();
    await Promise.resolve();

    const view = document.getElementById('view-inicio');
    expect(view.querySelector('.view-error-boundary')).toBeTruthy();
    expect(view.textContent).toContain('CID-TEST');
  });
});
