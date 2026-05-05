import {
  __resetTelemetryForTests,
  __setIdGeneratorForTests,
  createCorrelationId,
  trackRouteEnter,
  trackRouteError,
} from '../../core/telemetry.js';

describe('core/telemetry route seams', () => {
  beforeEach(() => {
    __resetTelemetryForTests();
  });

  it('createCorrelationId() usa o gerador injetado', () => {
    __setIdGeneratorForTests(() => 'CID-INJETADO');
    expect(createCorrelationId()).toBe('CID-INJETADO');
  });

  it("trackRouteEnter('foo') adiciona evento route_enter no buffer", () => {
    trackRouteEnter('foo');
    expect(window.__telemetry?.events).toHaveLength(1);
    expect(window.__telemetry?.events[0]).toMatchObject({
      type: 'route_enter',
      routeId: 'foo',
    });
  });

  it("trackRouteError('bar', Error('x'), 'CID-1') adiciona evento com correlationId e message", () => {
    trackRouteError('bar', new Error('x'), 'CID-1');
    expect(window.__telemetry?.events).toHaveLength(1);
    expect(window.__telemetry?.events[0]).toMatchObject({
      type: 'route_error',
      routeId: 'bar',
      correlationId: 'CID-1',
      message: 'x',
    });
  });

  it('buffer respeita limite de 50 eventos e descarta os 10 primeiros ao inserir 60', () => {
    for (let i = 0; i < 60; i += 1) {
      trackRouteEnter(`r-${i}`);
    }
    expect(window.__telemetry?.events).toHaveLength(50);
    expect(window.__telemetry?.events[0].routeId).toBe('r-10');
    expect(window.__telemetry?.events[49].routeId).toBe('r-59');
  });

  it('reset limpa buffer e restaura gerador padrão', () => {
    trackRouteEnter('foo');
    __setIdGeneratorForTests(() => 'CID-FIXO');
    expect(createCorrelationId()).toBe('CID-FIXO');

    __resetTelemetryForTests();
    expect(window.__telemetry?.events).toHaveLength(0);
    expect(createCorrelationId()).not.toBe('CID-FIXO');
  });
});
