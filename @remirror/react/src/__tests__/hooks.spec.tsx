import React, { FC } from 'react';

import { injectedPropsShape, positionerShape } from '@test-fixtures/object-shapes';
import { render } from 'react-testing-library';
import { usePositioner, useRemirrorContext } from '../hooks';
import { bubblePositioner } from '../positioners';
import { RemirrorProvider } from '../provider';

test('useRemirrorContext', () => {
  expect.assertions(1);
  const HookComponent: FC = () => {
    const injectedProps = useRemirrorContext();
    expect(injectedProps).toMatchObject(injectedPropsShape);
    return <div />;
  };

  render(
    <RemirrorProvider>
      <HookComponent />
    </RemirrorProvider>,
  );
});

test('usePositioner', () => {
  expect.assertions(1);
  const HookComponent: FC = () => {
    const injectedProps = usePositioner({ positioner: bubblePositioner, positionerId: 'bubble-menu' });
    expect(injectedProps).toMatchObject(positionerShape);
    return <div />;
  };

  render(
    <RemirrorProvider>
      <HookComponent />
    </RemirrorProvider>,
  );
});
