import { RemirrorTestChain } from 'jest-remirror';
import { FC } from 'react';
import { act, DefaultEditor, strictRender } from 'testing/react';
import type { RemirrorManager } from '@remirror/core';
import type { HistoryExtension } from '@remirror/extension-history';
import { createReactManager, ReactExtensions, Remirror } from '@remirror/react';

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
  manager: RemirrorManager<ReactExtensions<HistoryExtension>>;
}

const Wrapper: FC<Props> = ({ manager }) => {
  return (
    <Remirror manager={manager} autoFocus={true}>
      <DefaultEditor />
      <HookConsumer />
    </Remirror>
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
