import type { Config } from '@jest/types';
import { startServer } from 'testing/playwright';

export default async (globalConfig: Config.GlobalConfig) => {
  await startServer(globalConfig);
};
