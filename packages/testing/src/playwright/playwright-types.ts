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
      REMIRROR_E2E_BROWSER?: PlaywrightBrowserName;
      REMIRROR_E2E_MODE?: 'development' | 'production';
      REMIRROR_E2E_SERVER?: TestServerName;
      REMIRROR_E2E_ENVIRONMENT?: TestEnvironment;
      REMIRROR_E2E_DEBUG?: string;
      REMIRROR_E2E_COVERAGE?: string;
      /**
       * When set only run the most basic of tests.
       */
      REMIRROR_E2E_BASIC?: string;
    }
  }
}
