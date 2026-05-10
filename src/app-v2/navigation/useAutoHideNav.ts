import { useEffect, useState } from 'react';

interface NavVisibilityInput {
  currentScrollY: number;
  previousScrollY: number;
  visible: boolean;
  topThreshold?: number;
  deltaThreshold?: number;
}

interface NavVisibilityState {
  visible: boolean;
  scrollY: number;
}

export function getNextNavVisibility({
  currentScrollY,
  previousScrollY,
  visible,
  topThreshold = 16,
  deltaThreshold = 12,
}: NavVisibilityInput): NavVisibilityState {
  if (currentScrollY <= topThreshold) {
    return { visible: true, scrollY: currentScrollY };
  }

  const delta = currentScrollY - previousScrollY;

  if (Math.abs(delta) < deltaThreshold) {
    return { visible, scrollY: currentScrollY };
  }

  return {
    visible: delta < 0,
    scrollY: currentScrollY,
  };
}

export function useAutoHideNav() {
  const [state, setState] = useState<NavVisibilityState>({
    visible: true,
    scrollY: typeof window === 'undefined' ? 0 : window.scrollY,
  });

  useEffect(() => {
    function onScroll() {
      setState((current) =>
        getNextNavVisibility({
          currentScrollY: window.scrollY,
          previousScrollY: current.scrollY,
          visible: current.visible,
        }),
      );
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return state.visible;
}
