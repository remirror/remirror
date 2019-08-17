import { PlainObject } from '@remirror/core';
import { createTestManager } from '@test-fixtures/schema-helpers';
import { render } from '@test-fixtures/testing-library';
import React, { forwardRef, FunctionComponent, RefAttributes } from 'react';
import { Remirror } from '..';

const mock = jest.fn();
const Menu: FunctionComponent<RefAttributes<HTMLDivElement> & PlainObject> = forwardRef((_, ref) => {
  mock(ref);
  return null;
});

test('updates the offscreen attribute when a selection is active', () => {
  render(
    <Remirror manager={createTestManager()}>
      {({ getPositionerProps }) => {
        const { ref } = getPositionerProps({ positionerId: 'test' });
        return (
          <div>
            <Menu ref={ref} />
          </div>
        );
      }}
    </Remirror>,
  );
  expect(mock).toHaveBeenCalledWith(expect.any(Function));
});

test('provides correct menu props', () => {
  render(
    <Remirror manager={createTestManager()}>
      {({ getPositionerProps }) => {
        const { ref, ...props } = getPositionerProps({ positionerId: 'test' });
        expect(ref).toEqual(expect.any(Function));
        expect(props).toContainAllKeys(['top', 'left', 'bottom', 'right', 'isActive']);
        return <div />;
      }}
    </Remirror>,
  );
  expect.hasAssertions();
});
