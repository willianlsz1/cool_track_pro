import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Badge, Button } from '../react/components/ui/index.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let currentRoot = null;

async function renderPrimitive(element) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  currentRoot = createRoot(host);

  await act(async () => {
    currentRoot.render(element);
  });

  return host;
}

describe('React UI primitives', () => {
  afterEach(async () => {
    if (currentRoot) {
      await act(async () => {
        currentRoot.unmount();
      });
    }
    currentRoot = null;
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('renders Button children with a safe default button type', async () => {
    const host = await renderPrimitive(<Button>Salvar</Button>);
    const button = host.querySelector('button');

    expect(button?.textContent).toBe('Salvar');
    expect(button?.getAttribute('type')).toBe('button');
  });

  it('allows Button submit type, variant, size, fullWidth, disabled and extra className', async () => {
    const host = await renderPrimitive(
      <Button
        type="submit"
        variant="danger"
        size="lg"
        fullWidth
        disabled
        className="tw-custom-hook"
      >
        Excluir
      </Button>,
    );
    const button = host.querySelector('button');

    expect(button?.getAttribute('type')).toBe('submit');
    expect(button?.disabled).toBe(true);
    expect(button?.className).toContain('tw-bg-red-600');
    expect(button?.className).toContain('tw-h-11');
    expect(button?.className).toContain('tw-w-full');
    expect(button?.className).toContain('tw-custom-hook');
  });

  it('preserves Button events, data attributes and aria attributes', async () => {
    const onClick = vi.fn();
    const host = await renderPrimitive(
      <Button
        onClick={onClick}
        data-action="save-registro"
        data-nav="registro"
        data-id="reg-1"
        aria-label="Salvar registro"
      >
        Salvar
      </Button>,
    );
    const button = host.querySelector('button');

    button?.click();

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(button?.dataset.action).toBe('save-registro');
    expect(button?.dataset.nav).toBe('registro');
    expect(button?.dataset.id).toBe('reg-1');
    expect(button?.getAttribute('aria-label')).toBe('Salvar registro');
  });

  it('renders Badge children and applies tone, size and extra className', async () => {
    const host = await renderPrimitive(
      <Badge tone="premium" size="sm" className="tw-custom-badge">
        Pro
      </Badge>,
    );
    const badge = host.querySelector('span');

    expect(badge?.textContent).toBe('Pro');
    expect(badge?.className).toContain('tw-bg-violet-100');
    expect(badge?.className).toContain('tw-text-xs');
    expect(badge?.className).toContain('tw-custom-badge');
  });

  it('preserves Badge title, data attributes and aria attributes', async () => {
    const host = await renderPrimitive(
      <Badge title="Plano atual" data-tier="pro" data-id="plan-1" aria-label="Plano Pro">
        Pro
      </Badge>,
    );
    const badge = host.querySelector('span');

    expect(badge?.getAttribute('title')).toBe('Plano atual');
    expect(badge?.dataset.tier).toBe('pro');
    expect(badge?.dataset.id).toBe('plan-1');
    expect(badge?.getAttribute('aria-label')).toBe('Plano Pro');
  });

  it('does not use unsafe HTML APIs or legacy CSS dependencies', () => {
    const sources = [
      'src/react/components/ui/Button.jsx',
      'src/react/components/ui/Badge.jsx',
      'src/react/components/ui/index.js',
    ]
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n');

    expect(sources).not.toMatch(/dangerouslySetInnerHTML|innerHTML/);
    expect(sources).not.toMatch(/components\.css|redesign\.css|styles\/components/);
    expect(sources).toMatch(/tw-/);
  });
});
