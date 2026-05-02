import { createRoot } from 'react-dom/client';
import '../styles/tailwind.css';
import { LandingPage } from '../pages/landing/LandingPage.jsx';

/**
 * Entrypoint da landing pública oficial em React+Tailwind.
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

  // Marca o shell com `landing-active` — usado como hook de teste
  // (`landingPageReact.test.jsx` afirma a presença) e como marker pro
  // `_enterAuthenticatedApp` em `src/app.js` saber que precisa removê-la
  // no transition para o app autenticado. Não tem CSS associado.
  targetEl.classList.add('landing-active');
  targetEl.innerHTML = '';

  const root = createRoot(targetEl);
  targetEl[ROOT_KEY] = root;

  root.render(<LandingPage onStart={options.onStart || options.onLogin} />);

  return root;
}

export default mountLandingPageReact;
