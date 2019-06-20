import { take } from '@remirror/core';

const { STORYBOOK_ONLY } = process.env;

/**
 * Shows the position of the relevant deployment target within each array
 */
export enum Deployment {
  Storybook = 0,
  Next,
  Docz,
}

export const URLDescriptor = {
  twitter: [
    ['Storybook', 'http://localhost:3002/iframe.html?id=twitter-ui--basic'],
    ['NextJS', 'http://localhost:3001/editor/twitter'],
    ['Docz', 'http://localhost:3000/showcase/twitter'],
  ],
  wysiwyg: [
    ['Storybook', 'http://localhost:3002/iframe.html?id=wysiwyg-editor--basic'],
    ['NextJS', 'http://localhost:3001/editor/wysiwyg'],
    ['Docz', 'http://localhost:3000/showcase/wysiwyg'],
  ],
};

type URLDescriptorKeys = keyof typeof URLDescriptor;

if (STORYBOOK_ONLY) {
  Object.keys(URLDescriptor).forEach(key => {
    URLDescriptor[key as URLDescriptorKeys] = take(URLDescriptor[key as URLDescriptorKeys], 1);
  });
}

export type BrowserName = 'firefox' | 'chromium';

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
  const __E2E__: boolean;

  namespace NodeJS {
    interface ProcessEnv {
      PUPPETEER_BROWSER?: BrowserName;
    }
  }
}
