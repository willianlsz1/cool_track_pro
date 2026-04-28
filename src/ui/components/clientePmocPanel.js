import { Utils } from '../../core/utils.js';
import { attachDialogA11y } from '../../core/modal.js';
import { goTo } from '../../core/router.js';
import { buildClientePmocDetails } from '../../core/clientePmoc.js';

const OVERLAY_ID = 'cliente-pmoc-overlay';
let _cleanup = null;

function statusClass(status) {
  if (status === 'em_dia') return 'cliente-pmoc__status--ok';
  if (status === 'atencao') return 'cliente-pmoc__status--warn';
  if (status === 'atrasado') return 'cliente-pmoc__status--danger';
  return 'cliente-pmoc__status--muted';
}

function equipStatusClass(status) {
  if (status === 'em_dia') return 'cliente-pmoc__equip-status--ok';
  if (status === 'vencido') return 'cliente-pmoc__equip-status--danger';
  return 'cliente-pmoc__equip-status--warn';
}

function needsActionText(summary) {
  if (!summary.equipamentosResumo.length)
    return 'Sem equipamentos cadastrados. Cadastre o primeiro equipamento para montar o PMOC.';
  const vencidos = summary.equipamentosResumo.filter((item) => item.status === 'vencido').length;
  const semRegistro = summary.equipamentosResumo.filter(
    (item) => item.status === 'sem_registro',
  ).length;
  if (vencidos > 0)
    return `Você tem ${vencidos} equipamento${vencidos > 1 ? 's' : ''} vencido${vencidos > 1 ? 's' : ''}. Registre o serviço agora.`;
  if (semRegistro > 0)
    return `${semRegistro} equipamento${semRegistro > 1 ? 's' : ''} ainda sem primeiro serviço. Registre para iniciar o cronograma.`;
  return 'Tudo dentro do prazo. Continue registrando os serviços para manter o PMOC em dia.';
}

function buildHtml(summary) {
  const equipamentos = summary.equipamentosResumo
    .map((item) => {
      const setor = item.setorLabel
        ? `<span>Setor/local: ${Utils.escapeHtml(item.setorLabel)}</span>`
        : '';
      const ultimo = item.ultimoServico ? Utils.formatDate(item.ultimoServico) : 'Sem registro';
      const proxima = item.proximaManutencao
        ? Utils.formatDate(item.proximaManutencao)
        : 'Sem data prevista';
      const cta =
        item.status === 'vencido' || item.status === 'sem_registro'
          ? `<button type="button" class="cliente-pmoc__cta" data-pmoc-action="register" data-equip-id="${Utils.escapeAttr(item.equipamento.id)}">Registrar serviço</button>`
          : '';
      return `<article class="cliente-pmoc__equip">
        <header class="cliente-pmoc__equip-head">
          <strong>${Utils.escapeHtml(item.nome)}</strong>
          <span class="cliente-pmoc__equip-status ${equipStatusClass(item.status)}">${Utils.escapeHtml(item.statusLabel)}</span>
        </header>
        <div class="cliente-pmoc__equip-meta">
          ${setor}
          <span>Periodicidade: ${Utils.escapeHtml(item.periodicidadeLabel)}</span>
          <span>Último serviço: ${Utils.escapeHtml(ultimo)}</span>
          <span>Próxima manutenção: ${Utils.escapeHtml(proxima)}</span>
        </div>
        ${cta}
      </article>`;
    })
    .join('');

  return `
    <div class="modal cliente-pmoc">
      <header class="cliente-pmoc__head">
        <div>
          <h2 id="cliente-pmoc-title">PMOC do cliente</h2>
          <p>${Utils.escapeHtml(summary.cliente?.nome || 'Cliente')}</p>
        </div>
        <button type="button" class="cliente-pmoc__close" data-pmoc-action="close" aria-label="Fechar">✕</button>
      </header>
      <section class="cliente-pmoc__now">
        <strong>O que precisa ser feito agora</strong>
        <p>${Utils.escapeHtml(needsActionText(summary))}</p>
      </section>
      <section class="cliente-pmoc__summary">
        <span>Ano PMOC: <strong>${summary.year}</strong></span>
        <span>Status geral: <strong class="cliente-pmoc__status ${statusClass(summary.status)}">${Utils.escapeHtml(summary.statusLabel)}</strong></span>
        <span>Progresso: <strong>${summary.progresso.feitos}/${summary.progresso.previstos}</strong></span>
        <span>Última atualização: <strong>${Utils.escapeHtml(summary.ultimaAtualizacaoLabel)}</strong></span>
      </section>
      <section class="cliente-pmoc__list" aria-label="Lista de equipamentos PMOC">
        ${equipamentos || '<p class="cliente-pmoc__empty">Nenhum equipamento vinculado a este cliente.</p>'}
      </section>
      <footer class="cliente-pmoc__footer">
        <button type="button" class="btn btn--outline" data-pmoc-action="close">Fechar</button>
        <button type="button" class="btn btn--primary" data-action="open-pmoc-modal" data-cliente-id="${Utils.escapeAttr(summary.cliente?.id || '')}">Gerar documento PMOC</button>
      </footer>
    </div>`;
}

function close() {
  const overlay = document.getElementById(OVERLAY_ID);
  if (_cleanup) {
    _cleanup();
    _cleanup = null;
  }
  overlay?.remove();
}

function open({ cliente, equipamentos = [], registros = [], setores = [] }) {
  close();
  const summary = buildClientePmocDetails({ cliente, equipamentos, registros, setores });
  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.className = 'modal-overlay is-open cliente-pmoc-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'cliente-pmoc-title');
  overlay.innerHTML = buildHtml(summary);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (event) => {
    const actionEl = event.target.closest('[data-pmoc-action], [data-action="open-pmoc-modal"]');
    if (event.target === overlay) {
      close();
      return;
    }
    if (!actionEl) return;
    const action = actionEl.dataset.pmocAction;
    if (action === 'close') {
      close();
      return;
    }
    if (action === 'register') {
      const equipId = actionEl.getAttribute('data-equip-id');
      close();
      goTo('registro', { equipId });
    }
  });

  _cleanup = attachDialogA11y(overlay, { onDismiss: close });
}

export const ClientePmocPanel = { open, close };
