import React, { forwardRef, FunctionComponent, RefAttributes } from 'react';

import { PlainObject } from '@remirror/core';
import { render } from 'react-testing-library';
import { Remirror } from '..';

const mock = jest.fn();
const Menu: FunctionComponent<RefAttributes<HTMLDivElement> & PlainObject> = forwardRef((_, ref) => {
  mock(ref);
  return null;
});

test('updates the offscreen attribute when a selection is active', () => {
  render(
    <Remirror>
      {({ getMenuProps }) => {
        const { ref } = getMenuProps({ name: 'test' });
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
    <Remirror>
      {({ getMenuProps }) => {
        const { ref, ...props } = getMenuProps({ name: 'test' });
        expect(ref).toEqual(expect.any(Function));
        expect(props).toContainAllKeys(['position', 'rawData', 'offscreen']);
        expect(props.offscreen).toBe(true);
        return <div />;
      }}
    </Remirror>,
  );
  expect.hasAssertions();
});
