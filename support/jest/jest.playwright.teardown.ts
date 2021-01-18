import { Config } from '@jest/types';
import { destroyServer } from 'testing/e2e';

export default async (globalConfig: Config.GlobalConfig) => {
  if (!globalConfig.watchAll && !globalConfig.watch) {
    await destroyServer(globalConfig);
  }
};
