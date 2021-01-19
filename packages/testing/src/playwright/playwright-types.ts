import { Circus } from '@jest/types';
import { JestProcessManagerOptions } from 'jest-process-manager';

export type TestEnvironment = 'playwright' | 'detox' | 'appium' | 'spectron';
export type TestServerName = 'next' | 'docs' | 'storybook-react';
export type PlaywrightBrowserName = 'firefox' | 'chromium' | 'webkit';

interface BaseTestServer {
  environment: TestEnvironment;
  testMatch: string[];
  url: string;
  name: string;
}

interface PlaywrightTestServer extends BaseTestServer {
  environment: 'playwright';
  config: JestProcessManagerOptions;
  name: TestServerName;
}

interface SpectronTestServer extends BaseTestServer {
  environment: 'spectron';
}

export type TestServer = PlaywrightTestServer | SpectronTestServer;

/**
 * Declare the globals used throughout tests
 */
declare global {
  const jestCircus: {
    currentTest: NonNullable<Circus.State['currentlyRunningTest']>;
    currentTestName: string;
  };

  /**
   * The active server.
   */
  const __SERVER__: TestServer;

  namespace NodeJS {
    interface ProcessEnv {
      E2E_BROWSER?: PlaywrightBrowserName;
      E2E_MODE?: 'development' | 'production';
      E2E_SERVER?: TestServerName;
      E2E_ENVIRONMENT?: TestEnvironment;
      E2E_DEBUG?: string;
      E2E_COVERAGE?: string;
      /**
       * When set only run the most basic of tests.
       */
      E2E_BASIC?: string;
    }
  }
}
