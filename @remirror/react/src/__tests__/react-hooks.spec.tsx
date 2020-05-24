import { render } from '@testing-library/react';
import React, { FC } from 'react';

import { RemirrorProvider } from '../components/remirror-provider';
import { usePositioner } from '../hooks/use-positioner';
import { useRemirror } from '../hooks/use-remirror';
import { bubblePositioner } from '../react-positioners';

test('useRemirror', () => {
  expect.assertions(1);

  const HookComponent: FC = () => {
    const injectedProps = useRemirror();

    expect(injectedProps).toMatchObject(injectedPropsShape);

    return <div />;
  };

  render(
    <RemirrorProvider manager={createTestManager()}>
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
    <RemirrorProvider manager={createTestManager()}>
      <HookComponent />
    </RemirrorProvider>,
  );
});
