import React, { FC } from 'react';
import { strictRender } from 'testing/react';
import { defaultAbsolutePosition } from '@remirror/extension-positioner';
import { createReactManager, Remirror } from '@remirror/react-core';

import { usePositioner } from '../src/use-positioner';

test('`usePositioner` default values', () => {
  const HookComponent: FC = () => {
    const positionerProps = usePositioner('cursor');

    expect(positionerProps).toEqual({
      active: false,
      data: {},
      key: expect.any(String),
      ...defaultAbsolutePosition,
    });

    return <div />;
  };

  strictRender(
    <Remirror manager={createReactManager([])}>
      <HookComponent />
    </Remirror>,
  );
});
