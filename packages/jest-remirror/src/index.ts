export * from './builder';
export * from './jsdom-polyfills';
export * from './keys';
export * from './matchers';
export * from './render-editor';
export * from './render-ssr-editor';
export * from './setup-environment';
export * from './test-schema';
export * from './transactions';
export * from './jest-remirror-types';

declare global {
  interface Window {
    hasWarnedAboutCancelAnimationFramePolyfill?: boolean;
    hasWarnedAboutJsdomFixtures: boolean;
    ignoreAllJSDOMWarnings: boolean;
  }
}
