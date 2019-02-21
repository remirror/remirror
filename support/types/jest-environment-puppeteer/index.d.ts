// declare module 'jest-environment-puppeteer' {
import { Browser, Page } from 'puppeteer';

interface JestPuppeteer {
  resetPage(): Promise<void>;
  debug(): Promise<void>;
}
declare global {
  const browser: Browser;
  const page: Page;
  const jestPuppeteer: JestPuppeteer;
}

export {};
// }
