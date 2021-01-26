import { strictRender } from 'testing/react';
import { createReactManager, Remirror } from '@remirror/react';

import { ProsemirrorDevTools } from '../';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

test('it supports <ProsemirrorDevTools />', () => {
  const { baseElement } = strictRender(
    <Remirror manager={createReactManager([])}>
      <ProsemirrorDevTools />
    </Remirror>,
  );
  const element = baseElement.querySelector('.__prosemirror-dev-tools__');

  expect(element).toBeInTheDocument();
});

test('it unmounts <ProsemirrorDevTools />', () => {
  const Component = ({ dev }: { dev: boolean }) => (dev ? <ProsemirrorDevTools /> : <div />);

  const { baseElement, rerender } = strictRender(
    <Remirror manager={createReactManager([])}>
      <Component dev={true} />
    </Remirror>,
  );

  rerender(
    <Remirror manager={createReactManager([])}>
      <Component dev={false} />
    </Remirror>,
  );
  const element = baseElement.querySelector('.__prosemirror-dev-tools__');

  expect(element).not.toBeInTheDocument();
});
