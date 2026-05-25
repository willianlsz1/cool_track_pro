const deps = {};

export function configureRegistroSaveUiController(options = {}) {
  Object.assign(deps, options);
}

function getDep(name) {
  const value = deps[name];
  if (!value) throw new Error(`[registroSaveUiController] dependencia ausente: ${name}`);
  return value;
}

function setRegistroProximaPreventiva(registroId, proxima) {
  if (!registroId) return;
  getDep('setState')((prev) => ({
    ...prev,
    registros: prev.registros.map((registro) =>
      registro.id === registroId ? { ...registro, proxima } : registro,
    ),
  }));
}

export async function showProximaPreventivaPrompt(registroId) {
  const result = await getDep('RegistroProximaPreventivaPrompt').open();
  if (!result || result.canceled === true) {
    return result;
  }

  if (result.semRetorno === true) {
    setRegistroProximaPreventiva(registroId, null);
    return result;
  }

  if (result.proxima) {
    setRegistroProximaPreventiva(registroId, result.proxima);
  }
  return result;
}

export function setRegistroSaveButtonsLoading(isLoading) {
  const buttons = document.querySelectorAll('[data-action="save-registro"]');
  buttons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    button.disabled = isLoading;
    button.classList.toggle('is-loading', isLoading);
    if (isLoading) {
      button.setAttribute('aria-busy', 'true');
    } else {
      button.removeAttribute('aria-busy');
    }
  });
}
