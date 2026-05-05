import { queueEvent } from './telemetrySink.js';
import { addBreadcrumb } from './observability.js';

const TELEMETRY_EVENT = 'cooltrack:telemetry';
const ROUTE_BUFFER_MAX = 50;
const _routeEvents = [];

let _idGenerator = () => {
  const randomUUID = globalThis?.crypto?.randomUUID;
  if (typeof randomUUID === 'function') return randomUUID.call(globalThis.crypto);
  return `rt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

function _isDev() {
  return Boolean(import.meta.env?.DEV);
}

function _pushRouteEvent(event) {
  _routeEvents.push(event);
  if (_routeEvents.length > ROUTE_BUFFER_MAX) {
    _routeEvents.splice(0, _routeEvents.length - ROUTE_BUFFER_MAX);
  }
}

function _installDevTelemetryBridge() {
  if (!_isDev()) return;
  if (typeof window === 'undefined') return;
  window.__telemetry = {
    get events() {
      return [..._routeEvents];
    },
    clear() {
      _routeEvents.length = 0;
    },
  };
}

export function createCorrelationId() {
  return _idGenerator();
}

export function __setIdGeneratorForTests(nextGenerator) {
  if (typeof nextGenerator !== 'function') return;
  _idGenerator = nextGenerator;
}

export function __resetTelemetryForTests() {
  _routeEvents.length = 0;
  _idGenerator = () => {
    const randomUUID = globalThis?.crypto?.randomUUID;
    if (typeof randomUUID === 'function') return randomUUID.call(globalThis.crypto);
    return `rt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  };
}

export function trackRouteEnter(routeId) {
  const detail = {
    type: 'route_enter',
    routeId: String(routeId || 'unknown'),
    timestamp: new Date().toISOString(),
  };
  _pushRouteEvent(detail);
  _installDevTelemetryBridge();
  if (_isDev()) {
    console.log('[route-enter]', detail.routeId);
  }
}

export function trackRouteError(routeId, error, correlationId) {
  const detail = {
    type: 'route_error',
    routeId: String(routeId || 'unknown'),
    correlationId: String(correlationId || 'n/a'),
    message: error?.message ? String(error.message) : 'unknown error',
    timestamp: new Date().toISOString(),
  };
  _pushRouteEvent(detail);
  _installDevTelemetryBridge();
  console.error('[route-error]', detail);
}

export function trackEvent(name, payload = {}) {
  const eventName = String(name || '').trim();
  if (!eventName) return;
  const data = payload && typeof payload === 'object' ? payload : {};

  const detail = {
    name: eventName,
    payload: data,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    if (!Array.isArray(window.__cooltrackEvents)) {
      window.__cooltrackEvents = [];
    }
    window.__cooltrackEvents.push(detail);
    window.dispatchEvent(new CustomEvent(TELEMETRY_EVENT, { detail }));
  }

  // Enfileira pro sink externo — try/catch pra garantir que telemetria nunca
  // quebra o app. No-op se initTelemetrySink() ainda não foi chamado.
  try {
    queueEvent(detail);
  } catch (err) {
    if (import.meta.env?.DEV) {
      console.warn('[telemetry] queueEvent falhou (silenciado):', err);
    }
  }

  // Emite também como breadcrumb no Sentry pra contextualizar erros.
  // No-op se observability não está inicializado (DSN ausente).
  try {
    addBreadcrumb({
      category: 'telemetry',
      message: eventName,
      data,
      level: 'info',
    });
  } catch {
    // nunca propaga
  }

  if (import.meta.env?.DEV) {
    console.log('[CoolTrack Telemetry]', eventName, data);
  }
}

export { TELEMETRY_EVENT };
