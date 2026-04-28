export function bindEquipCardImageFallbacks(root) {
  const scope = root instanceof Element ? root : document;
  scope.querySelectorAll('.equip-card__type-icon--photo img').forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.dataset.fallbackBound === '1') return;
    img.dataset.fallbackBound = '1';
    const iconWrap = img.closest('.equip-card__type-icon');
    if (!iconWrap) return;

    const markLoaded = () => {
      iconWrap.classList.add('equip-card__type-icon--loaded');
    };
    const applyFallback = () => {
      iconWrap.classList.add('equip-card__type-icon--fallback');
      img.remove();
    };

    img.addEventListener('load', markLoaded, { once: true });
    img.addEventListener('error', applyFallback, { once: true });

    if (img.complete) {
      if (img.naturalWidth > 0) markLoaded();
      else applyFallback();
    }
  });
}
