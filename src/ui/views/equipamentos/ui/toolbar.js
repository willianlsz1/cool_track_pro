const toolbarDeps = {
  Utils: null,
};

export function configureToolbar(deps = {}) {
  Object.assign(toolbarDeps, deps);
}

function requireToolbarDep(name) {
  const dep = toolbarDeps[name];
  if (!dep) {
    throw new Error(`toolbar dependency not configured: ${name}`);
  }
  return dep;
}

function resolveToolbarElements() {
  const Utils = requireToolbarDep('Utils');
  return {
    titleEl: Utils.getEl('equip-page-title'),
    subtitleEl: Utils.getEl('equip-page-subtitle'),
    actionsEl: Utils.getEl('equip-toolbar-actions'),
  };
}

function buildToolbarDefaultCtaHtml({ hideDefaultCta = false } = {}) {
  // CTA único "+ Novo equipamento". Antes eram 2 botões ("Cadastrar com
  // foto" primário + "Novo equipamento" outline), o que duplicava a ação
  // na toolbar — ambos abriam o mesmo modal-add-eq.
  return hideDefaultCta
    ? ''
    : `<button class="btn btn--primary btn--sm"
          data-action="open-modal" data-id="modal-add-eq"
          data-source="toolbar_primary"
          data-testid="equipamentos-add-equipment"
          aria-label="Cadastrar novo equipamento (manual ou via foto da etiqueta)">+ Novo equipamento</button>`;
}

function buildToolbarActionsHtml({ extraBtn, hideDefaultCta = false } = {}) {
  const defaultCta = buildToolbarDefaultCtaHtml({ hideDefaultCta });
  return `
      ${extraBtn || ''}
      ${defaultCta}
    `;
}

function applyToolbarTitle(elements, title) {
  if (elements.titleEl) elements.titleEl.textContent = title || 'Equipamentos';
}

function applyToolbarSubtitle(elements) {
  if (elements.subtitleEl) elements.subtitleEl.textContent = '';
}

function applyToolbarActions(elements, html) {
  if (elements.actionsEl) elements.actionsEl.innerHTML = html;
}

export function setToolbar({ title, extraBtn, hideDefaultCta = false } = {}) {
  const elements = resolveToolbarElements();
  applyToolbarTitle(elements, title);
  applyToolbarSubtitle(elements);
  if (elements.actionsEl) {
    const actionsHtml = buildToolbarActionsHtml({ extraBtn, hideDefaultCta });
    applyToolbarActions(elements, actionsHtml);
  }
}
