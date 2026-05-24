import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readSource(path) {
  return readFileSync(path, 'utf8');
}

describe('billing/pricing cleanup contracts', () => {
  it('does not keep orphan clientes paywall styles after removing commercial surfaces', () => {
    const componentsCss = readSource('src/assets/styles/components.css');
    const redesignCss = readSource('src/assets/styles/redesign.css');

    expect(componentsCss).not.toContain('clientes-paywall');
    expect(redesignCss).not.toContain('clientes-paywall');
  });
});
