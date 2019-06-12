import { Config } from '@jest/types';
import { destroyServer } from './puppeteer';

export default async function globalTeardown(globalConfig: Config.GlobalConfig) {
  await destroyServer(globalConfig);
}
