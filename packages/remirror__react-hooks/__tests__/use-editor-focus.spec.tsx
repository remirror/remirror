import { RemirrorTestChain } from 'jest-remirror';
import React, { FC } from 'react';
import { act, DefaultEditor, fireEvent, strictRender } from 'testing/react';
import type { RemirrorManager } from '@remirror/core';
import { EventsExtension } from '@remirror/extension-events';
import { createReactManager, ReactExtensions, Remirror } from '@remirror/react-core';

import { useEditorFocus } from '../src/use-editor-focus';

const result = {
  focused: true,
};

const HookConsumer = () => {
  const [focused] = useEditorFocus();
  result.focused = focused;

  return null;
};

interface Props {
  manager: RemirrorManager<ReactExtensions<EventsExtension>>;
}

const Wrapper: FC<Props> = ({ manager }) => (
  <Remirror manager={manager} autoFocus={true}>
    <DefaultEditor />
    <HookConsumer />
  </Remirror>
);

test('should update in response to the editor focus state', () => {
  const editor = RemirrorTestChain.create(createReactManager([new EventsExtension()]));

  strictRender(<Wrapper manager={editor.manager} />);

  act(() => {
    fireEvent.blur(editor.dom);
  });

  expect(result.focused).toBe(false);

  act(() => {
    fireEvent.focus(editor.dom);
  });

  expect(result.focused).toBe(true);
});
