export function getSetorNomeValidation(nomeRaw, validateSetorNome) {
  const { empty, tooLong, isValid } = validateSetorNome(nomeRaw);
  return { empty, tooLong, isValid };
}

function hexLuminance(hex) {
  const h = String(hex || '').replace('#', '');
  if (h.length !== 6) return 0;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const toLin = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

export function setorContrastWithWhite(hex) {
  const L = hexLuminance(hex);
  return 1.05 / (L + 0.05);
}

export function findPaletteEntry(hex, palette) {
  if (!hex) return null;
  const target = String(hex).toLowerCase();
  return palette.find((p) => p.hex.toLowerCase() === target) || null;
}
