/**
 * BrandMark — simbolo oficial da marca CoolTrackPro.
 *
 * Centraliza o glyph "compass de floco" (4 eixos atravessados pelo
 * centro + 8 cabeças de seta apontando pra fora + ponto central) usado
 * como brand mark da nova landing. Antes deste componente o glyph
 * estava duplicado inline em LandingHeader, LandingFooter e nas 3
 * paginas estaticas em `public/legal/*.html` — com versoes ligeiramente
 * inconsistentes (LandingFooter, por exemplo, vinha sem as cabeças de
 * seta nos extremos).
 *
 * O glyph e renderizado em SVG inline (sem PNG) porque:
 *  1. precisa escalar limpo de 16px (favicon-like) ate 64px+ sem perder
 *     definicao;
 *  2. permite trocar fill/stroke conforme o contexto;
 *  3. zero round-trip de asset — fica embed no chunk da landing.
 *
 * Para superficies onde precisamos do tile completo da marca (header,
 * footer, sidebar do dashboard preview), o componente renderiza por
 * default o glyph dentro da gradient cyan/blue — espelhando o cofre
 * visual ja presente em `tailwind.config.cjs > landing.{blue,cyan}`.
 *
 * Variants:
 *  - `default` (frame=true): tile gradiente + glyph branco (uso de
 *    branding visivel, ex.: header da landing).
 *  - `frame={false}`: glyph isolado, sem tile (uso quando ja existe um
 *    container externo, ex.: dentro de uma badge custom).
 *
 * Acessibilidade:
 *  - Por default `aria-hidden="true"` (decorativo) — o consumidor
 *    geralmente fornece o nome da marca em texto adjacente
 *    ("CoolTrackPro").
 *  - Passar `ariaLabel="CoolTrackPro"` quando o BrandMark aparece
 *    isolado e precisa virar conteudo semantico (ex.: link sem texto).
 */
export function BrandMark({ size = 36, frame = true, className = '', ariaLabel }) {
  // Glyph occupa ~55% do tile pra deixar respiro visual ao redor.
  // Quando glyph-only (sem frame), respeita exatamente `size`.
  const glyphSize = frame ? Math.round(size * 0.55) : size;
  // Raio do tile escala junto com o size pra manter a "squircleidade"
  // (10px em 36px ≈ 28% do lado).
  const frameRadius = Math.round(size * 0.28);

  const glyph = (
    <svg
      width={glyphSize}
      height={glyphSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaLabel ? undefined : 'true'}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
    >
      {/* 4 eixos: vertical, horizontal, 2 diagonais (45° / 135°). */}
      <path d="M12 2v20M2 12h20M4.5 4.5l15 15M19.5 4.5l-15 15" />
      {/* 8 cabeças de seta (chevrons em V) apontando pra fora em cada
          extremo dos 4 eixos. E o que distingue este glyph de um
          floco-de-neve generico — leitura "compass tecnico". */}
      <path d="M12 6l-2 2M12 6l2 2M12 18l-2-2M12 18l2-2M6 12l2-2M6 12l2 2M18 12l-2-2M18 12l-2 2" />
    </svg>
  );

  if (!frame) {
    return glyph;
  }

  return (
    <span
      className={`tw-inline-grid tw-place-items-center tw-flex-none ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: frameRadius,
        background: 'linear-gradient(135deg, #006DFF 0%, #40C4FF 100%)',
        boxShadow: '0 6px 18px rgba(21,155,255,0.35)',
      }}
      aria-hidden={ariaLabel ? undefined : 'true'}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
    >
      {/* Glyph dentro do tile e sempre decorativo (a label ariaLabel,
          se passada, fica no <span> externo) — evita 2 nodes anunciados
          por leitor de tela. */}
      <svg
        width={glyphSize}
        height={glyphSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2v20M2 12h20M4.5 4.5l15 15M19.5 4.5l-15 15" />
        <path d="M12 6l-2 2M12 6l2 2M12 18l-2-2M12 18l2-2M6 12l2-2M6 12l2 2M18 12l-2-2M18 12l-2 2" />
      </svg>
    </span>
  );
}

export default BrandMark;
