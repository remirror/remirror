import type { Config } from '@jest/types';
import { setup, teardown } from 'jest-dev-server';
import onExit from 'signal-exit';

const {
  server: { server },
} = require('./server.config');

const { globalSetup, globalTeardown } = require('jest-playwright-preset');

let serverSetupPromise: Promise<void> | undefined;

export const destroyServer = async (globalConfig?: Config.GlobalConfig) => {
  serverSetupPromise = undefined;
  await teardown();
  await globalTeardown(globalConfig);
};

export const setupServer = async (globalConfig: Config.GlobalConfig) => {
  await setup([server]);

  onExit(() => {
    destroyServer().then(() => {
      process.exit();
    });
  });

  await globalSetup(globalConfig);
};

export const startServer = (globalConfig: Config.GlobalConfig) => {
  if (serverSetupPromise) {
    return serverSetupPromise;
  }

  serverSetupPromise = setupServer(globalConfig);
  return serverSetupPromise;
};
