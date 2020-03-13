import { EditorState } from '@remirror/core';
import { renderEditor } from 'jest-remirror';

import { HistoryExtension } from '../history-extension';

describe('commands', () => {
  const create = () => renderEditor({ others: [new HistoryExtension()] });

  it('can undo', () => {
    const { p, doc, add } = create();
    add(doc(p('<cursor>')))
      .insertText('Text goes here')
      .actionsCallback(actions => {
        expect(actions.undo.isActive()).toBeFalse();
        expect(actions.undo.isEnabled()).toBeTrue();

        actions.undo();

        expect(actions.undo.isEnabled()).toBeFalse();
      })
      .callback(content => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('')));
      });
  });

  it('can redo', () => {
    const { p, doc, add } = create();
    add(doc(p('<cursor>')))
      .insertText('Text goes here')
      .actionsCallback(actions => {
        expect(actions.redo.isActive()).toBeFalse();
        expect(actions.redo.isEnabled()).toBeFalse();

        actions.undo();

        expect(actions.redo.isEnabled()).toBeTrue();

        actions.redo();

        expect(actions.redo.isEnabled()).toBeFalse();
      })
      .callback(content => {
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

  const create = () => renderEditor({ others: [new HistoryExtension(mocks)] });
  let { p, doc, add } = create();

  beforeEach(() => {
    ({ p, doc, add } = create());
  });

  it('overrides for undo', () => {
    add(doc(p('<cursor>')))
      .insertText('Text goes here')
      .callback(content => {
        state = content.state;
      })
      .actionsCallback(actions => {
        actions.undo();

        expect(mocks.getState).toHaveBeenCalledTimes(1);
        expect(dispatcher).toHaveBeenCalledTimes(1);
      });
  });

  it('overrides for redo', () => {
    add(doc(p('<cursor>')))
      .insertText('Text goes here')
      .callback(content => {
        state = content.state;
      })
      .actionsCallback(actions => {
        actions.undo();
        jest.clearAllMocks();
        actions.redo();

        expect(mocks.getState).toHaveBeenCalled();
      });
  });

  it('overrides for keyboard shortcut', () => {
    const { p, doc, add } = create();
    add(doc(p('<cursor>')))
      .insertText('Text goes here')
      .shortcut('Mod-z')
      .callback(content => {
        state = content.state;
      })
      .callback(() => {
        expect(mocks.getState).toHaveBeenCalledTimes(1);
        expect(dispatcher).toHaveBeenCalledTimes(1);
      });
  });
});
