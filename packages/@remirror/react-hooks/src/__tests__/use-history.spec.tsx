import { RemirrorTestChain } from 'jest-remirror';
import React, { FC } from 'react';

import type { RemirrorManager } from '@remirror/core';
import type { HistoryExtension } from '@remirror/extension-history';
import { createReactManager, ReactCombinedUnion, RemirrorProvider } from '@remirror/react';
import { act, DefaultEditor, strictRender } from '@remirror/testing/react';

import { useHistory } from '../use-history';

const mocks = {
  undo: jest.fn(),
  redo: jest.fn(),
};

const HookConsumer = () => {
  useHistory('onRedo', mocks.redo);
  useHistory('onUndo', mocks.undo);

  return null;
};

interface Props {
  manager: RemirrorManager<ReactCombinedUnion<HistoryExtension>>;
}

const Wrapper: FC<Props> = ({ manager }) => {
  return (
    <RemirrorProvider manager={manager} autoFocus={true}>
      <DefaultEditor />
      <HookConsumer />
    </RemirrorProvider>
  );
};

test('should update in response to the editor focus state', () => {
  const editor = RemirrorTestChain.create(createReactManager([]));

  strictRender(<Wrapper manager={editor.manager} />);

  act(() => {
    editor.insertText('ABC');
  });

  expect(mocks.undo).not.toHaveBeenCalled();
  expect(mocks.redo).not.toHaveBeenCalled();

  act(() => {
    editor.commands.undo();
  });

  expect(mocks.undo).toHaveBeenCalledTimes(1);
  expect(mocks.redo).not.toHaveBeenCalled();

  act(() => {
    editor.commands.redo();
  });

  expect(mocks.redo).toHaveBeenCalledTimes(1);
});
