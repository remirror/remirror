import React, { FC } from 'react';

import { createReactManager, RemirrorProvider } from '@remirror/react';
import { strictRender } from '@remirror/testing/react';

import { useMultiPositioner } from '../use-multi-positioner';

test('`useMultiPositioner` default values', () => {
  const HookComponent: FC = () => {
    const positioners = useMultiPositioner('bubble');

    expect(positioners).toEqual([]);

    return <div />;
  };

  strictRender(
    <RemirrorProvider manager={createReactManager([])}>
      <HookComponent />
    </RemirrorProvider>,
  );
});
