import { bubblePositioner } from '@remirror/react-utils';
import { injectedPropsShape, positionerShape } from '@test-fixtures/object-shapes';
import { createTestManager } from '@test-fixtures/schema-helpers';
import { render } from '@testing-library/react';
import React, { FC } from 'react';
import { RemirrorProvider } from '../components/providers';
import { usePositioner, useRemirror } from '../react-hooks';

test('useRemirrorContext', () => {
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
