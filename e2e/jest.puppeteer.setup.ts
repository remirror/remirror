import { Config } from '@jest/types';
import { startServer } from './puppeteer';

export default async (globalConfig: Config.GlobalConfig) => {
  await startServer(globalConfig);
};
