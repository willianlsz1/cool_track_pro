import { appV2MockData, type AppV2MockData } from './appV2MockData';

export { appV2MockData };
export type AppV2MockSnapshot = AppV2MockData;

export function createAppV2MockSnapshot(overrides: Partial<AppV2MockData> = {}): AppV2MockSnapshot {
  return {
    today: overrides.today ?? appV2MockData.today,
    clientes: cloneList(overrides.clientes ?? appV2MockData.clientes),
    equipamentos: cloneList(overrides.equipamentos ?? appV2MockData.equipamentos),
    compromissos: cloneList(overrides.compromissos ?? appV2MockData.compromissos),
    registros: cloneList(overrides.registros ?? appV2MockData.registros),
    orcamentos: cloneList(overrides.orcamentos ?? appV2MockData.orcamentos),
  };
}

function cloneList<T extends object>(items: T[]): T[] {
  return items.map((item) => ({ ...item }));
}
