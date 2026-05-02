import { useEffect, useRef, useState } from 'react';

/**
 * Hook: detecta `prefers-reduced-motion: reduce`. Atualiza
 * dinamicamente se o usuario mudar a preferencia (raro, mas tecnicamente
 * possivel via DevTools ou OS settings).
 */
function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (event) => setReduced(event.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);
  return reduced;
}

/**
 * AnimatedCounter — anima de 0 ate `end` quando o elemento entra na
 * viewport. Respeita `prefers-reduced-motion` (renderiza valor final
 * direto). Usa requestAnimationFrame com easing cubic-out.
 *
 * Props:
 *  - end: numero alvo (obrigatorio)
 *  - duration: ms (default 1500)
 *  - className/style: encaminhados pra `<span>` raiz
 *  - format: funcao opcional para formatar o numero (ex: i18n)
 *
 * Idempotente: anima apenas uma vez por mount. Reset acontece se a
 * prop `end` mudar (key change ou nova chamada).
 */
export function AnimatedCounter({
  end = 0,
  duration = 1500,
  className,
  style,
  format = (value) => String(value),
}) {
  const reducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(reducedMotion ? end : 0);
  const ref = useRef(null);
  const startedRef = useRef(false);
  const rafRef = useRef(0);

  useEffect(() => {
    // Reset quando `end` muda (ex: trocar aba do dashboard).
    startedRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (reducedMotion) {
      setDisplayValue(end);
      return undefined;
    }

    setDisplayValue(0);

    const animate = () => {
      const startTs = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - startTs) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        setDisplayValue(Math.round(end * eased));
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          setDisplayValue(end);
        }
      };
      rafRef.current = requestAnimationFrame(step);
    };

    if (typeof IntersectionObserver === 'undefined') {
      // Ambiente sem IO (jsdom basico, edge cases) — anima imediatamente.
      animate();
      startedRef.current = true;
      return () => cancelAnimationFrame(rafRef.current);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            animate();
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);

    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration, reducedMotion]);

  return (
    <span ref={ref} className={className} style={style}>
      {format(displayValue)}
    </span>
  );
}

export default AnimatedCounter;
