import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('internal visual identity tokens', () => {
  it('keeps the internal app aligned with the landing dashboard mockup palette', () => {
    const tokens = readFileSync('src/assets/styles/tokens.css', 'utf8');
    const redesign = readFileSync('src/assets/styles/redesign.css', 'utf8');

    expect(tokens).toContain('--ct-bg: #090c10;');
    expect(tokens).toContain('--ct-surface: #161b22;');
    expect(tokens).toContain('--ct-text: #e6edf3;');
    expect(tokens).toContain('--ct-brand: #22d3ee;');
    expect(tokens).toContain('--ct-brand-hover: #67e8f9;');
    expect(redesign).toContain('CoolTrack dashboard mockup alignment');
    expect(redesign).toContain('background: #090c10 !important;');
    expect(redesign).toContain('linear-gradient(180deg, #0f1d3e 0%, #081530 100%)');
    expect(redesign).toMatch(
      /linear-gradient\(\s*135deg,\s*var\(--ct-brand-light\) 0%,\s*var\(--ct-brand-text\) 100%\s*\)/,
    );
    expect(redesign).not.toContain('linear-gradient(135deg, #f6c85f 0%, #d79b36 100%)');
    expect(redesign).not.toMatch(/Ver demonstra[çc][ãa]o/i);
  });
});
