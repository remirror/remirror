import { Circus } from '@jest/types';
import { JestProcessManagerOptions } from 'jest-process-manager';

export type TestEnvironment = 'playwright';
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

export type TestServer = PlaywrightTestServer;

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
      /**
       * @defaultValue 'chromium'
       */
      E2E_BROWSER?: PlaywrightBrowserName;

      /**
       * @defaultValue 'development'
       */
      E2E_MODE?: 'development' | 'production';

      /**
       * @defaultValue 'storybook-react'
       */
      E2E_SERVER?: TestServerName;

      /**
       * @defaultValue 'playwright'
       */
      E2E_ENVIRONMENT?: TestEnvironment;

      /**
       * @defaultValue undefined
       */
      E2E_DEBUG?: string;

      /**
       * @defaultValue undefined
       */
      E2E_COVERAGE?: string;
    }
  }
}
