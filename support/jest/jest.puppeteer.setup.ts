import { Config } from '@jest/types';
import { JestDevServerOptions, setup as setupDevServer } from 'jest-dev-server';

const { setup: setupPuppeteer } = require('jest-environment-puppeteer');
const { STORYBOOK_ONLY } = process.env;

export default async function globalSetup(globalConfig: Config.GlobalConfig) {
  const servers: JestDevServerOptions[] = [
    {
      command: 'yarn storybook:ci',
      port: 3002,
      usedPortAction: 'kill',
      launchTimeout: 60000,
    },
  ];
  if (!STORYBOOK_ONLY) {
    servers.push(
      {
        command: 'yarn next:ci',
        port: 3001,
        usedPortAction: 'kill',
        launchTimeout: 60000,
      },
      {
        command: 'yarn dev:docs',
        port: 3000,
        usedPortAction: 'kill',
        launchTimeout: 60000,
      },
    );
  }
  await setupDevServer(servers);

  await setupPuppeteer(globalConfig);
}
