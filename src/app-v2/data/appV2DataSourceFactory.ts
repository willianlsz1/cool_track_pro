import { createAppV2MockSnapshot } from './appV2MockStore';
import type { AppV2MockSnapshot } from './appV2MockStore';
import type { AppV2DataPort } from './appV2DataPort';
import { createAppV2ClientesReadOnlyDataAdapter } from './appV2ClientesReadOnlyDataAdapter';
import type { AppV2ClientesReader } from './appV2ClientesReadOnlyDataAdapter';
import {
  createAppV2EquipamentosReadOnlyDataAdapter,
  type AppV2EquipamentosReader,
} from './appV2EquipamentosReadOnlyDataAdapter';
import { createAppV2ClientesWriteDataAdapter } from './appV2ClientesWriteDataAdapter';
import type { AppV2ClientesWriter } from './appV2ClientesWriteDataAdapter';
import { createAppV2EquipamentosWriteDataAdapter } from './appV2EquipamentosWriteDataAdapter';
import type { AppV2EquipamentosWriter } from './appV2EquipamentosWriteDataAdapter';
import { createMemoryAppV2DataAdapter } from './memoryAppV2DataAdapter';

export type AppV2DataSourceMode = 'local' | 'clientes-readonly' | 'clientes-readwrite';

export type AppV2DataSourceFallbackReason = 'missing-session' | 'missing-clientes-reader';

export interface AppV2DataSourceSession {
  userId?: string | null;
}

export interface CreateAppV2DataSourceInput {
  initialSnapshot?: AppV2MockSnapshot;
  session?: AppV2DataSourceSession | null;
  clientesReader?: AppV2ClientesReader;
  clientesWriter?: AppV2ClientesWriter;
  equipamentosReader?: AppV2EquipamentosReader;
  equipamentosWriter?: AppV2EquipamentosWriter;
}

export interface AppV2DataSource {
  dataPort: AppV2DataPort;
  mode: AppV2DataSourceMode;
  reason?: AppV2DataSourceFallbackReason;
}

export function createAppV2DataSource({
  initialSnapshot = createAppV2MockSnapshot(),
  session,
  clientesReader,
  clientesWriter,
  equipamentosReader,
  equipamentosWriter,
}: CreateAppV2DataSourceInput = {}): AppV2DataSource {
  const basePort = createMemoryAppV2DataAdapter(initialSnapshot);
  const userId = String(session?.userId ?? '').trim();

  if (!userId) {
    return {
      dataPort: basePort,
      mode: 'local',
      reason: 'missing-session',
    };
  }

  if (!clientesReader) {
    return {
      dataPort: basePort,
      mode: 'local',
      reason: 'missing-clientes-reader',
    };
  }

  const clientesReadPort = createAppV2ClientesReadOnlyDataAdapter({
    basePort,
    userId,
    clientesReader,
  });

  const readOnlyPort = equipamentosReader
    ? createAppV2EquipamentosReadOnlyDataAdapter({
        basePort: clientesReadPort,
        userId,
        equipamentosReader,
      })
    : clientesReadPort;

  if (!clientesWriter) {
    return {
      dataPort: readOnlyPort,
      mode: 'clientes-readonly',
    };
  }

  const readWritePort = createAppV2ClientesWriteDataAdapter({
    basePort: readOnlyPort,
    userId,
    clientesWriter,
  });

  return {
    dataPort: createAppV2EquipamentosWriteDataAdapter({
      basePort: readWritePort,
      userId,
      equipamentosWriter,
    }),
    mode: 'clientes-readwrite',
  };
}
