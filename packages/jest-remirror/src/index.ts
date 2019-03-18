export * from './builder';
export * from './transactions';
export * from './matchers';
export * from './jsdom-polyfills';
export * from './test-schema';
export * from './test-editor';
export * from './setup-environment';

declare global {
  interface Window {
    hasWarnedAboutCancelAnimationFramePolyfill?: boolean;
    hasWarnedAboutJsdomFixtures: boolean;
    ignoreAllJSDOMWarnings: boolean;
  }
}
