export { ignoreJSDOMWarnings, jsdomExtras, jsdomPolyfill } from './jsdom-polyfills';
export { remirrorMatchers } from './jest-remirror-matchers';
export { renderEditor, RemirrorTestChain } from './jest-remirror-editor';
export { setupRemirrorEnvironment } from './jest-remirror-environment';
export type { RenderEditorParameter, TaggedProsemirrorNode } from './jest-remirror-types';

export { extensionValidityTest } from './jest-remirror-validator';

declare global {
  interface Window {
    hasWarnedAboutCancelAnimationFramePolyfill?: boolean;
    ignoreAllJSDOMWarnings: boolean;
  }
}
