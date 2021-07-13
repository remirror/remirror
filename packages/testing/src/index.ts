import createMockRaf from '@react-spring/mock-raf';
import diff from 'jest-diff';
import {
  AnyRemirrorManager,
  EditorState,
  EditorView,
  Framework,
  PrimitiveSelection,
  RemirrorContentType,
} from '@remirror/core';
import { createEditorView } from '@remirror/react';

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

interface RafMockReturn extends ReturnType<typeof createMockRaf> {
  cleanup: () => void;
}

/**
 * Mock the `requestAnimationFrame`.
 */
export function rafMock(): RafMockReturn {
  const mockRaf = createMockRaf();
  const spy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(mockRaf.raf);

  return { ...mockRaf, cleanup: () => spy.mockRestore() };
}

class TestFramework extends Framework<any, any, any> {
  #cacheOutput: any;

  get name() {
    return 'test';
  }

  updateState() {}

  createView(state: EditorState, element?: HTMLElement): EditorView {
    return createEditorView(
      element,
      {
        state,
        dispatchTransaction: this.dispatchTransaction,
        attributes: () => this.getAttributes(),
        editable: () => this.props.editable ?? true,
      },
      this.props.forceEnvironment,
    );
  }

  get frameworkOutput() {
    return (this.#cacheOutput ??= this.baseOutput);
  }
}

/**
 * Helper function which creates a framework to use in testing.
 */
export function createFramework(manager: AnyRemirrorManager): TestFramework {
  function createStateFromContent(content: RemirrorContentType, selection?: PrimitiveSelection) {
    return manager.createState({
      content,
      stringHandler: 'html',
      selection,
    });
  }

  return new TestFramework({
    getProps: () => ({ manager }),
    initialEditorState: createStateFromContent(manager.createEmptyDoc()),
  });
}

export { diff };
export * from './object-nodes';
export type { FrameRequestCallback, MockRaf } from '@react-spring/mock-raf';
export { default as delay } from 'delay';
export { default as minDocument } from 'min-document';
