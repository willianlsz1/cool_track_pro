import { Utils } from '../../../core/utils.js';
import { PDF_COLORS as C, STATUS_CLIENTE } from '../constants.js';
import { formatStatusConclusion, sanitizePublicText } from '../sanitizers.js';
import { formatDadosPlacaRows } from '../../dadosPlacaDisplay.js';

function countByStatus(registros, status) {
  return registros.filter((registro) => registro.status === status).length;
}

function listEquipamentosUnicos(filtered, equipamentos) {
  return [
    ...new Map(
      filtered.map((registro) => {
        const equipamento = equipamentos.find((item) => item.id === registro.equipId);
        return [registro.equipId, { eq: equipamento, lastRegistro: registro }];
      }),
    ).values(),
  ].filter((item) => item.eq);
}

function listPendencias(filtered) {
  return filtered.filter((registro) => {
    if (registro.status === 'danger') return true;
    if (registro.proxima && Utils.daysDiff(registro.proxima) <= 30) return true;
    return false;
  });
}

export function buildCoverPeriodText(de, ate) {
  return de || ate
    ? `Período ${de ? Utils.formatDate(de) : 'início'} – ${ate ? Utils.formatDate(ate) : 'atual'}`
    : '';
}

export function buildCoverContext({
  doc,
  pageWidth,
  pageHeight,
  margin,
  profile,
  de,
  ate,
  filtered,
  equipamentos,
  context = {},
}) {
  return {
    doc,
    pageWidth,
    pageHeight,
    margin,
    profile,
    de,
    ate,
    filtered,
    equipamentos,
    context,
    cliente: context.cliente,
    periodoTexto: buildCoverPeriodText(de, ate),
  };
}

export function buildCoverTitleModel({ context, profile, cliente, periodoTexto }) {
  return {
    osNumber: context.osNumber,
    emitido: context.emitido || new Date().toLocaleDateString('pt-BR'),
    clienteNome: cliente?.nome ? sanitizePublicText(cliente.nome, '') : '',
    tecnicoNome: profile?.nome?.trim() || 'Técnico',
    periodoTexto,
  };
}

export function buildCoverInfoBlocksModel(profile, cliente) {
  const hasPmocData =
    !!(profile?.cnpj || profile?.inscricao_estadual || profile?.inscricao_municipal) ||
    !!(cliente?.cnpj || cliente?.ie || cliente?.im);
  const blockH = hasPmocData ? 42 : 30;
  const cnpjLine = profile?.cnpj?.trim();
  const ieLine = profile?.inscricao_estadual?.trim();
  const imLine = profile?.inscricao_municipal?.trim();
  const inscricoes = [ieLine && `IE ${ieLine}`, imLine && `IM ${imLine}`]
    .filter(Boolean)
    .join('  ·  ');

  const tecnicoLines = [
    { value: profile?.nome?.trim() || 'Técnico', bold: true, size: 11 },
    {
      value: profile?.razao_social?.trim() || profile?.empresa?.trim() || '',
      size: 8.5,
      color: C.text2,
    },
    { value: cnpjLine ? `CNPJ ${cnpjLine}` : '', size: 8, color: C.text3 },
    { value: inscricoes, size: 7.5, color: C.text3 },
    { value: profile?.telefone?.trim() || '', size: 8, color: C.text3 },
  ];

  const clienteLines = cliente
    ? [
        {
          value: sanitizePublicText(cliente.nome, 'Não informado'),
          bold: true,
          size: 11,
        },
        {
          value: sanitizePublicText(cliente.documento, 'Não informado'),
          size: 8,
          color: C.text3,
        },
        {
          value: sanitizePublicText(cliente.local, 'Não informado'),
          size: 8.5,
          color: C.text2,
        },
        {
          value: sanitizePublicText(cliente.contato, 'Não informado'),
          size: 8,
          color: C.text3,
        },
      ]
    : [{ value: 'Não informado', size: 9, color: C.text3, italic: true }];

  return { blockH, tecnicoLines, clienteLines };
}

export function buildCoverResumoModel(filtered, equipamentos) {
  const totalServicos = filtered.length;
  const warn = countByStatus(filtered, 'warn');
  const danger = countByStatus(filtered, 'danger');
  const equipCount = listEquipamentosUnicos(filtered, equipamentos).length;
  const statusLabel = danger
    ? 'Fora de operação'
    : warn
      ? 'Requer atenção'
      : totalServicos > 0
        ? 'OK'
        : '—';
  const statusColor = danger ? C.red : warn ? C.amber : totalServicos > 0 ? C.green : C.text3;

  return { totalServicos, equipCount, statusLabel, statusColor };
}

export function buildCoverEquipamentosRows(filtered, equipamentos) {
  return listEquipamentosUnicos(filtered, equipamentos).map(({ eq, lastRegistro }) => {
    const st = STATUS_CLIENTE[lastRegistro.status] || STATUS_CLIENTE.ok;
    const ultimo = lastRegistro.data ? Utils.formatDate(lastRegistro.data) : '—';
    const proxima = lastRegistro.proxima ? Utils.formatDate(lastRegistro.proxima) : '—';
    // V3 refator: nome trunca em 32 chars + "…" pra evitar wrap feio.
    // Cliente prefere overflow controlado a duas linhas estouradas.
    const nomeBruto = eq.nome || '—';
    const nome = nomeBruto.length > 32 ? `${nomeBruto.slice(0, 31)}…` : nomeBruto;
    const localBruto = eq.local || '—';
    const local = localBruto.length > 28 ? `${localBruto.slice(0, 27)}…` : localBruto;
    return {
      tag: eq.codigo || eq.tag || '—',
      nome,
      local,
      ultimo,
      proxima,
      statusLabel: st.label,
      statusColor: st.color,
      statusKey: lastRegistro.status || 'ok',
    };
  });
}

export function buildCoverConclusaoModel(filtered) {
  const ok = countByStatus(filtered, 'ok');
  const warn = countByStatus(filtered, 'warn');
  const danger = countByStatus(filtered, 'danger');

  return { conclusion: formatStatusConclusion({ ok, warn, danger }) };
}

export function buildCoverFichaTecnicaBlocks(filtered, equipamentos) {
  return listEquipamentosUnicos(filtered, equipamentos)
    .map(({ eq }) => {
      const allRows = formatDadosPlacaRows(eq.dadosPlaca);
      return {
        eq,
        fixedRows: allRows.filter((r) => !r.extra),
        extraRows: allRows.filter((r) => r.extra),
      };
    })
    .filter((block) => block.fixedRows.length > 0 || block.extraRows.length > 0);
}

export function buildCoverPendenciasModel(filtered, equipamentos) {
  return listPendencias(filtered).map((registro) => {
    const equipamento = equipamentos.find((item) => item.id === registro.equipId);
    const isUrgent = registro.status === 'danger';
    return {
      equipamento,
      cor: isUrgent ? C.red : C.amber,
      acao: isUrgent
        ? 'Requer intervenção imediata'
        : `Preventiva recomendada${registro.proxima ? ` até ${Utils.formatDate(registro.proxima)}` : ''}`,
    };
  });
}
