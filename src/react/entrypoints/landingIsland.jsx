import { createRoot } from 'react-dom/client';
import '../styles/tailwind.css';
import { LandingPage } from '../pages/landing/LandingPage.jsx';

/**
 * Entrypoint da nova landing React+Tailwind.
 *
 * Acionado pela feature-flag `useReactLandingPage` (localStorage ou
 * env `VITE_REACT_LANDING=1`) em src/app.js. Quando a flag esta
 * desligada (default), o app continua carregando a landing legacy
 * vanilla em src/ui/components/landingPage.js.
 *
 * Mounting: substitui o conteudo do `#app` por uma React root. A page
 * ocupa toda a viewport via `min-h-screen`. Sem efeito sobre rotas
 * autenticadas (so e chamado quando user e anonimo).
 */

const ROOT_KEY = '__cooltrackLandingReactRoot';

export function mountLandingPageReact(targetEl, options = {}) {
  if (!(targetEl instanceof HTMLElement)) return null;

  // Limpa root anterior (caso reentry — nao deveria acontecer em prod
  // porque o app so monta landing uma vez por bootstrap, mas a guarda
  // protege contra warning de duplicate createRoot em HMR/teste).
  const existing = targetEl[ROOT_KEY];
  if (existing && typeof existing.unmount === 'function') {
    try {
      existing.unmount();
    } catch {
      /* tolerante a re-mount em hot reload */
    }
  }

  // Marca o shell pra estilos legados (parity com legacy LandingPage.render).
  targetEl.classList.add('landing-active');
  targetEl.innerHTML = '';

  const root = createRoot(targetEl);
  targetEl[ROOT_KEY] = root;

  root.render(<LandingPage onStart={options.onStart || options.onLogin} />);

  return root;
}

export default mountLandingPageReact;
