import React, { FC } from 'react';
import { strictRender } from 'testing/react';
import { createReactManager, Remirror } from '@remirror/react-core';

import { useMultiPositioner } from '../src/use-multi-positioner';

test('`useMultiPositioner` default values', () => {
  const HookComponent: FC = () => {
    const positioners = useMultiPositioner('selection', []);

    expect(positioners).toEqual([]);
    return <div />;
  };

  strictRender(
    <Remirror manager={createReactManager([])}>
      <HookComponent />
    </Remirror>,
  );
});
