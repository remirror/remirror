import { Config } from '@jest/types';
import { setup, teardown } from 'jest-dev-server';
import onExit from 'signal-exit';

const {
  server: { server },
} = require('./server.config');

const { teardown: teardownPuppeteer } = require('jest-environment-puppeteer');
const { setup: setupPuppeteer } = require('jest-environment-puppeteer');

let serverSetupPromise: Promise<void> | undefined;

export async function setupServer(globalConfig: Config.GlobalConfig) {
  await setup([server]);

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
