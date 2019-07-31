import { ManagedRemirrorProvider, RemirrorManager } from '@remirror/react';
import { render } from '@testing-library/react';
import React from 'react';
import { ProsemirrorDevTools } from '../dev-components';

test('it supports <ProsemirrorDevTools />', () => {
  const { baseElement } = render(
    <RemirrorManager>
      <ManagedRemirrorProvider>
        <ProsemirrorDevTools />
      </ManagedRemirrorProvider>
    </RemirrorManager>,
  );
  const element = baseElement.querySelector('.__prosemirror-dev-tools__');
  expect(element).toBeTruthy();
});

test('it unmounts <ProsemirrorDevTools />', () => {
  const Component = ({ dev }: { dev: boolean }) => (dev ? <ProsemirrorDevTools /> : <div />);

  const { baseElement, rerender } = render(
    <RemirrorManager>
      <ManagedRemirrorProvider>
        <Component dev={true} />
      </ManagedRemirrorProvider>
    </RemirrorManager>,
  );

  rerender(
    <RemirrorManager>
      <ManagedRemirrorProvider>
        <Component dev={false} />
      </ManagedRemirrorProvider>
    </RemirrorManager>,
  );
  const element = baseElement.querySelector('.__prosemirror-dev-tools__');
  expect(element).toBeFalsy();
});
