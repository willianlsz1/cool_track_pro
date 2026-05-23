import { describe, expect, it } from 'vitest';

import { APP_V2_DATA_PORT_METHODS } from './appV2DataPort';
import type { AppV2DataPort } from './appV2DataPort';

describe('AppV2DataPort', () => {
  it('documents the minimum mutation surface planned for app-v2 persistence', () => {
    const requiredMethods: Array<keyof AppV2DataPort> = [
      'loadSnapshot',
      'saveEquipment',
      'saveClient',
      'saveSector',
      'deleteSector',
      'archiveEquipment',
      'unarchiveEquipment',
      'saveEquipmentAttachment',
      'scheduleCommitment',
      'startServiceFromEquipment',
      'completeService',
      'updateServiceRecord',
      'createQuoteFromServiceRecord',
      'createPreServiceQuote',
      'updateQuoteDraft',
    ];

    expect(APP_V2_DATA_PORT_METHODS).toEqual(requiredMethods);
  });
});
