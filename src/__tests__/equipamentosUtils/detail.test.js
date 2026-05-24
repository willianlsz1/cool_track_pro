/**
 * @vitest-environment jsdom
 *
 * Testes pras 3 funções HTML helpers do detail modal de equipamento.
 * Pure functions — entrada/saída strings HTML escapadas.
 */
import { describe, expect, it } from 'vitest';

import {
  _eqDetailSubtitle,
  _infoRowValueOrEmpty,
  _riskFactorChipHtml,
} from '../../ui/views/equipamentos/utils/detail.js';

describe('utils/detail', () => {
  describe('_eqDetailSubtitle', () => {
    it('combina local e tag em uma linha quando ambos existem', () => {
      const result = _eqDetailSubtitle({ local: 'Sala 101', tag: 'AC-001' });
      expect(result).toContain('Sala 101');
      expect(result).toContain('AC-001');
      expect(result).toContain('eq-detail-title-block__tag');
      expect(result).toContain(' · ');
    });

    it('retorna só local quando tag está vazia', () => {
      const result = _eqDetailSubtitle({ local: 'Sala 101', tag: '' });
      expect(result).toBe('Sala 101');
    });

    it('retorna só tag (em span) quando local está ausente', () => {
      const result = _eqDetailSubtitle({ tag: 'AC-001' });
      expect(result).toContain('AC-001');
      expect(result).toContain('eq-detail-title-block__tag');
      expect(result).not.toContain(' · ');
    });

    it('retorna string vazia quando ambos faltam', () => {
      expect(_eqDetailSubtitle({})).toBe('');
    });

    it('escapa HTML perigoso no local e na tag', () => {
      const result = _eqDetailSubtitle({
        local: '<script>alert(1)</script>',
        tag: '<img onerror=x>',
      });
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('<img onerror');
      expect(result).toContain('&lt;script&gt;');
    });
  });

  describe('_infoRowValueOrEmpty', () => {
    it('renderiza span com valor quando preenchido', () => {
      const result = _infoRowValueOrEmpty('Bosch', 'Adicionar marca', 'eq-1');
      expect(result).toContain('<span class="info-row__value">Bosch</span>');
      expect(result).not.toContain('data-action="edit-equip"');
    });

    it('renderiza CTA "Adicionar X" quando valor vazio', () => {
      const result = _infoRowValueOrEmpty('', 'Adicionar marca', 'eq-1');
      expect(result).toContain('Adicionar marca');
      expect(result).toContain('data-action="edit-equip"');
      expect(result).toContain('data-id="eq-1"');
      expect(result).toContain('info-row__value--add');
    });

    it('aplica variant mono no valor preenchido', () => {
      const result = _infoRowValueOrEmpty('SN-12345', 'Adicionar serial', 'eq-1', 'mono');
      expect(result).toContain('info-row__value--mono');
    });

    it('inclui data-focus-field quando fieldKey passado e valor vazio', () => {
      const result = _infoRowValueOrEmpty('', 'Adicionar tag', 'eq-1', '', 'tag');
      expect(result).toContain('data-focus-field="tag"');
    });

    it('escapa addLabel e value perigosos', () => {
      const filledResult = _infoRowValueOrEmpty('<b>x</b>', 'Add', 'eq-1');
      expect(filledResult).toContain('&lt;b&gt;');
      const emptyResult = _infoRowValueOrEmpty('', '<b>label</b>', 'eq-1');
      expect(emptyResult).toContain('&lt;b&gt;');
    });
  });

  describe('_riskFactorChipHtml', () => {
    it('renderiza chip neutro pra factor sem palavra-chave', () => {
      const result = _riskFactorChipHtml('rotina estável', 'eq-1');
      expect(result).toContain('eq-risk-panel__factor');
      expect(result).not.toContain('data-action');
      expect(result).not.toContain('actionable');
    });

    it('renderiza CTA "Agendar" pra "sem agenda"', () => {
      const result = _riskFactorChipHtml('preventiva sem agenda', 'eq-1');
      expect(result).toContain('data-action="edit-equip"');
      expect(result).toContain('Agendar');
      expect(result).toContain('data-focus-field="periodicidade"');
    });

    it('renderiza CTA "Registrar" pra "vencida"', () => {
      const result = _riskFactorChipHtml('preventiva vencida há 30 dias', 'eq-1');
      expect(result).toContain('data-action="go-register-equip"');
      expect(result).toContain('Registrar');
      expect(result).not.toContain('data-focus-field');
    });

    it('renderiza CTA "Ajustar" pra criticidade alta', () => {
      const result = _riskFactorChipHtml('criticidade alta detectada', 'eq-1');
      expect(result).toContain('data-action="edit-equip"');
      expect(result).toContain('Ajustar');
      expect(result).toContain('data-focus-field="criticidade"');
    });

    it('lida com factor vazio retornando chip vazio', () => {
      const result = _riskFactorChipHtml('', 'eq-1');
      expect(result).toContain('eq-risk-panel__factor');
    });

    it('escapa HTML do factor', () => {
      const result = _riskFactorChipHtml('<script>x</script>', 'eq-1');
      expect(result).not.toContain('<script>x');
      expect(result).toContain('&lt;script&gt;');
    });
  });
});
