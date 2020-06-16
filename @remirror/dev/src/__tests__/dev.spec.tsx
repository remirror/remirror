import { render } from '@testing-library/react';
import React from 'react';

import { RemirrorProvider } from '@remirror/react';
import { createBaseManager } from '@remirror/test-fixtures';

import { ProsemirrorDevTools } from '../dev';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

test('it supports <ProsemirrorDevTools />', () => {
  const { baseElement } = render(
    <RemirrorProvider manager={createBaseManager()}>
      <ProsemirrorDevTools />
    </RemirrorProvider>,
  );
  const element = baseElement.querySelector('.__prosemirror-dev-tools__');

  expect(element).toBeTruthy();
});

test('it unmounts <ProsemirrorDevTools />', () => {
  const Component = ({ dev }: { dev: boolean }) => (dev ? <ProsemirrorDevTools /> : <div />);

  const { baseElement, rerender } = render(
    <RemirrorProvider manager={createBaseManager()}>
      <Component dev={true} />
    </RemirrorProvider>,
  );

  rerender(
    <RemirrorProvider manager={createBaseManager()}>
      <Component dev={false} />
    </RemirrorProvider>,
  );
  const element = baseElement.querySelector('.__prosemirror-dev-tools__');

  expect(element).toBeFalsy();
});
