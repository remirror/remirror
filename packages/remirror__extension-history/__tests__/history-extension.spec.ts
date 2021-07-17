import { extensionValidityTest, renderEditor } from 'jest-remirror';
import type { EditorState } from '@remirror/core';

import { HistoryExtension } from '../';

extensionValidityTest(HistoryExtension);

describe('commands', () => {
  const create = () => renderEditor([new HistoryExtension()]);

  it('can undo', () => {
    const {
      nodes: { p, doc },
      add,
    } = create();
    add(doc(p('<cursor>')))
      .insertText('Text goes here')
      .callback(({ commands }) => {
        expect(commands.undo.isEnabled()).toBeTrue();

        commands.undo();
        expect(commands.undo.isEnabled()).toBeFalse();
      })
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('')));
      });
  });

  it('can redo', () => {
    const {
      nodes: { p, doc },
      add,
    } = create();
    add(doc(p('<cursor>')))
      .insertText('Text goes here')
      .callback(({ commands }) => {
        expect(commands.redo.isEnabled()).toBeFalse();

        commands.undo();
        expect(commands.redo.isEnabled()).toBeTrue();

        commands.redo();
        expect(commands.redo.isEnabled()).toBeFalse();
      })
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('Text goes here')));
      });
  });
});

describe('`getState` and `getDispatch`', () => {
  const dispatcher = jest.fn();
  let state: EditorState;
  const getState: () => EditorState = jest.fn(() => state);
  const mocks = {
    getState,
    getDispatch: () => dispatcher,
  };

  const create = () => renderEditor([new HistoryExtension(mocks)]);
  const {
    nodes: { p, doc },
    add,
  } = create();

  it('overrides for undo', () => {
    add(doc(p('<cursor>')))
      .insertText('Text goes here')
      .callback((content) => {
        state = content.state;
      })
      .callback(({ commands }) => {
        commands.undo();

        expect(mocks.getState).toHaveBeenCalledTimes(1);
        expect(dispatcher).toHaveBeenCalledTimes(1);
      });
  });

  it('overrides for redo', () => {
    add(doc(p('<cursor>')))
      .insertText('Text goes here')
      .callback((content) => {
        state = content.state;
      })
      .callback(({ commands }) => {
        commands.undo();
        jest.clearAllMocks();
        commands.redo();

        expect(mocks.getState).toHaveBeenCalled();
      });
  });

  it('overrides for keyboard shortcut', () => {
    const {
      nodes: { p, doc },
      add,
    } = create();
    add(doc(p('<cursor>')))
      .insertText('Text goes here')
      .shortcut('Mod-z')
      .callback((content) => {
        state = content.state;
      })
      .callback(() => {
        expect(mocks.getState).toHaveBeenCalledTimes(1);
        expect(dispatcher).toHaveBeenCalledTimes(1);
      });
  });
});
