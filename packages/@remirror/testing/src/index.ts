import diff from 'jest-diff';

export const initialJson = {
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'Better docs to come soon...' }] },
  ],
};

let shouldHideMessages = true;

// The following code mocks the console.error so
let spy = jest.spyOn(console, 'error');
beforeEach(() => {
  if (!shouldHideMessages) {
    return;
  }

  spy = jest.spyOn(console, 'error');
  spy.mockImplementation(() => {});
});

afterEach(() => {
  if (!shouldHideMessages) {
    shouldHideMessages = true;
    return;
  }

  spy.mockRestore();
});

/**
 * Set to true to hide error messages in the console when unit tests are
 * running.
 *
 * Also return the jest spy for checking if the console.error was called.
 */
export function hideConsoleError(hide: boolean): jest.SpyInstance {
  shouldHideMessages = hide;

  return spy;
}

export { diff };

export { default as minDocument } from 'min-document';

export { BuiltinPreset } from '@remirror/core';
export * from '@remirror/preset-core';
export * from '@remirror/extension-doc';
export * from '@remirror/extension-text';
export * from '@remirror/extension-paragraph';
export * from '@remirror/extension-bold';
export * from '@remirror/extension-code-block';
export * from '@remirror/extension-heading';
export * from '@remirror/extension-blockquote';
export * from '@remirror/extension-link';
export * from '@remirror/extension-italic';
export * from '@remirror/extension-underline';
export * from './object-nodes';
export * from './typecheck';
