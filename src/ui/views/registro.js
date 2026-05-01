/**
 * CoolTrack Pro - Registro View v5.0
 * Funções: initRegistro, saveRegistro, clearRegistro
 */

import { Utils } from '../../core/utils.js';
import { getState, findEquip, setState, lastRegForEquip } from '../../core/state.js';
import { Toast } from '../../core/toast.js';
import { goTo, setRouteGuard, clearRouteGuard } from '../../core/router.js';
import { CustomConfirm } from '../../core/modal.js';
import { Photos } from '../components/photos.js';
import { SavedHighlight } from '../components/onboarding.js';
import { Profile } from '../../features/profile.js';
import { ErrorCodes, handleError } from '../../core/errors.js';
import { uploadPendingPhotos } from '../../core/photoStorage.js';
import { getOperationalStatus, validateOperationalPayload } from '../../core/equipmentRules.js';
import { reconcileEquipmentStatusesAfterRegistroEdit } from '../../domain/registroStatus.js';
import { trackEvent } from '../../core/telemetry.js';
import { withSkeleton } from '../components/skeleton.js';
import { validateRegistroPayload } from '../../core/inputValidation.js';
import { isCachedPlanPlusOrHigher } from '../../core/plans/planCache.js';
import { PostSaveRegistroToast } from '../components/postSaveRegistroToast.js';
import { exportPdfFlow, shareWhatsAppFlow } from '../controller/handlers/reportExportHandlers.js';
import { bindSmartContactMaskInput } from '../../core/phoneMask.js';
import { resolveRegistroContext } from '../composables/registroContext.js';
import { buildRegistroViewModel } from '../viewModels/registroViewModel.js';
import {
  getChecklistTemplate,
  buildEmptyChecklist,
  validateChecklist,
  summarizeChecklist,
} from '../../domain/pmoc/checklistTemplates.js';

// O meter de progresso vive estático dentro do hero do template.
// Apontamos pro hero + o contador numérico ao invés de injetar markup na hora.
const HERO_ID = 'registro-hero';
const HERO_SUB_ID = 'registro-hero-sub';
const HERO_PILL_TEXT_ID = 'registro-hero-pill-text';
const PROGRESS_COUNT_ID = 'form-progress-count';
const METER_ID = 'registro-hero-meter';
const REGISTRO_HEADER_ROOT_ID = 'registro-header-root';
const REGISTRO_CHECKLIST_ROOT_ID = 'r-checklist-body';
const QUICK_TEMPLATE_MAP = {
  limpeza: {
    tipo: 'Limpeza de Filtros',
    prioridade: 'media',
    descricao:
      'Limpeza preventiva realizada no equipamento. Filtros higienizados e operação validada em funcionamento normal.',
  },
  recarga_gas: {
    tipo: 'Carga de Gás Refrigerante',
    prioridade: 'alta',
    descricao:
      'Recarga de gás refrigerante aplicada após verificação de pressão e vedação. Sistema estabilizado para operação.',
  },
  troca_filtro: {
    tipo: 'Limpeza de Filtros',
    prioridade: 'media',
    descricao:
      'Troca de filtro executada para restabelecer vazão de ar e qualidade da operação. Equipamento testado após a substituição.',
  },
  inspecao: {
    tipo: 'Inspeção Geral',
    prioridade: 'baixa',
    descricao:
      'Inspeção técnica geral concluída com checklist visual e funcional. Sem anomalias críticas no momento.',
  },
  manutencao_corretiva: {
    tipo: 'Manutenção Corretiva',
    prioridade: 'alta',
    descricao:
      'Atendimento corretivo realizado para falha reportada em campo. Correção aplicada e equipamento reavaliado em funcionamento.',
  },
};

// Descrições padrão por tipo do dropdown r-tipo. Quando o usuário seleciona uma
// opção (via select nativo, não via chip de ação rápida), o textarea
// "Detalhes pro cliente" é preenchido com a frase abaixo — mesma lógica dos
// chips, pra evitar dois caminhos com comportamento diferente.
// Reusa as descrições do QUICK_TEMPLATE_MAP onde há correspondência, e
// adiciona frases novas pros tipos que não têm ação rápida equivalente.
// "Outro" fica fora — nesse caso o user digita um rótulo próprio no campo
// "Qual serviço?" e escreve os detalhes manualmente.
const DESCRIPTION_BY_TIPO = {
  'Manutenção Preventiva':
    'Manutenção preventiva realizada conforme plano do equipamento. Componentes verificados, limpeza geral executada e operação validada em funcionamento normal.',
  'Manutenção Corretiva': QUICK_TEMPLATE_MAP.manutencao_corretiva.descricao,
  'Limpeza de Filtros': QUICK_TEMPLATE_MAP.limpeza.descricao,
  'Carga de Gás Refrigerante': QUICK_TEMPLATE_MAP.recarga_gas.descricao,
  'Troca de Compressor':
    'Compressor substituído por unidade compatível. Sistema recarregado, isolamento térmico reconstituído e funcionamento validado após o procedimento.',
  'Troca de Capacitor':
    'Capacitor substituído por componente equivalente. Partida do motor testada e parâmetros elétricos dentro do esperado.',
  'Limpeza de Condensador':
    'Limpeza do condensador executada com desobstrução das aletas. Troca térmica restabelecida e operação validada.',
  'Limpeza de Evaporador':
    'Limpeza do evaporador realizada com higienização das aletas. Temperatura de operação verificada após o procedimento.',
  'Verificação Elétrica':
    'Verificação elétrica realizada: medições de corrente, tensão e isolamento dentro dos parâmetros normais. Sem anomalias registradas.',
  'Ajuste de Dreno':
    'Dreno desobstruído e testado. Escoamento do condensado normalizado, sem retorno de água no equipamento.',
  'Inspeção Geral': QUICK_TEMPLATE_MAP.inspecao.descricao,
};

// Set com todas as descrições conhecidas (quick templates + por-tipo). Serve
// pro prefill do dropdown saber se pode sobrescrever o textarea — se o texto
// atual for uma frase auto-preenchida, é seguro trocar; se o user editou, a
// gente respeita o que ele escreveu. Inclui as duas descrições de tipo
// 'Limpeza de Filtros' (limpeza preventiva vs troca de filtro) porque ambas
// vêm dos chips de ação rápida e ainda representam texto auto-gerado.
const KNOWN_AUTO_DESCRIPTIONS = new Set([
  ...Object.values(QUICK_TEMPLATE_MAP).map((t) => t.descricao),
  ...Object.values(DESCRIPTION_BY_TIPO),
]);

function _prefillObsFromTipo(tipo) {
  const desc = DESCRIPTION_BY_TIPO[tipo];
  if (!desc) return; // tipo sem template (ex.: "Outro") — nada a fazer
  const currentObs = Utils.getVal('r-obs').trim();
  // Sobrescreve só quando o textarea está vazio OU quando o conteúdo atual é
  // uma frase auto-gerada (ação rápida anterior ou outro tipo do dropdown).
  // Assim, trocar de tipo atualiza os detalhes, mas texto digitado à mão
  // continua intocado.
  if (currentObs && !KNOWN_AUTO_DESCRIPTIONS.has(currentObs)) return;
  Utils.setVal('r-obs', desc);
}

const EDITING_KEY = 'cooltrack-editing-id';
let _registroHeaderBridgePromise = null;
let _registroHeaderBridge = null;
let _registroHeaderRenderGeneration = 0;
let _registroChecklistBridgePromise = null;
let _registroChecklistBridge = null;
let _registroChecklistRenderGeneration = 0;
// Persiste o último cliente preenchido para auto-prefill no próximo registro —
// técnico que atende o mesmo cliente em sequência não precisa digitar de novo.
const LAST_CLIENT_KEY = 'cooltrack-last-client';
let _currentRouteParams = {};

function _loadLastClient() {
  try {
    return JSON.parse(localStorage.getItem(LAST_CLIENT_KEY) || 'null');
  } catch (_err) {
    return null;
  }
}

function _saveLastClient(cliente) {
  try {
    // Só persiste se algum campo estiver preenchido — evita sobrescrever com
    // registros salvos "no modo rápido" que não tocam os campos do cliente.
    if (!cliente || (!cliente.clienteNome && !cliente.localAtendimento)) return;
    localStorage.setItem(LAST_CLIENT_KEY, JSON.stringify(cliente));
  } catch (_err) {
    // localStorage indisponível — ignora
  }
}

function isSafeSignatureCaptureDataUrl(dataUrl) {
  return /^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(String(dataUrl || '').trim());
}

function _updateImpactCopy(context) {
  const title = document.getElementById('registro-impact-title');
  const subtitle = document.getElementById('registro-impact-subtitle');
  const hint = document.getElementById('registro-impact-hint');
  if (!title || !subtitle || !hint) return;

  if (context?.hasCompanyContext) {
    title.innerHTML = 'Impacto no PMOC <span class="registro-details__pri">Recomendado</span>';
    subtitle.textContent =
      'status final, prioridade e próxima preventiva para acompanhamento do cliente';
    hint.textContent =
      'Esse registro atualiza o histórico do equipamento e ajuda a manter o PMOC do cliente em dia.';
    return;
  }

  title.innerHTML =
    'Impacto no acompanhamento <span class="registro-details__pri">Recomendado</span>';
  subtitle.textContent = 'status final, prioridade e próxima preventiva';
  hint.textContent =
    'Defina o status final e a próxima preventiva para acompanhar melhor este equipamento.';
}

function _applyClienteDetailsContext(context) {
  const details = document.getElementById('registro-cliente-details');
  if (!details) return;
  const subtitle = details.querySelector('.registro-details__subtitle');
  const body = details.querySelector('.registro-details__body');
  const add = details.querySelector('.registro-details__add');
  const summary = document.getElementById('registro-cliente-context-summary');

  if (!subtitle || !body || !summary) return;

  if (context?.cliente) {
    subtitle.textContent = 'vinculado automaticamente ao contexto';
    body.hidden = true;
    add?.setAttribute('hidden', 'hidden');
    details.removeAttribute('open');
    summary.hidden = false;
    summary.innerHTML = `<strong>${Utils.escapeHtml(context.cliente.nome || 'Cliente vinculado')}</strong>${
      context.cliente.documento ? ` · ${Utils.escapeHtml(context.cliente.documento)}` : ''
    }`;
    return;
  }

  subtitle.textContent = 'opcional — aparece na capa do PDF';
  body.hidden = false;
  add?.removeAttribute('hidden');
  summary.hidden = true;
  summary.textContent = '';
}

function _applyResolvedContext(context) {
  const contextCard = document.getElementById('registro-context-card');
  const contextHint = document.getElementById('registro-context-hint');
  const clienteText = document.getElementById('registro-context-cliente');
  const setorText = document.getElementById('registro-context-setor');
  const equipText = document.getElementById('registro-context-equip');

  if (context?.cliente) {
    Utils.setVal('r-cliente-nome', context.cliente.nome || '');
    Utils.setVal('r-cliente-documento', context.cliente.documento || '');
    Utils.setVal('r-local-atendimento', context.cliente.localAtendimento || '');
    Utils.setVal('r-cliente-contato', context.cliente.contato || '');
  }

  const hasContextCard = Boolean(context?.hasCompanyContext && contextCard);
  if (hasContextCard) {
    contextCard.hidden = false;
    if (clienteText) clienteText.textContent = context.cliente?.nome || 'Não informado';
    if (setorText) setorText.textContent = context.setor?.nome || 'Não informado';
    if (equipText) {
      const eq = context.equipamento;
      const suffix = eq?.tag ? ` · TAG ${eq.tag}` : '';
      equipText.textContent = eq?.nome ? `${eq.nome}${suffix}` : 'Não informado';
    }
  } else if (contextCard) {
    contextCard.hidden = true;
  }

  if (contextHint) {
    if (context?.missingEquipFromParams) {
      contextHint.hidden = false;
      contextHint.textContent =
        'Equipamento não encontrado. Confira o cadastro ou escolha outro equipamento.';
    } else if (context?.shouldWarnEquipmentOnly) {
      contextHint.hidden = false;
      contextHint.textContent = 'Este serviço ficará apenas no histórico do equipamento.';
    } else {
      contextHint.hidden = true;
      contextHint.textContent = '';
    }
  }

  _applyClienteDetailsContext(context);
  _updateImpactCopy(context);
}

function _refreshRegistroContext() {
  const stateNow = getState();
  const equipId = Utils.getVal('r-equip') || _currentRouteParams?.equipId;
  const context = resolveRegistroContext(
    {
      ..._currentRouteParams,
      equipId: equipId || null,
    },
    stateNow,
  );
  _applyResolvedContext(context);
}

function _readRegistroFormModelSnapshot() {
  return {
    equipId: Utils.getVal('r-equip'),
    data: Utils.getVal('r-data'),
    tipo: Utils.getVal('r-tipo'),
    tipoCustom: Utils.getVal('r-tipo-custom'),
    obs: Utils.getVal('r-obs'),
    tecnico: Utils.getVal('r-tecnico'),
    status: Utils.getVal('r-status'),
    prioridade: Utils.getVal('r-prioridade'),
    pecas: Utils.getVal('r-pecas'),
    proxima: Utils.getVal('r-proxima'),
    custoPecas: Utils.getVal('r-custo-pecas'),
    custoMaoObra: Utils.getVal('r-custo-mao-obra'),
    clienteNome: Utils.getVal('r-cliente-nome'),
    clienteDocumento: Utils.getVal('r-cliente-documento'),
    localAtendimento: Utils.getVal('r-local-atendimento'),
    clienteContato: Utils.getVal('r-cliente-contato'),
  };
}

function _buildRegistroReadOnlyViewModel(params = {}) {
  return buildRegistroViewModel({
    state: getState(),
    params,
    form: _readRegistroFormModelSnapshot(),
    editingId: sessionStorage.getItem(EDITING_KEY),
    checklist: getCurrentChecklist(),
    isPlusOrHigher: isCachedPlanPlusOrHigher(),
  });
}

function _asArray(value) {
  return Array.isArray(value) ? value : [];
}

function loadRegistroHeaderBridge() {
  if (_registroHeaderBridge) return Promise.resolve(_registroHeaderBridge);
  if (!_registroHeaderBridgePromise) {
    _registroHeaderBridgePromise = import('../../react/entrypoints/registroHeaderIsland.jsx')
      .then((bridge) => {
        _registroHeaderBridge = bridge;
        return bridge;
      })
      .catch((error) => {
        _registroHeaderBridgePromise = null;
        throw error;
      });
  }
  return _registroHeaderBridgePromise;
}

function ensureRegistroHeaderRoot() {
  let root = document.getElementById(REGISTRO_HEADER_ROOT_ID);
  if (root) return root;

  const hero = document.getElementById(HERO_ID);
  if (!hero?.parentNode) return null;

  root = document.createElement('div');
  root.id = REGISTRO_HEADER_ROOT_ID;
  root.style.display = 'contents';
  hero.parentNode.insertBefore(root, hero);

  const lastNode = document.getElementById('registro-context-hint') || hero;
  let node = hero;
  while (node) {
    const next = node.nextSibling;
    root.appendChild(node);
    if (node === lastNode) break;
    node = next;
  }

  return root;
}

function buildRegistroHeaderReactProps(params = {}) {
  const state = getState() || {};
  const viewModel = _buildRegistroReadOnlyViewModel(params);
  const equipmentOptions = _asArray(state.equipamentos).map((equipamento) => ({
    id: String(equipamento?.id || ''),
    label: `${equipamento?.nome || '—'} — ${equipamento?.local || '—'}`,
  }));
  const technicianOptions = _asArray(state.técnicos || state.tecnicos);

  return {
    viewModel,
    equipmentOptions,
    technicianOptions,
  };
}

function mountRegistroHeader(params = {}) {
  if (typeof document === 'undefined') return null;

  const root = ensureRegistroHeaderRoot();
  if (!root) return null;

  const renderGeneration = (_registroHeaderRenderGeneration += 1);
  const props = buildRegistroHeaderReactProps(params);

  const mountWithBridge = (bridge) => {
    if (renderGeneration !== _registroHeaderRenderGeneration) return null;
    return bridge.mountRegistroHeaderReact(root, props);
  };

  if (_registroHeaderBridge?.mountRegistroHeaderReact) {
    return mountWithBridge(_registroHeaderBridge);
  }

  return loadRegistroHeaderBridge().then(mountWithBridge);
}

export function unmountRegistroHeader() {
  _registroHeaderRenderGeneration += 1;
  if (typeof document === 'undefined') return null;

  const root = document.getElementById(REGISTRO_HEADER_ROOT_ID);
  if (!root?.dataset.reactRegistroHeaderMounted) return null;

  if (_registroHeaderBridge?.unmountRegistroHeaderReact) {
    _registroHeaderBridge.unmountRegistroHeaderReact(root);
    return null;
  }

  return loadRegistroHeaderBridge().then((bridge) => {
    bridge.unmountRegistroHeaderReact?.(root);
  });
}

function resetEditingState() {
  sessionStorage.removeItem(EDITING_KEY);
  const formView = Utils.getEl('view-registro');
  if (formView) formView.dataset.editMode = '0';
  // Edicao terminou (save / clear / discard) — libera o guard de navegacao.
  clearRouteGuard();
}

// Guard de saida em modo edição. Bloqueia navegacao pra outra rota e mostra
// modal pedindo confirmação. Se usuário "Descartar", faz reset COMPLETO do
// form (clearRegistro) — incluindo label do botao "Finalizar serviço" — e
// libera a navegacao. Se "Continuar editando", cancela.
async function _confirmLeaveEditingGuard(_nextRoute, _nextParams) {
  const ok = await CustomConfirm.show(
    'Sair sem salvar as alterações?',
    'Você está editando um registro. Se sair agora, as alterações serão descartadas.',
    {
      confirmLabel: 'Descartar e sair',
      cancelLabel: 'Continuar editando',
      tone: 'danger',
    },
  );
  if (ok) {
    // Reset completo: limpa campos do form, foto, checklist, label do botao
    // ("Salvar alteracoes" -> "Finalizar serviço"), classes, EDITING_KEY,
    // dataset e o proprio guard (resetEditingState e chamado dentro).
    clearRegistro();
  }
  return ok;
}

// Prefixo usado quando o usuário escolhe "Outro" e descreve o serviço num campo
// livre. O valor final persistido em `registro.tipo` fica tipo "Outro · Teste
// de estanqueidade" — é só uma string única, sem coluna extra no Supabase. Para
// edição, o loadRegistroForEdit detecta o prefixo e repopula o select + o input
// custom automaticamente.
const TIPO_OUTRO_PREFIX = 'Outro · ';
const TIPO_CUSTOM_MAX = 40;

// ── Barra de progresso do formulário ──────────────────
// O campo r-tipo-custom é condicional: só conta como "preenchido" quando o tipo
// = "Outro". Nos outros tipos ele fica oculto e nem é considerado na barra.
const _fields = [
  { id: 'r-equip', validate: (v) => v !== '' },
  { id: 'r-data', validate: (v) => v !== '' },
  {
    id: 'r-tipo',
    validate: (v) => {
      if (v === '') return false;
      if (v === 'Outro') {
        // Quando "Outro", só consideramos o tipo "preenchido" se o custom label
        // também estiver válido (>=1 char, sem exceder o limite). Sem isso, a
        // barra de progresso marcaria Outro como ok mesmo com o label em branco.
        const custom = (Utils.getEl('r-tipo-custom')?.value || '').trim();
        return custom.length >= 1 && custom.length <= TIPO_CUSTOM_MAX;
      }
      return true;
    },
  },
  { id: 'r-tecnico', validate: (v) => v.trim() !== '' },
  { id: 'r-obs', validate: (v) => v.trim().length >= 10 },
];

// Mostra/esconde o input custom conforme a seleção do tipo. Também gerencia o
// atributo `required` e o foco automático quando o usuário escolhe "Outro" —
// assim a UX flui: escolheu Outro → cursor já no campo pra descrever.
function _syncTipoCustomVisibility({ focusOnShow = false } = {}) {
  const sel = Utils.getEl('r-tipo');
  const wrap = document.getElementById('r-tipo-custom-wrap');
  const input = Utils.getEl('r-tipo-custom');
  if (!sel || !wrap || !input) return;

  const isOutro = sel.value === 'Outro';
  wrap.hidden = !isOutro;
  if (isOutro) {
    input.setAttribute('required', '');
    input.setAttribute('aria-required', 'true');
    if (focusOnShow) {
      // pequeno delay pra evitar quebra de foco quando o change vem de click
      // no select nativo em alguns browsers mobile (iOS Safari especialmente)
      setTimeout(() => input.focus(), 30);
    }
  } else {
    input.removeAttribute('required');
    input.removeAttribute('aria-required');
    input.value = '';
  }
}

// ── Meter de progresso no hero ────────────────────────
//
// Desde o redesign (v6), o meter está inline no template (.registro-hero__meter
// com 5 .registro-hero__seg). A função "ensure" virou só uma garantia de que o
// hero existe e tá sincronizado; a "update" pinta cada segmento conforme os
// campos vão sendo preenchidos e troca o data-state do hero pra empty/partial/
// complete — CSS muda a cor do meter e dos indicadores a partir disso.
function _ensureProgressBar(_formView) {
  // No-op mantido pra compatibilidade com o contrato anterior. O markup já vem
  // do template; se alguma view legado perder o hero, o _updateProgressBar
  // simplesmente não faz nada (guard clauses abaixo).
}

function _updateProgressBar() {
  const total = _fields.length;
  const filled = _fields.filter((f) => {
    const i = Utils.getEl(f.id);
    return i && f.validate(i.value);
  }).length;

  const hero = document.getElementById(HERO_ID);
  const meter = document.getElementById(METER_ID);
  const cnt = document.getElementById(PROGRESS_COUNT_ID);

  if (cnt) cnt.textContent = String(filled);

  if (meter) {
    const segs = meter.querySelectorAll('.registro-hero__seg');
    segs.forEach((seg, idx) => {
      seg.classList.toggle('is-filled', idx < filled);
    });
    meter.setAttribute('aria-valuenow', String(filled));
    meter.setAttribute('aria-valuemax', String(total));
  }

  if (hero) {
    hero.dataset.state = filled === 0 ? 'empty' : filled === total ? 'complete' : 'partial';
  }
}

// ── Sub do hero (meta "Domingo · 19 abr · 20:55") ──────
// Renderiza o sub do hero em português com 3 dots separadores. Se no futuro
// quisermos atualizar "ao vivo" (ex.: relógio), basta chamar de novo. Hoje só
// roda no initRegistro — data é a da abertura do formulário.
function _renderHeroSub() {
  const sub = document.getElementById(HERO_SUB_ID);
  if (!sub) return;
  const now = new Date();
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const meses = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ];
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const parts = [
    dias[now.getDay()],
    `${now.getDate()} ${meses[now.getMonth()]} ${now.getFullYear()}`,
    `${hh}:${mm}`,
  ];
  sub.innerHTML = parts
    .map(
      (p, i) =>
        `<span>${p}</span>${i < parts.length - 1 ? '<span class="registro-hero__sub-dot" aria-hidden="true"></span>' : ''}`,
    )
    .join('');
}

// ── Aviso de manutenção agendada ───────────────────────
function _bindEquipChangeWarning() {
  const sel = Utils.getEl('r-equip');
  if (!sel) return;
  if (sel.dataset.registroEquipWarningBound === '1') return;
  sel.dataset.registroEquipWarningBound = '1';
  sel.addEventListener('change', () => {
    const id = sel.value;
    const currentEditingId = sessionStorage.getItem(EDITING_KEY);
    if (currentEditingId) {
      resetEditingState();
      clearRegistro();
      if (id) Utils.setVal('r-equip', id);
    }
    document.getElementById('reg-pending-warning')?.remove();
    if (!id) return;
    const lastReg = lastRegForEquip(id);
    if (lastReg && Utils.daysDiff(lastReg.proxima) >= 0) {
      const w = document.createElement('div');
      w.id = 'reg-pending-warning';
      w.className = 'reg-pending-warning';
      w.textContent = '⚠ Manutenção preventiva agendada. Registre apenas em emergência.';
      sel.parentNode.parentNode.insertBefore(w, sel.parentNode.nextSibling);
    }
  });
}

// ── Checklist NBR 13971 (Fase 3 PMOC) ─────────────────────────
// State local: snapshot do checklist em edição. Reset quando equip muda
// (template é por tipo) ou quando o registro é salvo/limpo.
let _currentChecklist = null;

function _isPreventivaTipo(tipoValue) {
  return String(tipoValue || '')
    .toLowerCase()
    .includes('preventiva');
}

function loadRegistroChecklistBridge() {
  if (_registroChecklistBridge) return Promise.resolve(_registroChecklistBridge);
  if (!_registroChecklistBridgePromise) {
    _registroChecklistBridgePromise = import('../../react/entrypoints/registroChecklistIsland.jsx')
      .then((bridge) => {
        _registroChecklistBridge = bridge;
        return bridge;
      })
      .catch((error) => {
        _registroChecklistBridgePromise = null;
        throw error;
      });
  }
  return _registroChecklistBridgePromise;
}

function buildRegistroChecklistReactProps(template) {
  const viewModel = _buildRegistroReadOnlyViewModel(_currentRouteParams);
  const snapshotMap = new Map(_asArray(_currentChecklist?.items).map((item) => [item.id, item]));
  const groupsOrder = [];
  const groupBuckets = new Map();

  _asArray(template?.items).forEach((item) => {
    const group = String(item?.group || '');
    if (!groupBuckets.has(group)) {
      groupsOrder.push(group);
      groupBuckets.set(group, []);
    }
    groupBuckets.get(group).push(item);
  });

  return {
    checklist: {
      label: String(template?.label || ''),
      groups: groupsOrder.map((group) => ({
        label: group,
        items: groupBuckets.get(group).map((item) => {
          const snap = snapshotMap.get(item.id) || { status: null, obs: '', measure: null };
          return {
            id: String(item?.id || ''),
            label: String(item?.label || ''),
            mandatory: Boolean(item?.mandatory),
            measurable: Boolean(item?.measurable),
            unit: String(item?.unit || ''),
            status: snap.status || null,
            obs: String(snap.obs || ''),
            measureValue:
              snap.measure && snap.measure.value != null ? String(snap.measure.value) : '',
          };
        }),
      })),
    },
    actions: viewModel.actions,
  };
}

function mountRegistroChecklist(template) {
  if (typeof document === 'undefined') return null;

  const root = document.getElementById(REGISTRO_CHECKLIST_ROOT_ID);
  if (!root) return null;

  const renderGeneration = (_registroChecklistRenderGeneration += 1);
  const props = buildRegistroChecklistReactProps(template);

  const mountWithBridge = (bridge) => {
    if (renderGeneration !== _registroChecklistRenderGeneration) return null;
    return bridge.mountRegistroChecklistReact(root, props);
  };

  if (_registroChecklistBridge?.mountRegistroChecklistReact) {
    return mountWithBridge(_registroChecklistBridge);
  }

  return loadRegistroChecklistBridge().then(mountWithBridge);
}

export function unmountRegistroChecklist() {
  _registroChecklistRenderGeneration += 1;
  if (typeof document === 'undefined') return null;

  const root = document.getElementById(REGISTRO_CHECKLIST_ROOT_ID);
  if (!root?.dataset.reactRegistroChecklistMounted) return null;

  if (_registroChecklistBridge?.unmountRegistroChecklistReact) {
    _registroChecklistBridge.unmountRegistroChecklistReact(root);
    return null;
  }

  return loadRegistroChecklistBridge().then((bridge) => {
    bridge.unmountRegistroChecklistReact?.(root);
  });
}

function _updateChecklistSummary() {
  const summaryEl = document.getElementById('r-checklist-summary');
  if (!summaryEl) return;
  if (!_currentChecklist) {
    summaryEl.textContent = 'selecione o equipamento primeiro';
    return;
  }
  const s = summarizeChecklist(_currentChecklist);
  if (!s.total) {
    summaryEl.textContent = 'sem template para esse tipo';
    return;
  }
  const equip = findEquip(Utils.getVal('r-equip'));
  const periodicidade = Number(equip?.periodicidadePreventivaDias);
  const periodicidadeLabel =
    Number.isFinite(periodicidade) && periodicidade > 0
      ? `${periodicidade} dias`
      : 'periodicidade não definida';
  const tipoServico = Utils.getVal('r-tipo') || 'Serviço';
  const filled = s.ok + s.fail + s.na;
  summaryEl.textContent = `${tipoServico} · ${periodicidadeLabel} · ${filled}/${s.total} itens preenchidos`;
}

function _refreshChecklistPriBadge() {
  const pri = document.getElementById('r-checklist-pri');
  if (!pri) return;
  const isPreventiva = _isPreventivaTipo(Utils.getVal('r-tipo'));
  pri.hidden = !isPreventiva;
}

/**
 * Renderiza o checklist baseado no equip selecionado. Chamado quando
 * r-equip muda OU quando o accordion é aberto pela primeira vez.
 *
 * Estratégia: usa o snapshot existente em _currentChecklist se o
 * tipo_template corresponde — preserva marcações do user mesmo se
 * ele trocar de equip e voltar. Senão, reseta para checklist vazio.
 */
export function renderChecklist() {
  const wrapper = document.getElementById('r-checklist-details');
  const body = document.getElementById('r-checklist-body');
  if (!wrapper || !body) return;

  const equipId = Utils.getVal('r-equip');
  if (!equipId) {
    wrapper.hidden = true;
    _currentChecklist = null;
    unmountRegistroChecklist();
    _updateChecklistSummary();
    return;
  }
  const equip = findEquip(equipId);
  if (!equip) {
    wrapper.hidden = true;
    unmountRegistroChecklist();
    return;
  }

  const tpl = getChecklistTemplate(equip.tipo);
  // Preserva marcações se template é o mesmo (user trocou de equip do mesmo tipo)
  const sameTemplate = _currentChecklist && _currentChecklist.tipo_template === tpl.tipo_template;
  if (!sameTemplate) {
    _currentChecklist = buildEmptyChecklist(equip.tipo);
  }

  wrapper.hidden = false;
  _refreshChecklistPriBadge();

  mountRegistroChecklist(tpl);

  _updateChecklistSummary();
}

/** Atualiza status de um item — chamado pelo handler de click. */
export function setChecklistItemStatus(itemId, status) {
  if (!_currentChecklist) return;
  const item = _currentChecklist.items.find((i) => i.id === itemId);
  if (!item) return;
  // Toggle: clicar no mesmo status volta pra null
  item.status = item.status === status ? null : status;
  // Update DOM in place — não re-renderiza pra preservar foco em textarea
  const row = document.querySelector(`[data-item-id="${CSS.escape(itemId)}"]`);
  if (row) {
    row.querySelectorAll('.r-checklist__status').forEach((btn) => {
      const btnStatus = btn.dataset.status;
      const isActive = item.status === btnStatus;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }
  _updateChecklistSummary();
}

/** Atualiza obs de um item — chamado pelo handler de input do textarea. */
export function setChecklistItemObs(itemId, obs) {
  if (!_currentChecklist) return;
  const item = _currentChecklist.items.find((i) => i.id === itemId);
  if (item) item.obs = String(obs || '');
}

/**
 * PMOC Fase 4: atualiza medição numérica de um item measurable.
 * Vazio limpa o measure (vira null); valor numérico salva como
 * { value, unit }. Não-numéricos são ignorados (input number já
 * filtra mas defensivo aqui também).
 */
export function setChecklistItemMeasure(itemId, rawValue, unit) {
  if (!_currentChecklist) return;
  const item = _currentChecklist.items.find((i) => i.id === itemId);
  if (!item) return;
  const trimmed = String(rawValue ?? '').trim();
  if (trimmed === '') {
    item.measure = null;
    return;
  }
  // Aceita vírgula ou ponto como separador decimal (pt-BR).
  const num = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(num)) {
    item.measure = null;
    return;
  }
  item.measure = { value: num, unit: String(unit || '') };
}

/** Snapshot atual do checklist — chamado por saveRegistro. */
export function getCurrentChecklist() {
  if (!_currentChecklist) return null;
  // Só retorna se pelo menos 1 item foi marcado — checklist 100% vazio = null.
  const hasMarks = (_currentChecklist.items || []).some((i) => i.status != null);
  return hasMarks ? _currentChecklist : null;
}

/** Reset — chamado por clearRegistro. */
export function resetChecklist() {
  _currentChecklist = null;
  const body = document.getElementById('r-checklist-body');
  unmountRegistroChecklist();
  if (body) body.textContent = '';
  const wrapper = document.getElementById('r-checklist-details');
  if (wrapper) wrapper.hidden = true;
  _updateChecklistSummary();
}

/** Carrega checklist do registro existente em modo edição. */
export function loadChecklistForEdit(checklist) {
  if (!checklist || typeof checklist !== 'object') {
    _currentChecklist = null;
    return;
  }
  _currentChecklist = JSON.parse(JSON.stringify(checklist));
  renderChecklist();
}

function _bindRegistroHeaderFieldHandlers() {
  _fields.forEach((f) => {
    const i = Utils.getEl(f.id);
    if (!i || i.dataset.registroProgressBound === '1') return;
    i.dataset.registroProgressBound = '1';
    i.addEventListener('input', _updateProgressBar);
    i.addEventListener('change', _updateProgressBar);
  });

  _bindEquipChangeWarning();

  const equipSelForChecklist = Utils.getEl('r-equip');
  if (equipSelForChecklist && equipSelForChecklist.dataset.registroChecklistBound !== '1') {
    equipSelForChecklist.dataset.registroChecklistBound = '1';
    equipSelForChecklist.addEventListener('change', () => {
      renderChecklist();
      _refreshRegistroContext();
    });
  }

  const tipoSel = Utils.getEl('r-tipo');
  if (tipoSel && tipoSel.dataset.registroTipoBound !== '1') {
    tipoSel.dataset.registroTipoBound = '1';
    tipoSel.addEventListener('change', () => {
      _syncTipoCustomVisibility({ focusOnShow: true });
      _prefillObsFromTipo(tipoSel.value);
      _updateProgressBar();
      _refreshChecklistPriBadge();
    });
  }

  const tipoCustomInput = Utils.getEl('r-tipo-custom');
  if (tipoCustomInput && tipoCustomInput.dataset.registroTipoCustomBound !== '1') {
    tipoCustomInput.dataset.registroTipoCustomBound = '1';
    tipoCustomInput.addEventListener('input', _updateProgressBar);
  }
}

// ═══════════════════════════════════════════════════════
// API PÚBLICA
// ═══════════════════════════════════════════════════════

export function initRegistro(params = {}) {
  const formView = Utils.getEl('view-registro');
  if (!formView) return;

  if (params.equipId) Utils.setVal('r-equip', params.equipId);
  _currentRouteParams = { ...params };
  _refreshRegistroContext();

  withSkeleton(formView, { enabled: true, variant: 'generic', count: 3 }, () =>
    Promise.resolve(mountRegistroHeader(params)).then(() => {
      _ensureProgressBar(formView);
      _bindRegistroHeaderFieldHandlers();
      if (!formView.dataset.bound) {
        // Smart mask no campo Telefone/contato do cliente — formata (XX) XXXXX-XXXX
        // se o usuário digitar dígitos. Se digitar email/texto livre, deixa em paz.
        bindSmartContactMaskInput(Utils.getEl('r-cliente-contato'));

        formView.dataset.bound = '1';
      }
      // Garante o estado correto na entrada da view (inclusive vindo de edit).
      _syncTipoCustomVisibility();
      _updateProgressBar();
      _renderHeroSub();

      // Data padrão "Hoje agora" — UX V2 audit fix
      if (!Utils.getVal('r-data')) Utils.setVal('r-data', Utils.nowDatetime());
      _bindDatetimeUX();

      // H1: técnico padrão
      const rTecnico = Utils.getEl('r-tecnico');
      if (rTecnico && !rTecnico.value) {
        const def = Profile.getDefaultTecnico();
        if (def) rTecnico.value = def;
      }

      // ─── Datetime UX V2 (audit fix) ──────────────────────────────────────
      // Default eh "Hoje agora" (label do botao + value oculto). Click em
      // "Mudar" abre o datetime-local nativo (showPicker) e tira o estado now.
      function _bindDatetimeUX() {
        const wrap = document.getElementById('registro-datetime-wrap');
        if (!wrap || wrap.dataset.bound === '1') return;
        wrap.dataset.bound = '1';

        const input = document.getElementById('r-data');
        const nowBtn = document.getElementById('r-data-now-btn');
        const editBtn = document.getElementById('r-data-edit-btn');
        const nowLabel = document.getElementById('r-data-now-label');

        function refreshLabel() {
          if (!input || !nowLabel) return;
          const val = input.value;
          if (!val) {
            nowLabel.textContent = 'Hoje agora';
            nowBtn?.setAttribute('aria-pressed', 'true');
            return;
          }
          // Se a data eh dentro de 1min do agora, eh "Hoje agora"
          const ts = new Date(val).getTime();
          if (Math.abs(Date.now() - ts) < 60_000) {
            nowLabel.textContent = 'Hoje agora';
            nowBtn?.setAttribute('aria-pressed', 'true');
          } else {
            // Mostra "DD/MM HH:MM"
            const d = new Date(val);
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const hh = String(d.getHours()).padStart(2, '0');
            const min = String(d.getMinutes()).padStart(2, '0');
            nowLabel.textContent = `${dd}/${mm} ${hh}:${min}`;
            nowBtn?.setAttribute('aria-pressed', 'false');
          }
        }

        nowBtn?.addEventListener('click', () => {
          // Reseta pra agora
          Utils.setVal('r-data', Utils.nowDatetime());
          refreshLabel();
          _updateProgressBar();
        });

        editBtn?.addEventListener('click', () => {
          // Abre o picker nativo. Browsers modernos suportam showPicker(); fallback
          // pra focus que muitos browsers tambem abrem.
          try {
            if (typeof input.showPicker === 'function') {
              input.showPicker();
            } else {
              input.focus();
            }
          } catch (_e) {
            input.focus();
          }
        });

        input?.addEventListener('change', () => {
          refreshLabel();
          _updateProgressBar();
        });

        refreshLabel();
      }

      // Pré-preenchimento vindo de fluxo (dashboard/equipamento/alerta)
      if (!params.editRegistroId) resetEditingState();
      if (params.equipId) Utils.setVal('r-equip', params.equipId);

      _currentRouteParams = { ...params };
      _refreshRegistroContext();
      _buildRegistroReadOnlyViewModel(params);

      const rPrioridade = Utils.getEl('r-prioridade');
      if (rPrioridade && !rPrioridade.value) rPrioridade.value = 'media';

      // Hint de assinatura: Plus/Pro veem "Incluso" confirmando que a captura
      // vai rolar no save. Free vê variante upsell clicável que leva pro
      // /pricing?highlightPlan=plus. O elemento vem `hidden` do template pra
      // evitar flash de conteúdo indevido enquanto o plano ainda carrega.
      applySignatureHint();
    }),
  );
}

function applySignatureHint() {
  const signatureHint = document.getElementById('registro-signature-hint');
  if (!signatureHint) return;

  const isPlusOrHigher = isCachedPlanPlusOrHigher();
  signatureHint.hidden = false;

  // Limpa handler anterior antes de remontar conteúdo.
  signatureHint.onclick = null;
  signatureHint.classList.remove('registro-sig-hint--upsell');
  signatureHint.removeAttribute('role');
  signatureHint.removeAttribute('tabindex');

  if (isPlusOrHigher) {
    signatureHint.innerHTML = `
      <span class="registro-sig-hint__ic" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 19l7-7 3 3-7 7-3-3z"/>
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
          <path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>
        </svg>
      </span>
      <div class="registro-sig-hint__body">
        <div class="registro-sig-hint__head">
          <strong class="registro-sig-hint__title">Assinatura do cliente</strong>
          <span class="registro-sig-hint__badge">Incluso</span>
        </div>
        <p class="registro-sig-hint__desc">
          Ao salvar, solicitamos a rubrica do cliente —
          fica anexada ao registro e aparece no PDF oficial do serviço.
        </p>
      </div>`;
    return;
  }

  // Variante Free: upsell clicável. Botão aninhado pra ter semântica correta
  // (o container não pode ser <button> porque já está dentro de um form).
  signatureHint.classList.add('registro-sig-hint--upsell');
  signatureHint.innerHTML = `
    <span class="registro-sig-hint__ic registro-sig-hint__ic--upsell" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="11" width="16" height="10" rx="2"/>
        <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
      </svg>
    </span>
    <div class="registro-sig-hint__body">
      <div class="registro-sig-hint__head">
        <strong class="registro-sig-hint__title">Assinatura do cliente no PDF</strong>
        <span class="registro-sig-hint__badge registro-sig-hint__badge--plus">Plus</span>
      </div>
      <p class="registro-sig-hint__desc">
        Feche o serviço com a rubrica do cliente diretamente no app —
        recurso do plano Plus.
      </p>
    </div>
    <button type="button" class="registro-sig-hint__cta"
      data-action="signature-upsell-cta">
      Conhecer Plus →
    </button>`;

  const cta = signatureHint.querySelector('[data-action="signature-upsell-cta"]');
  cta?.addEventListener('click', () => {
    trackEvent('signature_upsell_clicked', { source: 'registro_form' });
    goTo('pricing', { highlightPlan: 'plus' });
  });
}

export function applyQuickTemplate(templateId, triggerEl = null) {
  const template = QUICK_TEMPLATE_MAP[templateId];
  if (!template) return;

  // ─── Pre-fill agressivo (UX V2 audit) ──────────────────────────────────
  // Antes preenchia tipo, obs, prioridade, data. Agora tambem preenche
  // status=ok (assume que ficou operando), e foca o proximo campo vazio.
  Utils.setVal('r-tipo', template.tipo);
  _syncTipoCustomVisibility();
  if (!Utils.getVal('r-obs').trim()) Utils.setVal('r-obs', template.descricao);
  Utils.setVal('r-prioridade', template.prioridade);
  Utils.setVal('r-data', Utils.nowDatetime());
  // Default status "Operando normalmente" — 80% dos casos preventivos
  if (!Utils.getVal('r-status')) Utils.setVal('r-status', 'ok');
  if (!Utils.getVal('r-tecnico')) {
    const def = Profile.getDefaultTecnico();
    if (def) Utils.setVal('r-tecnico', def);
  }

  // Marca chip ativo
  const quickRoot = document.querySelector('.registro-quick');
  if (quickRoot) {
    const chips = quickRoot.querySelectorAll('[data-action="quick-service-template"]');
    const active =
      triggerEl && triggerEl.closest('[data-action="quick-service-template"]')
        ? triggerEl.closest('[data-action="quick-service-template"]')
        : quickRoot.querySelector(`[data-template="${templateId}"]`);
    chips.forEach((chip) => {
      const isActive = chip === active;
      chip.classList.toggle('is-active', isActive);
      chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  _updateProgressBar();

  // ─── Smart focus + feedback contextual ────────────────────────────────
  // Identifica o proximo required vazio e foca nele. Toast diz exatamente
  // o que falta — em vez do generico "revise e salve".
  const requiredOrder = [
    { id: 'r-equip', label: 'equipamento' },
    { id: 'r-tecnico', label: 'tecnico' },
  ];
  const nextEmpty = requiredOrder.find((f) => !Utils.getVal(f.id));
  if (nextEmpty) {
    const el = Utils.getEl(nextEmpty.id);
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    Toast.success(`Modelo aplicado. Falta so o ${nextEmpty.label} pra finalizar.`);
  } else {
    // Tudo pronto pra salvar — foca no botao primario
    const saveBtn = document.querySelector('[data-action="save-registro"]');
    if (saveBtn) saveBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    Toast.success('Modelo aplicado. Toque em Salvar serviço pra finalizar.');
  }
}

export async function saveRegistro({ andShare = false } = {}) {
  const prioridade = Utils.getVal('r-prioridade') || 'media';
  const { equipamentos } = getState();

  // Quando o tipo é "Outro", combinamos com o label livre → "Outro · {custom}".
  // Validamos o custom ANTES de mandar pra validateRegistroPayload porque o
  // validador trata tipo como um blob só e não sabe sobre o campo auxiliar.
  let tipoForPayload = Utils.getVal('r-tipo');
  if (tipoForPayload === 'Outro') {
    const custom = Utils.getVal('r-tipo-custom').trim();
    if (!custom) {
      Toast.warning('Descreva o serviço no campo "Qual serviço?" pra continuar.');
      Utils.getEl('r-tipo-custom')?.focus();
      return false;
    }
    if (custom.length > TIPO_CUSTOM_MAX) {
      Toast.warning(`A descricao do serviço passa do limite de ${TIPO_CUSTOM_MAX} caracteres.`);
      Utils.getEl('r-tipo-custom')?.focus();
      return false;
    }
    tipoForPayload = `${TIPO_OUTRO_PREFIX}${custom}`;
  }

  const payloadValidation = validateRegistroPayload(
    {
      equipId: Utils.getVal('r-equip'),
      data: Utils.getVal('r-data'),
      tipo: tipoForPayload,
      obs: Utils.getVal('r-obs'),
      tecnico: Utils.getVal('r-tecnico'),
      status: Utils.getVal('r-status'),
      pecas: Utils.getVal('r-pecas'),
      proxima: Utils.getVal('r-proxima'),
      custoPecas: Utils.getVal('r-custo-pecas'),
      custoMaoObra: Utils.getVal('r-custo-mao-obra'),
      clienteNome: Utils.getVal('r-cliente-nome'),
      clienteDocumento: Utils.getVal('r-cliente-documento'),
      localAtendimento: Utils.getVal('r-local-atendimento'),
      clienteContato: Utils.getVal('r-cliente-contato'),
    },
    { existingEquipamentos: equipamentos },
  );

  if (!payloadValidation.valid) {
    Toast.warning(payloadValidation.errors[0]);
    return false;
  }

  const {
    equipId,
    data,
    tipo,
    tecnico,
    obs,
    pecas,
    proxima,
    status,
    custoPecas,
    custoMaoObra,
    clienteNome,
    clienteDocumento,
    localAtendimento,
    clienteContato,
  } = payloadValidation.value;

  const descricaoFinal =
    obs && obs.length >= 10 ? obs : `Serviço de ${tipo.toLowerCase()} registrado em modo rapido.`;

  const validation = validateOperationalPayload({ data, status });
  if (!validation.valid) {
    Toast.error(validation.errors[0]);
    return false;
  }

  // PMOC Fase 3.E: warning soft-required quando preventiva sem checklist.
  // Não bloqueia o save (técnico pode estar em campo, sem tempo); apenas avisa
  // pra ele saber que esse registro NÃO entra no PMOC formal completo.
  if (_isPreventivaTipo(tipo)) {
    const cl = getCurrentChecklist();
    if (!cl) {
      Toast.warning(
        'Sem checklist NBR. Recomendado para PMOC formal — você pode preencher antes de salvar.',
      );
    } else {
      const validationCl = validateChecklist(cl);
      if (!validationCl.complete && validationCl.missing?.length) {
        const first = validationCl.missing[0];
        const rest = validationCl.missing.length - 1;
        const msg =
          rest > 0
            ? `${validationCl.missing.length} itens obrigatórios pendentes (ex: "${first}"). Salvando mesmo assim.`
            : `1 item obrigatório pendente: "${first}". Salvando mesmo assim.`;
        Toast.warning(msg);
      }
    }
  }

  Profile.saveLastTecnico(tecnico);

  // UX V2 audit fix #81: auto-default tecnico no Profile apos primeiro
  // registro. Se o user nao tem nome no perfil ainda (ex.: pulou
  // onboarding), assumimos o nome do tecnico do registro recem-salvo como
  // o nome dele. Salva apenas o campo .nome — outros campos (empresa,
  // CNPJ) ficam pra ele preencher em /conta. Idempotente: nao sobrescreve
  // perfil ja preenchido.
  try {
    const currentProfile = Profile.get() || {};
    if (!currentProfile.nome && tecnico) {
      Profile.save({ ...currentProfile, nome: tecnico });
    }
  } catch (_err) {
    /* storage off — nao bloqueia o save do registro */
  }

  // Modo edição — atualiza registro existente
  const editingId = sessionStorage.getItem(EDITING_KEY);
  if (editingId) {
    setState((prev) => {
      const previousRegistro = prev.registros.find((r) => r.id === editingId) || null;
      const updatedRegistros = prev.registros.map((r) =>
        r.id === editingId
          ? {
              ...r,
              equipId,
              data,
              tipo,
              obs: descricaoFinal,
              tecnico,
              prioridade,
              status,
              pecas,
              proxima,
              custoPecas,
              custoMaoObra,
              clienteNome,
              clienteDocumento,
              localAtendimento,
              clienteContato,
              // PMOC Fase 3: preserva checklist; null se user limpou tudo.
              checklist: getCurrentChecklist() || r.checklist || null,
            }
          : r,
      );

      const updatedRegistro = updatedRegistros.find((r) => r.id === editingId) || null;
      const updatedEquipamentos = reconcileEquipmentStatusesAfterRegistroEdit({
        equipamentos: prev.equipamentos,
        registros: updatedRegistros,
        previousRegistro,
        updatedRegistro,
      });

      return {
        ...prev,
        registros: updatedRegistros,
        equipamentos: updatedEquipamentos,
      };
    });
    _saveLastClient({ clienteNome, clienteDocumento, localAtendimento, clienteContato });
    resetEditingState();
    clearRegistro();
    Toast.success('Registro atualizado.');
    goTo('historico');
    return true;
  }

  // Modo criação — continua fluxo normal
  const novoId = Utils.uid();
  let fotosRegistro = [...Photos.pending];

  // D1: assinatura digital — recurso exclusivo Plus+ (diferencial pago).
  // Para Free, pulamos silenciosamente o modal para não interromper o fluxo.
  let assinatura = null;
  // Reference do Storage quando upload OK; null quando offline ou plano Free.
  // Shape: { version, provider, bucket, path, url, urlExpiresAt, ... }
  let signatureReference = null;
  const canUseSignature = isCachedPlanPlusOrHigher();
  let SignatureModal;
  let saveSignatureForRecord;
  if (canUseSignature) {
    try {
      ({ SignatureModal, saveSignatureForRecord } = await import('../components/signature.js'));
    } catch (error) {
      handleError(error, {
        code: ErrorCodes.NETWORK_ERROR,
        severity: 'warning',
        message: 'Não foi possível carregar o módulo de assinatura.',
        context: { action: 'registro.saveRegistro.signatureImport' },
      });
    }
  }
  const eq = findEquip(equipId);
  if (canUseSignature && SignatureModal?.request) {
    try {
      const result = await SignatureModal.request(novoId, eq?.nome || 'Equipamento');
      // UX: a assinatura é opcional. Cancelar o modal (X/backdrop/Escape) não
      // invalida mais o save — o técnico pode ter o cliente assinando depois
      // ou o serviço foi concluído sem cliente presente. Apenas não anexa
      // assinatura ao registro. Se aparecer um valor (data URL), usamos.
      if (result && result !== SignatureModal.CANCELED && isSafeSignatureCaptureDataUrl(result)) {
        assinatura = result;
        if (saveSignatureForRecord) {
          try {
            // Upload pro Storage (async). Retorna reference object ou null
            // se offline/falha — nesse caso a captura fica na queue
            // `cooltrack-sig-pending-upload` pra sync posterior.
            signatureReference = await saveSignatureForRecord(novoId, assinatura);
            if (!signatureReference) {
              Toast.info?.('Assinatura salva no dispositivo. Será sincronizada quando conectar.');
            }
          } catch (uploadError) {
            // Falha inesperada — mantém flag local, queue já foi populada
            // dentro do saveSignatureForRecord. Não bloqueia save do registro.
            handleError(uploadError, {
              code: ErrorCodes.SYNC_FAILED,
              severity: 'warning',
              message: 'Assinatura ficou salva localmente. Tentaremos sincronizar depois.',
              context: { action: 'registro.saveRegistro.signatureUpload', registroId: novoId },
            });
          }
        }
      } else if (result && result !== SignatureModal.CANCELED) {
        Toast.warning?.('Assinatura ignorada por conter dados inválidos.');
      } else if (result === SignatureModal.CANCELED) {
        Toast.info?.('Registro salvo sem assinatura. Você pode adicioná-la depois.');
      }
    } catch (error) {
      handleError(error, {
        code: ErrorCodes.VALIDATION_ERROR,
        severity: 'warning',
        message: 'Não foi possível registrar a assinatura digital.',
        context: { action: 'registro.saveRegistro.signatureRequest', registroId: novoId },
      });
    }
  }

  if (fotosRegistro.length > 0) {
    try {
      const uploadResult = await uploadPendingPhotos(fotosRegistro, { recordId: novoId });
      fotosRegistro = uploadResult.photos;
      if (uploadResult.failedCount > 0) {
        Toast.warning(
          'Algumas fotos não puderam ser enviadas para a nuvem e ficaram salvas localmente.',
        );
      }
    } catch (error) {
      handleError(error, {
        code: ErrorCodes.SYNC_FAILED,
        severity: 'warning',
        message: 'Falha no upload das fotos. O registro será salvo com fallback local.',
        context: { action: 'registro.saveRegistro.photoUpload', registroId: novoId },
      });
    }
  }

  const operationalStatus = getOperationalStatus({
    status,
    lastStatus: status,
    ultimoRegistro: { status },
  });

  setState((prev) => {
    const currentTecs = prev.tecnicos || [];
    const updatedTecs =
      tecnico && !currentTecs.includes(tecnico) ? [...currentTecs, tecnico] : currentTecs;
    return {
      ...prev,
      tecnicos: updatedTecs,
      registros: [
        ...prev.registros,
        {
          id: novoId,
          equipId,
          data,
          tipo,
          obs: descricaoFinal,
          status,
          pecas,
          proxima,
          fotos: fotosRegistro,
          tecnico,
          prioridade,
          custoPecas,
          custoMaoObra,
          clienteNome,
          clienteDocumento,
          localAtendimento,
          clienteContato,
          // Prefer reference do Storage (cross-device). Se upload falhou e
          // ficou só no localStorage, grava `true` pra indicar "tem
          // assinatura" — queue reconcile troca pelo reference depois.
          assinatura: signatureReference || (assinatura ? true : false),
          // PMOC Fase 3: checklist NBR (null se não preenchido).
          checklist: getCurrentChecklist(),
        },
      ],
      equipamentos: prev.equipamentos.map((e) => {
        if (e.id !== equipId) return e;
        return {
          ...e,
          status:
            operationalStatus.uiStatus === 'unknown'
              ? e.status || 'ok'
              : operationalStatus.uiStatus,
          statusDescricao: operationalStatus.label,
        };
      }),
    };
  });

  SavedHighlight.markForHighlight(novoId);
  _saveLastClient({ clienteNome, clienteDocumento, localAtendimento, clienteContato });
  clearRegistro();

  // UX V2 audit fix #80: "Salvar e enviar pro cliente" — quando o user
  // dispara o botao primário verde, pulamos o toast com escolhas e ja
  // disparamos o share do WhatsApp diretamente. 4 cliques → 1.
  if (andShare && equipId) {
    Toast.success('Serviço salvo. Abrindo WhatsApp...');
    try {
      const filters = { equipId, registroId: novoId };
      const ok = await shareWhatsAppFlow({ filters });
      // Se share falhou/cancelado, cai pro fallback indo pra /relatorio.
      // Sem mostrar toast extra — shareWhatsAppFlow ja exibe feedback.
      if (!ok) {
        goTo('relatorio', { equipId, intent: 'whatsapp', registroId: novoId });
      }
    } catch (_error) {
      // Erro inesperado — leva pro relatorio com intent pra user retentar.
      goTo('relatorio', { equipId, intent: 'whatsapp', registroId: novoId });
    }
    return true;
  }

  // Feedback pós-save padrão (botao "Só salvar" / fluxo legado): toast rico
  // com CTAs PDF/WhatsApp. Os CTAs executam ações diretas mantendo as
  // mesmas regras de quota/validação do fluxo de relatório.
  const eqForToast = equipamentos.find((e) => e.id === equipId) || null;
  const toastShown = PostSaveRegistroToast.show({
    equipId,
    registroId: novoId,
    equipName: eqForToast?.nome || null,
    onAction: async ({ destination, equipId: targetEquipId, registroId }) => {
      const filters = { equipId: targetEquipId, registroId };
      if (destination === 'pdf') return exportPdfFlow({ filters });
      return shareWhatsAppFlow({ filters });
    },
    onFallback: ({ destination, equipId: targetEquipId, registroId }) => {
      goTo('relatorio', {
        equipId: targetEquipId,
        intent: destination,
        ...(registroId ? { registroId } : {}),
      });
    },
  });
  // Fallback: se não tinha equipId (edge case) ou o toast recusou renderizar,
  // volta pro feedback simples — user ainda precisa saber que salvou.
  if (!toastShown) {
    Toast.success('Serviço registrado com sucesso.');
  }

  return true;
}

export function clearRegistro(preserveEquip = false) {
  const toClear = [
    'r-tipo',
    'r-tipo-custom',
    'r-pecas',
    'r-obs',
    'r-proxima',
    'r-tecnico',
    'r-custo-pecas',
    'r-custo-mao-obra',
    'r-prioridade',
    'r-cliente-nome',
    'r-cliente-documento',
    'r-local-atendimento',
    'r-cliente-contato',
  ];
  if (!preserveEquip) toClear.push('r-equip');
  Utils.clearVals(...toClear);
  resetEditingState();
  Utils.setVal('r-status', 'ok');
  Utils.setVal('r-prioridade', 'media');
  Utils.setVal('r-data', Utils.nowDatetime());
  Photos.clear();

  // Garante que o campo custom volte a ficar oculto junto com o reset do tipo.
  _syncTipoCustomVisibility();

  // Reseta o meter do hero pra empty sem remover o markup (ele é estático no
  // template agora, diferente da v5 que injetava dinamicamente).
  _updateProgressBar();

  // Reset do estado ativo dos chips de ação rápida — "Recomeçar" deve zerar
  // a seleção visual pra não sugerir um template que já não se aplica ao
  // novo registro em branco.
  document
    .querySelectorAll('.registro-quick [data-action="quick-service-template"]')
    .forEach((chip) => {
      chip.classList.remove('is-active');
      chip.setAttribute('aria-pressed', 'false');
    });

  // PMOC Fase 3: reset do state do checklist (impede vazar marcações
  // de um registro pra outro quando o user clica "Recomeçar").
  resetChecklist();

  const rTecnico = Utils.getEl('r-tecnico');
  if (rTecnico) rTecnico.value = Profile.getDefaultTecnico();

  // Auto-prefill do último cliente — técnico que atende o mesmo cliente em
  // sequência (ex.: manutenção de várias unidades no mesmo prédio) não precisa
  // redigitar. O usuário pode apagar os campos se for para outro cliente.
  const lastClient = _loadLastClient();
  if (lastClient) {
    if (lastClient.clienteNome) Utils.setVal('r-cliente-nome', lastClient.clienteNome);
    if (lastClient.clienteDocumento)
      Utils.setVal('r-cliente-documento', lastClient.clienteDocumento);
    if (lastClient.localAtendimento)
      Utils.setVal('r-local-atendimento', lastClient.localAtendimento);
    if (lastClient.clienteContato) Utils.setVal('r-cliente-contato', lastClient.clienteContato);
  }

  const saveBtn = document.querySelector('[data-action="save-registro"]');
  if (saveBtn) {
    // Preserva o SVG do ícone (o redesign v6 colocou svg + span no botão).
    // Alterar textContent aqui mataria o ícone — por isso só mexemos no span.
    const saveLabel = saveBtn.querySelector('span');
    if (saveLabel) saveLabel.textContent = 'Salvar serviço';
    else saveBtn.textContent = 'Salvar serviço';
    saveBtn.classList.remove('btn--editing');
  }

  // Hero do redesign v6: pill texto volta pra "Novo registro" quando saímos
  // do modo edição. Mantém também o fallback pro legado .section-title.
  const heroPill = document.getElementById(HERO_PILL_TEXT_ID);
  if (heroPill) heroPill.textContent = 'Novo registro';
  const title = document.querySelector('#view-registro .section-title');
  if (title) title.textContent = 'O que foi feito hoje?';
  _refreshRegistroContext();
}
export function loadRegistroForEdit(id) {
  const { registros } = getState();
  const r = registros.find((r) => r.id === id);
  if (!r) return;

  sessionStorage.setItem(EDITING_KEY, id);
  const formViewEdit = Utils.getEl('view-registro');
  if (formViewEdit) formViewEdit.dataset.editMode = '1';

  // Instala guard que bloqueia navegacao pra outra aba sem confirmar
  // descarte. Limpado em resetEditingState (save / clear / descarte aprovado).
  setRouteGuard(_confirmLeaveEditingGuard);

  Utils.setVal('r-equip', r.equipId);
  Utils.setVal('r-data', r.data);

  // Se o tipo foi salvo com prefixo "Outro · ", separamos de volta em select=Outro
  // + input custom. Caso contrário, repopulamos normalmente e deixamos o wrap
  // escondido. O _syncTipoCustomVisibility no initRegistro finaliza o estado.
  if (typeof r.tipo === 'string' && r.tipo.startsWith(TIPO_OUTRO_PREFIX)) {
    Utils.setVal('r-tipo', 'Outro');
    Utils.setVal('r-tipo-custom', r.tipo.slice(TIPO_OUTRO_PREFIX.length));
  } else {
    Utils.setVal('r-tipo', r.tipo);
    Utils.setVal('r-tipo-custom', '');
  }
  _syncTipoCustomVisibility();

  Utils.setVal('r-obs', r.obs);
  Utils.setVal('r-tecnico', r.tecnico || '');
  Utils.setVal('r-status', r.status);
  Utils.setVal('r-cliente-nome', r.clienteNome || '');
  Utils.setVal('r-cliente-documento', r.clienteDocumento || '');
  Utils.setVal('r-local-atendimento', r.localAtendimento || '');
  Utils.setVal('r-cliente-contato', r.clienteContato || '');

  // PMOC Fase 3: carrega checklist se existe; senão renderiza vazio
  // baseado no tipo do equip.
  if (r.checklist && typeof r.checklist === 'object') {
    loadChecklistForEdit(r.checklist);
  } else {
    renderChecklist();
  }

  const btn = document.querySelector('[data-action="save-registro"]');
  if (btn) {
    // Mantém o SVG do ícone intocado — só troca o rótulo interno.
    const label = btn.querySelector('span');
    if (label) label.textContent = 'Salvar alterações';
    else btn.textContent = 'Salvar alterações';
    btn.classList.add('btn--editing');
  }

  // No redesign v6 o hero tem a pill "Novo registro"; no modo edição trocamos
  // pra "Editando serviço". O .section-title legado é mantido como fallback.
  const heroPill = document.getElementById(HERO_PILL_TEXT_ID);
  if (heroPill) heroPill.textContent = 'Editando serviço';
  const title = document.querySelector('#view-registro .section-title');
  if (title) title.textContent = 'Editar serviço';
  _refreshRegistroContext();
}

// Garante que estado de edição não persista entre sessoes do app.
// pagehide cobre tanto fechamento de aba quanto navegacao pra outro
// site (mais robusto que beforeunload em mobile / Safari).
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    try {
      sessionStorage.removeItem(EDITING_KEY);
    } catch (_err) {
      /* sessionStorage indisponivel — ignora */
    }
  });
}
