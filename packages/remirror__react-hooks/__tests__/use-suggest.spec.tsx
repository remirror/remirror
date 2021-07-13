import { RemirrorTestChain } from 'jest-remirror';
import { FC } from 'react';
import { act, DefaultEditor, strictRender } from 'testing/react';
import type { RemirrorManager } from '@remirror/core';
import { createReactManager, Remirror } from '@remirror/react';

import { useSuggest, UseSuggestReturn } from '../use-suggest';

const result: { current: UseSuggestReturn | undefined } = {
  current: undefined,
};

const HookConsumer = () => {
  result.current = useSuggest({ char: '/', name: 'test' });

  return null;
};

interface Props {
  manager: RemirrorManager<any>;
}

const Wrapper: FC<Props> = ({ manager }) => {
  return (
    <Remirror manager={manager} autoFocus={true}>
      <DefaultEditor />
      <HookConsumer />
    </Remirror>
  );
};

test('should update the query for each keypress', () => {
  const editor = RemirrorTestChain.create(createReactManager([]));

  strictRender(<Wrapper manager={editor.manager} />);

  act(() => {
    editor.insertText(' ');
  });

  expect(result.current?.change?.text.full).toBeUndefined();

  act(() => {
    editor.insertText('/');
  });

  expect(result.current?.change?.text.full).toBe('/');

  act(() => {
    editor.insertText('a');
  });

  expect(result.current?.change?.text.full).toBe('/a');

  act(() => {
    editor.insertText('b');
  });

  expect(result.current?.change?.text.full).toBe('/ab');

  act(() => {
    editor.insertText('c');
  });

  expect(result.current?.change?.text.full).toBe('/abc');
});

test('should not break when deleting content', () => {
  const editor = RemirrorTestChain.create(createReactManager([]));
  const { doc, p } = editor.nodes;
  strictRender(<Wrapper manager={editor.manager} />);

  act(() => {
    editor.insertText('/');
  });

  act(() => {
    editor.add(doc(p('')));
  });

  expect(result.current?.change).toBeUndefined();
});
