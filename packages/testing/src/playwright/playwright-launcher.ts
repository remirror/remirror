import { Config } from '@jest/types';
import { setup, teardown } from 'jest-process-manager';
import onExit from 'signal-exit';

import { server } from './playwright-server.config';

const { globalSetup, globalTeardown } = require('jest-playwright-preset');

let serverSetupPromise: Promise<void> | undefined;

export const destroyServer = async (globalConfig?: Config.GlobalConfig) => {
  if (server.environment !== 'playwright') {
    return;
  }

  console.log('destroying the server');
  serverSetupPromise = undefined;
  await teardown();
  await globalTeardown(globalConfig);
};

export const setupServer = async (globalConfig: Config.GlobalConfig) => {
  if (server.environment !== 'playwright') {
    return;
  }

  console.log('setting up server');
  await setup([server.config]);

  onExit(() => {
    destroyServer().then(() => {
      console.log('destroying server');
      process.exit();
    });
  });

  console.log('global setup');
  await globalSetup(globalConfig);
};

export const startServer = (globalConfig: Config.GlobalConfig) => {
  if (serverSetupPromise) {
    return serverSetupPromise;
  }

  serverSetupPromise = setupServer(globalConfig);
  return serverSetupPromise;
};
