export * from './builder';
export * from './transactions';
export * from './matchers';
export * from './jsdom-polyfills';
export * from './test-schema';
export * from './render-editor';
export * from './setup-environment';
export * from './keys';
export * from './types';

declare global {
  interface Window {
    hasWarnedAboutCancelAnimationFramePolyfill?: boolean;
    hasWarnedAboutJsdomFixtures: boolean;
    ignoreAllJSDOMWarnings: boolean;
  }
}
