import { ShareSuccessToast } from '../ui/components/shareSuccessToast.js';

describe('ShareSuccessToast', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renderiza toast acessivel e remove automaticamente em 5 segundos', () => {
    ShareSuccessToast.show();

    const toast = document.querySelector('.share-success-toast');
    expect(toast).toBeTruthy();
    expect(toast.getAttribute('role')).toBe('status');
    expect(toast.getAttribute('aria-live')).toBe('polite');
    expect(toast.textContent).toContain('Relatorio enviado.');
    expect(toast.textContent).toContain('Compartilhamento registrado no fluxo operacional.');

    vi.advanceTimersByTime(6000);
    toast.dispatchEvent(new Event('transitionend'));

    expect(document.querySelector('.share-success-toast')).toBeNull();
  });
});
