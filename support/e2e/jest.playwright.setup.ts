import type { Config } from '@jest/types';

import { startServer } from './playwright';

export default async (globalConfig: Config.GlobalConfig) => {
  await startServer(globalConfig);
};
