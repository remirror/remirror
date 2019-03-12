import React, { forwardRef, FunctionComponent, RefAttributes } from 'react';

import { render } from '@test-utils';
import { Remirror } from '..';

const mock = jest.fn();
const CustomRoot: FunctionComponent<RefAttributes<HTMLDivElement>> = forwardRef((props, ref) => {
  mock(ref);
  return <div {...props} ref={ref} />;
});

test('supports a custom root element', () => {
  render(
    <Remirror>
      {({ getRootProps }) => {
        return <CustomRoot {...getRootProps()} />;
      }}
    </Remirror>,
  );
  expect(mock).toHaveBeenCalledWith(expect.any(Function));
});

test('supports a custom ref label and passed props through', () => {
  function Cmp(props: { customRef: React.Ref<HTMLDivElement> }) {
    mock(props);
    return <div ref={props.customRef} />;
  }
  const testProp = 'test';
  render(
    <Remirror>
      {({ getRootProps }) => {
        return <Cmp {...getRootProps({ refKey: 'customRef', testProp })} />;
      }}
    </Remirror>,
  );
  expect(mock.mock.calls[0][0].customRef).toBeFunction();
  expect(mock.mock.calls[0][0].testProp).toBe(testProp);
});
