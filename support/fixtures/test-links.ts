export type SupportedServers = 'next' | 'docz' | 'storybook';

export const TestLinks = {
  twitter: [
    [
      'Storybook',
      'http://localhost:3002/iframe.html?id=twitter-editor--basic',
      'http://localhost:3002/iframe.html?id=twitter-editor--with-content',
    ],
    ['Next', 'http://localhost:3001/editor/twitter', 'http://localhost:3001/editor/twitter/content'],
    ['Docz', 'http://localhost:3000/showcase/twitter'],
  ],
  wysiwyg: [
    [
      'Storybook',
      'http://localhost:3002/iframe.html?id=wysiwyg-editor--basic',
      'http://localhost:3002/iframe.html?id=wysiwyg-editor--with-content',
    ],
    ['Next', 'http://localhost:3001/editor/wysiwyg', 'http://localhost:3001/editor/wysiwyg/content'],
    ['Docz', 'http://localhost:3000/showcase/wysiwyg'],
  ],
};

type TestLinkKeys = keyof typeof TestLinks;

if (__SERVERS__) {
  Object.entries(TestLinks).forEach(([key, entries]) => {
    TestLinks[key as TestLinkKeys] = entries.filter(entry =>
      __SERVERS__.includes(entry[0].toLowerCase() as SupportedServers),
    );
  });
}

export type BrowserName = 'firefox' | 'chromium';

/**
 * Retrieve a test link from the TestLink config object.
 *
 * @param name - the editor name
 * @param server - the server url to obtain
 * @param [content] - when true will use the content url (at index [2])
 */
export const getTestLink = (name: TestLinkKeys, server: SupportedServers, content = false) => {
  const item = TestLinks[name].find(entry => entry[0].toLowerCase() === server);
  if (!item) {
    throw new Error(`No URL exists for ${name} with server: ${server}`);
  }
  return item[content ? 2 : 1];
};

/**
 * Retrieve the browser name from the environment
 */
export const getBrowserName = (): BrowserName => process.env.PUPPETEER_BROWSER || 'chromium';

/**
 * Prefix the browser name to the passed in string
 */
export const prefixBrowserName = (value: string) => `${getBrowserName()}-${process.platform}-${value}`;

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
