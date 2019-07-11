export type SupportedServers = 'next' | 'docz' | 'storybook';

export const URLDescriptor = {
  twitter: [
    ['Storybook', 'http://localhost:3002/iframe.html?id=twitter-ui--basic'],
    ['Next', 'http://localhost:3001/editor/twitter'],
    ['Docz', 'http://localhost:3000/showcase/twitter'],
  ],
  wysiwyg: [
    ['Storybook', 'http://localhost:3002/iframe.html?id=wysiwyg-editor--basic'],
    ['Next', 'http://localhost:3001/editor/wysiwyg'],
    ['Docz', 'http://localhost:3000/showcase/wysiwyg'],
  ],
};

type URLDescriptorKeys = keyof typeof URLDescriptor;

if (__SERVERS__) {
  Object.entries(URLDescriptor).forEach(([key, entries]) => {
    URLDescriptor[key as URLDescriptorKeys] = entries.filter(entry =>
      __SERVERS__.includes(entry[0].toLowerCase() as SupportedServers),
    );
  });
}

export type BrowserName = 'firefox' | 'chromium';

export const getUrl = (type: URLDescriptorKeys, server: SupportedServers) => {
  const item = URLDescriptor[type].find(entry => entry[0].toLowerCase() === server);
  if (!item) {
    throw new Error(`No URL exists for ${type} with server: ${server}`);
  }
  return item[1];
};

/**
 * Retrieve the browser name from the environment
 */
export const getBrowserName = (): BrowserName => process.env.PUPPETEER_BROWSER || 'chromium';

/**
 * Prefix the browser name to the passed in string
 */
export const prefixBrowserName = (value: string) => `${getBrowserName()}-${value}`;

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
   * Currently this supports ['next', 'storybook', 'docz']
   */
  const __SERVERS__: SupportedServers[];

  namespace NodeJS {
    interface ProcessEnv {
      PUPPETEER_BROWSER?: BrowserName;
      PUPPETEER_SERVERS: string;
    }
  }
}
