import { Config } from '@jest/types';
import { SupportedServers } from '@test-fixtures/test-links';
import { JestDevServerOptions, setup, teardown } from 'jest-dev-server';
import onExit from 'signal-exit';

const { teardown: teardownPuppeteer } = require('jest-environment-puppeteer');
const { setup: setupPuppeteer } = require('jest-environment-puppeteer');
const { PUPPETEER_SERVERS } = process.env;
const __SERVERS__: SupportedServers[] = PUPPETEER_SERVERS
  ? (PUPPETEER_SERVERS.split(',') as SupportedServers[])
  : ['next', 'docz', 'storybook'];

const serverConfig: Record<SupportedServers, JestDevServerOptions> = {
  next: {
    command: 'yarn with:next',
    port: 3001,
    usedPortAction: 'kill',
    launchTimeout: 120000,
  },
  storybook: {
    command: 'yarn storybook:test',
    port: 3002,
    usedPortAction: 'kill',
    launchTimeout: 120000,
  },
  docz: {
    command: 'yarn docs',
    port: 3003,
    usedPortAction: 'kill',
    launchTimeout: 120000,
  },
};

let serverSetupPromise: Promise<void> | undefined;

export async function setupServer(globalConfig: Config.GlobalConfig) {
  await setup(__SERVERS__.map(server => serverConfig[server]));

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
