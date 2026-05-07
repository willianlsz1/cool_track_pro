import { Component } from 'react';

import { captureError } from '../../core/observability.js';

/**
 * ErrorBoundary compartilhado para todas as React islands do CoolTrack Pro.
 *
 * O QUE CAPTURA:
 *   - Erros lançados durante render
 *   - Erros em lifecycle methods (constructor, componentDidMount, etc.)
 *   - Erros em getDerivedStateFromProps
 *
 * O QUE NÃO CAPTURA (limite do React, by design):
 *   - Erros em event handlers (onClick, onChange, ...) — usar try/catch local
 *   - Erros em código async (setTimeout, Promise, fetch sem await) — usar try/catch local
 *   - Erros no SSR (não fazemos SSR aqui, irrelevante)
 *   - Erros no próprio ErrorBoundary
 *
 * COMO USAR:
 *   <ErrorBoundary name="clientesIsland">
 *     <ClientesPage />
 *   </ErrorBoundary>
 *
 * PROPS:
 *   name      string  — identifica o boundary nos tags do Sentry (obrigatório por convenção)
 *   onReset   fn?     — callback chamado quando usuário clica "Tentar novamente"
 *   fallback  fn?     — render prop custom: (error, reset) => ReactNode
 *   children  node    — conteúdo a proteger
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Atualiza state pra renderizar fallback no próximo ciclo. Estático e
    // síncrono — nada de side effects aqui.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Reusa o wrapper de observability (já gerencia DSN, lazy import,
    // tree-shaking do Sentry, beforeSend de PII). captureError é no-op se
    // VITE_SENTRY_DSN não estiver configurado, então é seguro chamar
    // sempre. O wrapper também garante que nenhuma exceção daqui propaga.
    captureError(error, {
      code: 'react_error_boundary',
      context: {
        componentStack: errorInfo?.componentStack || '',
        boundary: this.props.name || 'unnamed',
        source: 'react-island',
      },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Fallback custom via render prop — usado se um island quiser UI específica
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Fallback default: caixinha discreta no tema dark.
      // Inline styles intencionais — boundary precisa funcionar mesmo se o CSS global
      // não estiver carregado (cenário improvável mas possível em hidratação parcial).
      // Tokens via var() com fallback hex pra garantir visual em qualquer estado.
      return (
        <div
          role="alert"
          aria-live="polite"
          style={{
            padding: '1rem 1.25rem',
            margin: '0.5rem 0',
            background: 'var(--surface, #161b22)',
            color: 'var(--text, #e6edf3)',
            border: '1px solid var(--border, #2a3140)',
            borderRadius: '0.5rem',
            fontFamily: 'inherit',
            fontSize: '0.9375rem',
            lineHeight: 1.5,
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>Algo deu errado nesta seção</p>
          <p
            style={{
              margin: '0.5rem 0 1rem',
              color: 'var(--text-muted, #b5c2d1)',
              fontSize: '0.875rem',
            }}
          >
            Você pode tentar de novo. Se persistir, o erro já foi registrado e vamos investigar.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--ct-brand, #22d3ee)',
              color: 'var(--bg, #090c10)',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
