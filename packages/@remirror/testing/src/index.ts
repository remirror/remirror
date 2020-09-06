import createMockRaf from '@react-spring/mock-raf';
import diff from 'jest-diff';

export const initialJson = {
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'Better docs to come soon...' }] },
  ],
};

/**
 * Set to true to hide error messages in the console when unit tests are
 * running.
 *
 * Also return the jest spy for checking if the console.error was called.
 */
export function hideConsoleError(hide: boolean): { spy: jest.SpyInstance } {
  // The following code mocks the console.error so that tests with expected
  // failures that log to the console can be run without making the test logs
  // ugly and messy.
  const ref = { spy: jest.spyOn(console, 'error') };

  beforeEach(() => {
    if (!hide) {
      return;
    }

    ref.spy = jest.spyOn(console, 'error');
    ref.spy.mockImplementation(() => {});
  });

  afterEach(() => {
    ref.spy.mockRestore();
  });

  return ref;
}

/**
 * Mock the `requestAnimationFrame`.
 */
export function rafMock() {
  const mockRaf = createMockRaf();
  const spy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(mockRaf.raf);

  return { ...mockRaf, cleanup: () => spy.mockRestore() };
}

export { diff };

export { default as minDocument } from 'min-document';

export type { FrameRequestCallback, MockRaf } from '@react-spring/mock-raf';

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
