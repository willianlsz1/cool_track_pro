/**
 * @vitest-environment jsdom
 *
 * Testes pros viewModel builders e options stripper.
 *
 * `buildEquipamentoListCardModel` chama `regsForEquip` (state) +
 * `getEquipmentVisualMeta` etc. Mockamos essas dependências pra rodar
 * em isolamento. As funções não leem state module-level próprio — só
 * chamam imports — então mock cobre tudo.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  _stripRenderInternalOptions,
  buildReactListEmptyState,
} from '../../ui/views/equipamentos/utils/viewModels.js';

describe('utils/viewModels', () => {
  describe('_stripRenderInternalOptions', () => {
    it('remove __skipPlanRefresh mantendo o resto', () => {
      const result = _stripRenderInternalOptions({
        clienteId: 'c-1',
        statusFilter: 'criticos',
        __skipPlanRefresh: true,
      });
      expect(result).toEqual({ clienteId: 'c-1', statusFilter: 'criticos' });
    });

    it('retorna objeto vazio quando recebe undefined', () => {
      expect(_stripRenderInternalOptions(undefined)).toEqual({});
    });

    it('retorna objeto vazio quando recebe null', () => {
      expect(_stripRenderInternalOptions(null)).toEqual({});
    });

    it('preserva options sem __skipPlanRefresh inalterado', () => {
      const input = { clienteId: 'c-1', clienteNome: 'X' };
      const result = _stripRenderInternalOptions(input);
      expect(result).toEqual(input);
      // Confere que é cópia (não muta o input)
      expect(result).not.toBe(input);
    });
  });

  describe('buildReactListEmptyState', () => {
    it('caminho feliz com emptyCopy custom + isPro', () => {
      const result = buildReactListEmptyState(
        {
          title: 'Sem equipamentos',
          description: 'Crie um pra começar',
          cta: { label: '+ Criar', action: 'open-modal', id: 'modal-add-eq' },
        },
        { isPro: true, filterClienteId: null },
      );
      expect(result.icon).toBe('🔧');
      expect(result.title).toBe('Sem equipamentos');
      expect(result.cta.label).toBe('+ Criar');
      expect(result.cta.action).toBe('open-modal');
      expect(result.proHint).toBe(true);
    });

    it('usa fallback quando emptyCopy é null', () => {
      const result = buildReactListEmptyState(null, {});
      expect(result.title).toBe('Nenhum equipamento encontrado');
      expect(result.cta.action).toBe('open-modal');
      expect(result.cta.id).toBe('modal-add-eq');
    });

    it('detecta CTA "eq-add-for-cliente" e troca o icon', () => {
      const result = buildReactListEmptyState(
        {
          title: 'Crie pra cliente',
          description: 'd',
          cta: { label: '+ Add', action: 'eq-add-for-cliente', id: 'c-1' },
        },
        {},
      );
      expect(result.icon).toBe('👥');
    });

    it('proHint=false quando filterClienteId está setado (mesmo com isPro)', () => {
      const result = buildReactListEmptyState(null, { isPro: true, filterClienteId: 'c-1' });
      expect(result.proHint).toBe(false);
    });

    it('proHint=false quando isPro é false', () => {
      const result = buildReactListEmptyState(null, { isPro: false, filterClienteId: null });
      expect(result.proHint).toBe(false);
    });
  });

  describe('buildEquipamentoListCardModel + buildReactListViewModel (smoke)', () => {
    // Essas funções chamam `regsForEquip`, `calculateHealthScore`,
    // `getEquipmentVisualMeta`, etc. Em vez de mockar 10+ módulos,
    // fazemos um teste smoke garantindo que o módulo é carregável e
    // exporta as funções esperadas. Coverage real virá via E2E + view tests.
    let viewModels;

    beforeEach(async () => {
      vi.resetModules();
      // Mocks mínimos pras dependências externas
      vi.doMock('../../core/state.js', () => ({
        regsForEquip: () => [],
        getState: () => ({ equipamentos: [], registros: [], setores: [], clientes: [] }),
        findEquip: () => null,
        findSetor: () => null,
        setState: () => {},
      }));
      vi.doMock('../../core/utils.js', () => ({
        Utils: {
          safeStatus: (s) => s || 'ok',
          escapeHtml: (s) => String(s),
          escapeAttr: (s) => String(s),
          daysDiff: () => 0,
        },
      }));
      vi.doMock('../../domain/maintenance.js', () => ({
        calculateHealthScore: () => 100,
        getHealthClass: () => 'good',
      }));
      vi.doMock('../../domain/suggestedAction.js', () => ({
        ACTION_CODE: { NONE: 'NONE', MONITOR: 'MONITOR', COLLECT_DATA: 'COLLECT_DATA' },
      }));
      vi.doMock('../../ui/views/equipamentos/constants.js', () => ({
        PRIORIDADE_LABEL: { media: 'Média', alta: 'Alta' },
        RISK_CLASS_LABEL: { baixo: 'Baixo' },
        STATUS_OPERACIONAL: { ok: 'OK', danger: 'Crítico' },
      }));
      vi.doMock('../../ui/views/equipamentos/helpers.js', () => ({
        classifyRiskFactor: () => 'neutral',
        componentPillModel: () => null,
        ctaLabelForAction: () => 'Continuar',
        preventiveTimelineModel: () => null,
        recencia: () => 'há 1 dia',
      }));
      vi.doMock('../../ui/components/equipmentVisual.js', () => ({
        getEquipmentVisualMeta: () => ({ icon: '❄️' }),
      }));
      viewModels = await import('../../ui/views/equipamentos/utils/viewModels.js');
    });

    afterEach(() => {
      vi.resetModules();
      vi.doUnmock('../../core/state.js');
      vi.doUnmock('../../core/utils.js');
    });

    it('buildEquipamentoListCardModel devolve objeto com campos esperados', () => {
      const evalCtx = {
        getRegs: () => [],
        getMaintenanceContext: () => ({ ultimoRegistro: null, proximaPreventiva: null }),
        getRisk: () => ({ classification: 'baixo', score: 10, factors: [] }),
        getSuggestedAction: () => ({ actionCode: 'NONE', actionLabel: '' }),
        isFullyIdle: () => false,
      };
      const eq = { id: 'eq-1', nome: 'Split A', status: 'ok', criticidade: 'media' };
      const card = viewModels.buildEquipamentoListCardModel(eq, evalCtx);
      expect(card.id).toBe('eq-1');
      expect(card.name).toBe('Split A');
      expect(card.statusClass).toBe('ok');
      expect(card.statusLabel).toBe('Estável');
      expect(card.risk.classification).toBe('baixo');
      expect(card.eqRegsCount).toBe(0);
    });

    it('buildReactListViewModel agrega cards + emptyState corretamente', () => {
      const evalCtx = {
        getRegs: () => [],
        getMaintenanceContext: () => ({ ultimoRegistro: null }),
        getRisk: () => ({ classification: 'baixo', score: 0, factors: [] }),
        getSuggestedAction: () => ({ actionCode: 'NONE', actionLabel: '' }),
        isFullyIdle: () => false,
      };
      const viewModel = {
        sortedItems: [{ id: 'eq-1', nome: 'A', status: 'ok' }],
        idleItems: [],
        activeItems: [{ id: 'eq-1' }],
        quickMove: null,
        emptyState: null,
      };
      const result = viewModels.buildReactListViewModel(viewModel, {
        evalCtx,
        clusterActive: false,
        filterClienteId: null,
        isPro: false,
      });
      expect(result.cards).toHaveLength(1);
      expect(result.activeCards).toHaveLength(1);
      expect(result.idleCards).toHaveLength(0);
      expect(result.emptyState).toBeNull();
    });

    it('buildReactListViewModel emite emptyState quando não há cards', () => {
      const evalCtx = {
        getRegs: () => [],
        getMaintenanceContext: () => ({ ultimoRegistro: null }),
        getRisk: () => ({ classification: 'baixo', score: 0, factors: [] }),
        getSuggestedAction: () => ({ actionCode: 'NONE', actionLabel: '' }),
        isFullyIdle: () => false,
      };
      const viewModel = {
        sortedItems: [],
        idleItems: [],
        activeItems: [],
        quickMove: null,
        emptyState: null,
      };
      const result = viewModels.buildReactListViewModel(viewModel, {
        evalCtx,
        clusterActive: false,
        filterClienteId: null,
        isPro: false,
      });
      expect(result.cards).toHaveLength(0);
      expect(result.emptyState).not.toBeNull();
      expect(result.emptyState.title).toBe('Nenhum equipamento encontrado');
    });
  });
});
