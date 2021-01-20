import { FC } from 'react';
import { strictRender } from 'testing/react';
import { createReactManager, Remirror } from '@remirror/react';

import { useMultiPositioner } from '../use-multi-positioner';

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
