import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  document.body.innerHTML = '';
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('PostSaveRegistroToast', () => {
  it('nao renderiza quando equipId esta ausente', async () => {
    const { PostSaveRegistroToast } = await import('../ui/components/postSaveRegistroToast.js');
    const result = PostSaveRegistroToast.show({ equipName: 'Split 3' });
    expect(result).toBeNull();
    expect(document.querySelector('.share-success-toast')).toBeNull();
  });

  it('renderiza feedback simples sem CTAs de PDF ou WhatsApp', async () => {
    const { PostSaveRegistroToast } = await import('../ui/components/postSaveRegistroToast.js');
    PostSaveRegistroToast.show({ equipId: 'eq-42', equipName: 'Split 3' });

    const toast = document.querySelector('.share-success-toast');
    expect(toast).toBeTruthy();
    expect(toast.classList.contains('share-success-toast--with-actions')).toBe(false);
    expect(toast.getAttribute('role')).toBe('status');
    expect(toast.getAttribute('aria-live')).toBe('polite');
    expect(toast.textContent).toContain('Servico registrado em Split 3');
    expect(toast.textContent).toContain('O atendimento ficou salvo no historico do equipamento.');
    expect(document.querySelector('.share-success-toast__action')).toBeNull();
    expect(toast.textContent).not.toMatch(/PDF|WhatsApp/i);
  });

  it('substitui toast anterior quando outro registro e salvo', async () => {
    const { PostSaveRegistroToast } = await import('../ui/components/postSaveRegistroToast.js');
    PostSaveRegistroToast.show({ equipId: 'eq-1', equipName: 'Split 1' });
    PostSaveRegistroToast.show({ equipId: 'eq-2', equipName: 'Split 2' });

    const toasts = document.querySelectorAll('.share-success-toast');
    expect(toasts.length).toBe(1);
    expect(toasts[0].textContent).toContain('Split 2');
  });
});
