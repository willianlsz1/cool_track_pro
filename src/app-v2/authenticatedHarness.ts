import {
  createAuthenticatedAppV2DataSource,
  type CreateAuthenticatedAppV2DataSourceInput,
} from './data/appV2AuthenticatedDataSource';
import type { AppV2DataSource } from './data/appV2DataSourceFactory';
import { mountAppV2, type AppV2MountHandle } from './index';

export interface AuthenticatedAppV2MountHandle extends AppV2MountHandle {
  dataSource: AppV2DataSource;
}

export type AuthenticatedAppV2MountOptions = CreateAuthenticatedAppV2DataSourceInput;

export async function mountAuthenticatedAppV2(
  root: HTMLElement,
  options: AuthenticatedAppV2MountOptions,
): Promise<AuthenticatedAppV2MountHandle> {
  const dataSource = await createAuthenticatedAppV2DataSource(options);
  const mountHandle = mountAppV2(root, { dataPort: dataSource.dataPort });

  return {
    dataSource,
    unmount: mountHandle.unmount,
  };
}
