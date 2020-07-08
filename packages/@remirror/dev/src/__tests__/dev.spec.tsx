import React from 'react';

import { RemirrorProvider } from '@remirror/react';
import { createCoreManager } from '@remirror/testing';
import { render } from '@remirror/testing/react';

import { ProsemirrorDevTools } from '../dev';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

test('it supports <ProsemirrorDevTools />', () => {
  const { baseElement } = render(
    <RemirrorProvider manager={createCoreManager([])}>
      <ProsemirrorDevTools />
    </RemirrorProvider>,
  );
  const element = baseElement.querySelector('.__prosemirror-dev-tools__');

  expect(element).toBeTruthy();
});

test('it unmounts <ProsemirrorDevTools />', () => {
  const Component = ({ dev }: { dev: boolean }) => (dev ? <ProsemirrorDevTools /> : <div />);

  const { baseElement, rerender } = render(
    <RemirrorProvider manager={createCoreManager([])}>
      <Component dev={true} />
    </RemirrorProvider>,
  );

  rerender(
    <RemirrorProvider manager={createCoreManager([])}>
      <Component dev={false} />
    </RemirrorProvider>,
  );
  const element = baseElement.querySelector('.__prosemirror-dev-tools__');

  expect(element).toBeFalsy();
});
