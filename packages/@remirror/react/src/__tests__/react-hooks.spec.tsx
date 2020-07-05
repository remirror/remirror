import React, { FC } from 'react';

import { contextPropsShape, createReactManager, positionerShape } from '@remirror/testing';
import { render } from '@remirror/testing/react';

import { RemirrorProvider } from '../components/providers';
import { usePositioner, useRemirror } from '../hooks';

test('useRemirror', () => {
  const HookComponent: FC = () => {
    const injectedProps = useRemirror();

    expect(injectedProps).toMatchObject(contextPropsShape);

    return <div />;
  };

  render(
    <RemirrorProvider manager={createReactManager()}>
      <HookComponent />
    </RemirrorProvider>,
  );
});

test('usePositioner', () => {
  const HookComponent: FC = () => {
    const positionerProps = usePositioner('bubble');

    expect(positionerProps).toMatchObject(positionerShape);

    return <div />;
  };

  render(
    <RemirrorProvider manager={createReactManager()}>
      <HookComponent />
    </RemirrorProvider>,
  );
});
