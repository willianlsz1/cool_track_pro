export function advancePhotoRowY(photoY, rowIndex, photoRows, rowHeight, rowGap) {
  let nextY = photoY + rowHeight;
  if (rowIndex < photoRows - 1) nextY += rowGap;
  return nextY;
}

export function resolveServiceCardStartY({
  y,
  maxY,
  needsGap,
  requiredSpace,
  nextPageContentY,
  cardGap,
}) {
  const pageBudget = maxY - y;
  const startsNewPage = requiredSpace > pageBudget && y > nextPageContentY + 0.1;

  return {
    startsNewPage,
    y: startsNewPage ? nextPageContentY : needsGap ? y + cardGap : y,
  };
}
