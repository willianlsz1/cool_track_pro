import type { AppV2Tab } from './BottomNav';

const appV2TabRoutes: Record<AppV2Tab, string> = {
  hoje: '/',
  equipamento: '/equipamentos',
  servicos: '/servicos',
  conta: '/conta',
};

export function resolveAppV2TabFromPath(pathname: string): AppV2Tab {
  const path = normalizeAppV2Path(pathname);

  if (path === '/equipamentos') {
    return 'equipamento';
  }

  if (path === '/servicos') {
    return 'servicos';
  }

  if (path === '/conta') {
    return 'conta';
  }

  return 'hoje';
}

export function getAppV2PathForTab(tab: AppV2Tab): string {
  return appV2TabRoutes[tab];
}

export function isKnownAppV2Path(pathname: string): boolean {
  return Object.values(appV2TabRoutes).includes(normalizeAppV2Path(pathname));
}

function normalizeAppV2Path(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.replace(/\/+$/, '') || '/';
}
