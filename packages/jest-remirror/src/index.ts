export * from './jest-remirror-editor';
export * from './jest-remirror-environment';
export * from './jest-remirror-matchers';
export * from './jest-remirror-types';
export * from './jest-remirror-validator';
export * from './jsdom-polyfills';

declare global {
  interface Window {
    hasWarnedAboutCancelAnimationFramePolyfill?: boolean;
    ignoreAllJSDOMWarnings: boolean;
  }
}
