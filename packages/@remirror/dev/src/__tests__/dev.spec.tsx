import React from 'react';

import { RemirrorProvider } from '@remirror/react';
import { createReactManager, strictRender } from '@remirror/testing/react';

import { ProsemirrorDevTools } from '../dev';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

test('it supports <ProsemirrorDevTools />', () => {
  const { baseElement } = strictRender(
    <RemirrorProvider manager={createReactManager([])}>
      <ProsemirrorDevTools />
    </RemirrorProvider>,
  );
  const element = baseElement.querySelector('.__prosemirror-dev-tools__');

  expect(element).toBeTruthy();
});

test('it unmounts <ProsemirrorDevTools />', () => {
  const Component = ({ dev }: { dev: boolean }) => (dev ? <ProsemirrorDevTools /> : <div />);

  const { baseElement, rerender } = strictRender(
    <RemirrorProvider manager={createReactManager([])}>
      <Component dev={true} />
    </RemirrorProvider>,
  );

  rerender(
    <RemirrorProvider manager={createReactManager([])}>
      <Component dev={false} />
    </RemirrorProvider>,
  );
  const element = baseElement.querySelector('.__prosemirror-dev-tools__');

  expect(element).toBeFalsy();
});
