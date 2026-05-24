/**
 * Service Worker registration — extraído do index.html inline.
 * Fica num arquivo externo pra permitir CSP sem 'unsafe-inline' no script-src.
 * Carregado a partir da mesma origem ('self' no CSP).
 */
(function () {
  var _isDev =
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.hostname.startsWith('192.168.');

  if ('serviceWorker' in navigator && !_isDev) {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(function (reg) {
        console.log('[SW] Registrado:', reg.scope);
        // Expoe a registration para o bootstrap atual coordenar updates.
        // ("Nova versao disponivel. Recarregar?"). Usamos globalThis
        // por simplicidade; o app le esta referencia uma vez no boot.
        window.__cooltrackSwRegistration = reg;
      })
      .catch(function (err) {
        console.warn('[SW] Falha no registro:', err);
      });
  } else if (_isDev && 'serviceWorker' in navigator) {
    // Em dev: remove SW anterior para não bloquear atualizações
    navigator.serviceWorker.getRegistrations().then(function (regs) {
      regs.forEach(function (r) {
        r.unregister();
      });
    });
  }
})();
