/* eslint-disable @typescript-eslint/no-var-requires */
import { Config } from '@jest/types';
import { setup, teardown } from 'jest-dev-server';
import onExit from 'signal-exit';

const {
  server: { server },
} = require('./server.config');

const { teardown: teardownPuppeteer } = require('jest-environment-puppeteer');
const { setup: setupPuppeteer } = require('jest-environment-puppeteer');

let serverSetupPromise: Promise<void> | undefined;

export const destroyServer = async (globalConfig?: Config.GlobalConfig) => {
  serverSetupPromise = undefined;
  await teardown();
  await teardownPuppeteer(globalConfig);
};

export const setupServer = async (globalConfig: Config.GlobalConfig) => {
  await setup([server]);

  onExit(() => {
    destroyServer().then(() => {
      process.exit();
    });
  });

  await setupPuppeteer(globalConfig);
};

export const startServer = (globalConfig: Config.GlobalConfig) => {
  if (serverSetupPromise) {
    return serverSetupPromise;
  } else {
    serverSetupPromise = setupServer(globalConfig);
    return serverSetupPromise;
  }
};
