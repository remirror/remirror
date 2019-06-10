import { Config } from '@jest/types';
import { teardown as teardownDevServer } from 'jest-dev-server';

const { teardown: teardownPuppeteer } = require('jest-environment-puppeteer');

export default async function globalTeardown(globalConfig: Config.GlobalConfig) {
  await teardownDevServer();
  await teardownPuppeteer(globalConfig);
}
