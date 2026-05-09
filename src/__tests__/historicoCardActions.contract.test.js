import { act } from 'react';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';

import { mountHistoricoTimelineReact } from '../react/entrypoints/historicoTimelineIsland.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setRoot() {
  document.body.innerHTML = `
    <main id="view-historico">
      <section id="timeline"></section>
    </main>
  `;
  return document.getElementById('timeline');
}

function createTimelineItem(overrides = {}) {
  return {
    id: 'reg-card-1',
    equipId: 'eq-card-1',
    isLatest: true,
    status: 'ok',
    headerDateLabel: '09:30',
    headPills: [{ id: 'type', label: 'Preventiva', color: 'cyan' }],
    serviceTitle: 'Preventiva mensal',
    equipmentName: 'Split Recepcao',
    setorName: 'Loja',
    setorTag: 'LOJA',
    context: 'Cliente Alpha - Loja - Split Recepcao',
    obs: 'Troca de filtros',
    meta: [{ id: 'tecnico', icon: 'user', text: 'Ana' }],
    photoUrls: ['https://cdn.example/foto-1.jpg'],
    signature: {
      url: 'data:image/png;base64,assinatura',
      ariaLabel: 'Ver assinatura de Cliente Alpha',
      alt: 'Assinatura registrada pelo cliente',
    },
    showFilterEquip: true,
    checklist: {
      tipo_template: 'pmoc',
      items: [{ id: 'limpeza-filtro', label: 'Limpeza dos filtros', checked: true }],
    },
    ...overrides,
  };
}

function createTimelineViewModel(item = createTimelineItem()) {
  return {
    operationSummary: { totalServicosHoje: 1, totalEquipHoje: 1 },
    attentionItems: [],
    emptyState: null,
    groups: [
      {
        id: 'hoje',
        label: 'Hoje',
        countLabel: '1 servico',
        items: [item],
      },
    ],
  };
}

async function renderTimeline(item) {
  const root = setRoot();
  await act(async () => {
    mountHistoricoTimelineReact(root, { viewModel: createTimelineViewModel(item) });
  });
  return root;
}

function expectCardActionsContract(root, registroId) {
  expect(root.querySelector(`.timeline__item[data-reg-id="${registroId}"]`)).not.toBeNull();
  expect(root.querySelector(`[data-action="edit-reg"][data-id="${registroId}"]`)).not.toBeNull();
  expect(root.querySelector(`[data-action="delete-reg"][data-id="${registroId}"]`)).not.toBeNull();
  expect(
    root.querySelector(`[data-action="export-pdf"][data-registro-id="${registroId}"]`),
  ).not.toBeNull();
  expect(
    root.querySelector(`[data-action="whatsapp-export"][data-registro-id="${registroId}"]`),
  ).not.toBeNull();
}

describe('Historico card actions contract', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders edit/delete and PDF/WhatsApp actions with the same registro id', async () => {
    const root = await renderTimeline(createTimelineItem());
    const registroId = 'reg-card-1';

    expectCardActionsContract(root, registroId);
    expect(root.querySelector('.card-actions')).not.toBeNull();
    expect(
      root.querySelector(`[data-hist-action="toggle-card-menu"][data-id="${registroId}"]`),
    ).not.toBeNull();
  });

  it('keeps card actions when optional media, signature and checklist data are absent', async () => {
    const root = await renderTimeline(
      createTimelineItem({
        id: 'reg-minimal',
        equipId: 'eq-minimal',
        context: '',
        obs: '',
        meta: [],
        photoUrls: [],
        signature: null,
        checklist: null,
        showFilterEquip: false,
      }),
    );

    expectCardActionsContract(root, 'reg-minimal');
  });

  it('keeps source-level consumers aligned with public action attributes', () => {
    const timelineSource = readFileSync('src/react/pages/HistoricoTimeline.jsx', 'utf8');
    const cardActionsSource = readFileSync('src/react/components/CardActions.jsx', 'utf8');
    const navigationHandlersSource = readFileSync(
      'src/ui/controller/handlers/navigationHandlers.js',
      'utf8',
    );
    const registroHandlersSource = readFileSync(
      'src/ui/controller/handlers/registroHandlers.js',
      'utf8',
    );
    const reportExportHandlersSource = readFileSync(
      'src/ui/controller/handlers/reportExportHandlers.js',
      'utf8',
    );

    expect(timelineSource).toContain('data-action={HISTORICO_ACTIONS.editReg}');
    expect(timelineSource).toContain('data-action={HISTORICO_ACTIONS.deleteReg}');
    expect(timelineSource).toContain('data-id={item.id}');
    expect(timelineSource).toContain('<CardActions registroId={item.id} />');

    expect(cardActionsSource).toContain('data-action="export-pdf"');
    expect(cardActionsSource).toContain('data-action="whatsapp-export"');
    expect(cardActionsSource).toContain('data-registro-id={registroId}');

    expect(navigationHandlersSource).toContain("on('edit-reg'");
    expect(navigationHandlersSource).toMatch(/editRegistroId:\s*el\.dataset\.id/);
    expect(registroHandlersSource).toContain("on('delete-reg'");
    expect(registroHandlersSource).toMatch(/deleteReg\(el\.dataset\.id\)/);
    expect(reportExportHandlersSource).toContain('triggerEl?.dataset?.registroId');
  });
});
