import { Config } from '@jest/types';
import { setup as setupDevServer } from 'jest-dev-server';

const { setup: setupPuppeteer } = require('jest-environment-puppeteer');

export default async function globalSetup(globalConfig: Config.GlobalConfig) {
  await setupDevServer([
    {
      command: 'yarn storybook:ci',
      port: 6007,
      usedPortAction: 'kill',
      launchTimeout: 60000,
    },
    {
      command: 'yarn next:ci',
      port: 3001,
      usedPortAction: 'kill',
      launchTimeout: 60000,
    },
  ]);

  await setupPuppeteer(globalConfig);
}
