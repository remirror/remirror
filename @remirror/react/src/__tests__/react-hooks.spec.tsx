import { injectedPropsShape, positionerShape } from '@test-fixtures/object-shapes';
import { createTestManager } from '@test-fixtures/schema-helpers';
import { render } from '@testing-library/react';
import React, { FC } from 'react';
import { RemirrorProvider } from '../components/remirror-providers';
import { usePositioner, useRemirrorContext } from '../hooks/context-hooks';
import { bubblePositioner } from '../react-positioners';

test('useRemirrorContext', () => {
  expect.assertions(1);
  const HookComponent: FC = () => {
    const injectedProps = useRemirrorContext();
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
    const injectedProps = usePositioner({ positioner: bubblePositioner, positionerId: 'bubble-menu' });
    expect(injectedProps).toMatchObject(positionerShape);
    return <div />;
  };

  render(
    <RemirrorProvider manager={createTestManager()}>
      <HookComponent />
    </RemirrorProvider>,
  );
});
