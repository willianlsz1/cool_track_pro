import type { AppV2AuthenticatedBrowserClient } from './authenticatedBrowserOptions';

const root = document.getElementById('app-v2-root');

if (root) {
  void mountProductionAppV2(root);
}

async function mountProductionAppV2(rootElement: HTMLElement) {
  try {
    const [{ supabase }, { createAuthenticatedAppV2BrowserOptions }, { mountAuthenticatedAppV2 }] =
      await Promise.all([
        import('../core/supabase.js'),
        import('./authenticatedBrowserOptions'),
        import('./authenticatedHarness'),
      ]);

    const appV2Client = supabase as unknown as AppV2AuthenticatedBrowserClient;
    await mountAuthenticatedAppV2(rootElement, createAuthenticatedAppV2BrowserOptions(appV2Client));
  } catch (error) {
    console.warn('[app-v2] Authenticated bootstrap unavailable; mounting local fallback.', error);
    const { mountAppV2 } = await import('./index');
    mountAppV2(rootElement);
  }
}
