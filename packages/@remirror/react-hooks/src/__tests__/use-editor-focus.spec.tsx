import { RemirrorTestChain } from 'jest-remirror';
import React, { FC } from 'react';

import type { RemirrorManager } from '@remirror/core';
import { EventsExtension } from '@remirror/extension-events';
import { createReactManager, ReactCombinedUnion, RemirrorProvider } from '@remirror/react';
import { act, DefaultEditor, fireEvent, strictRender } from '@remirror/testing/react';

import { useEditorFocus } from '../use-editor-focus';

const result = {
  focused: true,
};

const HookConsumer = () => {
  const [focused] = useEditorFocus();
  result.focused = focused;

  return null;
};

interface Props {
  manager: RemirrorManager<ReactCombinedUnion<EventsExtension>>;
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
  const editor = RemirrorTestChain.create(createReactManager([new EventsExtension()]));

  strictRender(<Wrapper manager={editor.manager} />);

  act(() => {
    fireEvent.blur(editor.dom);
  });

  expect(result.focused).toEqual(false);

  act(() => {
    fireEvent.focus(editor.dom);
  });

  expect(result.focused).toEqual(true);
});
