import { render } from '@testing-library/react';
import React, { FC } from 'react';

import { contextPropsShape, createReactManager, positionerShape } from '@remirror/test-fixtures';

import { RemirrorProvider } from '../components/remirror-provider';
import { usePositioner, useRemirror } from '../hooks';
import { bubblePositioner } from '../react-positioners';

test('useRemirror', () => {
  expect.assertions(1);

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
  expect.assertions(1);

  const HookComponent: FC = () => {
    const injectedProps = usePositioner({
      positioner: bubblePositioner,
      positionerId: 'bubble-menu',
    });

    expect(injectedProps).toMatchObject(positionerShape);

    return <div />;
  };

  render(
    <RemirrorProvider manager={createReactManager()}>
      <HookComponent />
    </RemirrorProvider>,
  );
});
