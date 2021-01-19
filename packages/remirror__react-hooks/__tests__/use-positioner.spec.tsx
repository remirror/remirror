import { FC } from 'react';

import { defaultAbsolutePosition } from '@remirror/extension-positioner';
import { createReactManager, Remirror } from '@remirror/react';
import { strictRender } from 'testing/react';

import { usePositioner } from '../use-positioner';

test('`usePositioner` default values', () => {
  const HookComponent: FC = () => {
    const positionerProps = usePositioner('cursor');

    expect(positionerProps).toEqual({
      active: false,
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
