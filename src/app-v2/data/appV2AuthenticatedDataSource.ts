import type { AppV2ClientesReader } from './appV2ClientesReadOnlyDataAdapter';
import type { AppV2ClientesWriter } from './appV2ClientesWriteDataAdapter';
import { createAppV2DataSource, type AppV2DataSource } from './appV2DataSourceFactory';
import type { AppV2EquipamentosReader } from './appV2EquipamentosReadOnlyDataAdapter';
import type { AppV2EquipamentosWriter } from './appV2EquipamentosWriteDataAdapter';
import type { AppV2MockSnapshot } from './appV2MockStore';
import type { AppV2SessionReader } from './appV2SessionReader';

export interface CreateAuthenticatedAppV2DataSourceInput {
  initialSnapshot?: AppV2MockSnapshot;
  sessionReader: AppV2SessionReader;
  clientesReader?: AppV2ClientesReader;
  clientesWriter?: AppV2ClientesWriter;
  equipamentosReader?: AppV2EquipamentosReader;
  equipamentosWriter?: AppV2EquipamentosWriter;
}

export async function createAuthenticatedAppV2DataSource({
  initialSnapshot,
  sessionReader,
  clientesReader,
  clientesWriter,
  equipamentosReader,
  equipamentosWriter,
}: CreateAuthenticatedAppV2DataSourceInput): Promise<AppV2DataSource> {
  const user = await getUserOrNull(sessionReader);
  const userId = String(user?.id ?? '').trim();

  return createAppV2DataSource({
    initialSnapshot,
    session: userId ? { userId } : null,
    clientesReader,
    clientesWriter,
    equipamentosReader,
    equipamentosWriter,
  });
}

async function getUserOrNull(sessionReader: AppV2SessionReader) {
  try {
    return await sessionReader.getCurrentUser();
  } catch (_error) {
    return null;
  }
}
