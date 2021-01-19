import type { Config } from '@jest/types';
import { destroyServer } from 'testing/playwright';

export default async (globalConfig: Config.GlobalConfig) => {
  if (!globalConfig.watchAll && !globalConfig.watch) {
    await destroyServer(globalConfig);
  }
};
