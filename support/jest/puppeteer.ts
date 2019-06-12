import { Config } from '@jest/types';
import { JestDevServerOptions, setup, teardown } from 'jest-dev-server';
import onExit from 'signal-exit';

const { teardown: teardownPuppeteer } = require('jest-environment-puppeteer');

const { setup: setupPuppeteer } = require('jest-environment-puppeteer');
const { PUPPETEER_SERVERS } = process.env;

type Server = 'next' | 'storybook' | 'docz';

const servers: Server[] = (PUPPETEER_SERVERS
  ? PUPPETEER_SERVERS.split(',')
  : ['next', 'storybook', 'docz']) as any;

const serverConfig: Record<Server, JestDevServerOptions> = {
  storybook: {
    command: 'yarn storybook:ci',
    port: 3002,
    usedPortAction: 'kill',
    launchTimeout: 60000,
  },
  next: {
    command: 'yarn next:ci',
    port: 3001,
    usedPortAction: 'kill',
    launchTimeout: 60000,
  },
  docz: {
    command: 'yarn dev:docs',
    port: 3000,
    usedPortAction: 'kill',
    launchTimeout: 60000,
  },
};

let serverSetupPromise: Promise<void> | undefined;

export async function setupServer(globalConfig: Config.GlobalConfig) {
  await setup(servers.map(server => serverConfig[server]));

  onExit(() =>
    Promise.all([teardown(), teardownPuppeteer()]).then(() => {
      process.exit();
    }),
  );

  await setupPuppeteer(globalConfig);
}

export async function startServer(globalConfig: Config.GlobalConfig) {
  if (serverSetupPromise) {
    return serverSetupPromise;
  } else {
    serverSetupPromise = setupServer(globalConfig);
    return serverSetupPromise;
  }
}
export async function destroyServer(globalConfig: Config.GlobalConfig) {
  serverSetupPromise = undefined;
  await teardown();
  await teardownPuppeteer(globalConfig);
}
