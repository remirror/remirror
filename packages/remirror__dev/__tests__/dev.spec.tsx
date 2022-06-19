import { jest } from '@jest/globals';
import React from 'react';
import { strictRender } from 'testing/react';
import { createReactManager, Remirror } from '@remirror/react-core';

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
  const element = baseElement.querySelector('.__prosemirror-dev-toolkit__');

  expect(element).toBeInTheDocument();
  expect(element?.childNodes.length ?? 0).toBeGreaterThanOrEqual(1);
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
  const element = baseElement.querySelector('.__prosemirror-dev-toolkit__');

  expect(element?.childNodes.length ?? 0).toBe(0);
});
