import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readPublicSurface() {
  return [
    readFileSync('index.html', 'utf8'),
    readFileSync('public/legal/termos.html', 'utf8'),
    readFileSync('public/legal/privacidade.html', 'utf8'),
  ].join('\n');
}

function readIndexSurface() {
  return readFileSync('index.html', 'utf8');
}

describe('public pricing vestiges', () => {
  it('does not expose public billing, pricing or paid-plan copy', () => {
    const source = readPublicSurface();

    expect(source).not.toMatch(/Stripe|stripe|checkout|portal/i);
    expect(source).not.toContain('/#planos');
    expect(source).not.toMatch(/plano pago|planos pagos|contratação paga/i);
    expect(source).not.toMatch(/processa pagamentos|meios de pagamento/i);
    expect(source).not.toMatch(/Dados comerciais|Dados fiscais e financeiros/i);
    expect(source).not.toMatch(/faturamento|reembolso/i);
  });

  it('does not advertise deferred v2-native sensitive features on the public entrypoint', () => {
    const source = readIndexSurface();

    expect(source).not.toMatch(
      /foto|fotos|assinatura|assine digitalmente|PDF|WhatsApp|Supabase Storage|gera PDF|funciona sem internet/i,
    );
  });

  it('does not advertise deferred sensitive features on public legal pages', () => {
    const source = readPublicSurface();

    expect(source).not.toMatch(
      /fotos|assinatura digital|PDFs?|WhatsApp|Supabase Storage|funciona offline|funcionamento sem internet|funciona sem internet/i,
    );
  });
});
