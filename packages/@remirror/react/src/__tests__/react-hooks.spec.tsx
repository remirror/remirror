import React, { FC } from 'react';

import { contextPropsShape } from '@remirror/testing';
import { createReactManager, strictRender } from '@remirror/testing/react';

import { RemirrorProvider } from '../components/providers';
import { useMultiPositioner, usePositioner, useRemirror } from '../hooks';

test('useRemirror', () => {
  const HookComponent: FC = () => {
    const injectedProps = useRemirror();

    expect(injectedProps).toMatchObject(contextPropsShape);

    return <div />;
  };

  strictRender(
    <RemirrorProvider manager={createReactManager([])}>
      <HookComponent />
    </RemirrorProvider>,
  );
});

test('`usePositioner` default values', () => {
  const HookComponent: FC = () => {
    const positionerProps = usePositioner('bubble');
    const positioners = useMultiPositioner('bubble');

    expect(positionerProps).toEqual({ active: false });
    expect(positioners).toEqual([]);

    return <div />;
  };

  strictRender(
    <RemirrorProvider manager={createReactManager([])}>
      <HookComponent />
    </RemirrorProvider>,
  );
});
