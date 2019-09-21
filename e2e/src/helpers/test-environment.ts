/**
 * Retrieve the browser name from the environment
 */
export const getBrowserName = (): SupportedBrowserName => process.env.REMIRROR_E2E_BROWSER || 'chromium';

/**
 * Prefix the browser name to the passed in string
 */
export const prefixBrowserName = (...value: string[]) =>
  `${getBrowserName()}-${process.platform}-${__SERVER__.name}-${value.join('-')}`;

/**
 * Declare the globals used throughout tests
 */
declare global {
  const __DEV__: boolean;
  const __TEST__: boolean;
  /**
   * Identifies whether this is an e2e test
   */
  const __E2E__: boolean;

  /**
   * Lists the servers running for end to end test.
   */
  const __SERVER__: {
    config: {
      command: string;
      port: number;
      usedPortAction: 'ask' | 'error' | 'ignore' | 'kill';
      launchTimeout: number;
    };
    regex: string;
    urls: Record<RemirrorTestEditors, { empty: string; content: string }>;
    home: string;
    name: string;
  };

  namespace NodeJS {
    interface ProcessEnv {
      REMIRROR_E2E_BROWSER?: SupportedBrowserName;
      REMIRROR_E2E_SERVER?: string;
      REMIRROR_E2E_DEBUG?: string;
      REMIRROR_E2E_DOCKER?: string;
      /**
       * When set only run the most basic of tests.
       */
      REMIRROR_E2E_BASIC?: string;
    }
  }

  type RemirrorTestServers = 'storybook' | 'next' | 'docs' | 'razzle';
  type RemirrorTestEditors = 'social' | 'wysiwyg' | 'epic';
  type SupportedBrowserName = 'firefox' | 'chromium';
}
