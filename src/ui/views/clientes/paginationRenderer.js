import { ICON_CHEV_L, ICON_CHEV_R } from './constants.js';

export function renderPagination(filteredCount, { currentPage, pageSize }) {
  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));
  if (filteredCount === 0) return '';
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(filteredCount, currentPage * pageSize);

  const pageBtns = [];
  for (let p = 1; p <= totalPages; p++) {
    const active = p === currentPage ? ' is-active' : '';
    pageBtns.push(
      `<button type="button" class="cli-pag__page${active}" data-cli-action="goto-page" data-page="${p}" aria-label="Pagina ${p}" aria-current="${p === currentPage ? 'page' : 'false'}">${p}</button>`,
    );
  }

  const prevDisabled = currentPage <= 1 ? 'disabled' : '';
  const nextDisabled = currentPage >= totalPages ? 'disabled' : '';

  return `
    <div class="cli-pag" role="navigation" aria-label="Paginação">
      <div class="cli-pag__info">Mostrando ${from}-${to} de ${filteredCount}</div>
      <div class="cli-pag__controls">
        <button type="button" class="cli-pag__btn" data-cli-action="prev-page"
          aria-label="Pagina anterior" ${prevDisabled}>${ICON_CHEV_L}</button>
        <div class="cli-pag__pages">${pageBtns.join('')}</div>
        <button type="button" class="cli-pag__btn" data-cli-action="next-page"
          aria-label="Próxima pagina" ${nextDisabled}>${ICON_CHEV_R}</button>
      </div>
      <label class="cli-select cli-pag__size">
        <span class="cli-select__label">Por página</span>
        <select id="cli-page-size" class="cli-select__input" aria-label="Itens por página">
          <option value="6" ${pageSize === 6 ? 'selected' : ''}>6</option>
          <option value="12" ${pageSize === 12 ? 'selected' : ''}>12</option>
          <option value="24" ${pageSize === 24 ? 'selected' : ''}>24</option>
        </select>
      </label>
    </div>`;
}
