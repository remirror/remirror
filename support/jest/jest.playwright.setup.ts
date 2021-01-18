import { Config } from '@jest/types';
import { startServer } from 'testing/e2e';

export default async (globalConfig: Config.GlobalConfig) => {
  await startServer(globalConfig);
};
