import { render } from '@testing-library/react';
import React, { forwardRef, FunctionComponent, RefAttributes } from 'react';

import { PlainObject } from '@remirror/core';
import { createTestManager } from '@remirror/test-fixtures';

import { RenderEditor } from '..';

const mock = jest.fn();
const Menu: FunctionComponent<RefAttributes<HTMLDivElement> & PlainObject> = forwardRef(
  (_, ref) => {
    mock(ref);
    return null;
  },
);

test('updates the offscreen attribute when a selection is active', () => {
  render(
    <RenderEditor manager={createTestManager()}>
      {({ getPositionerProps }) => {
        const { ref } = getPositionerProps({ positionerId: 'test' });
        return (
          <div>
            <Menu ref={ref} />
          </div>
        );
      }}
    </RenderEditor>,
  );

  expect(mock).toHaveBeenCalledWith(expect.any(Function));
});

test('provides correct menu props', () => {
  render(
    <RenderEditor manager={createTestManager()}>
      {({ getPositionerProps }) => {
        const { ref, ...props } = getPositionerProps({ positionerId: 'test' });

        expect(ref).toEqual(expect.any(Function));
        expect(props).toContainAllKeys(['top', 'left', 'bottom', 'right', 'isActive']);

        return <div />;
      }}
    </RenderEditor>,
  );

  expect.hasAssertions();
});
