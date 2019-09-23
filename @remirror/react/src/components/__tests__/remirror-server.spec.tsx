/**
 * @jest-environment node
 */

import { EDITOR_CLASS_NAME } from '@remirror/core';
import { docNodeSimpleJSON } from '@remirror/test-fixtures';
import { createTestManager } from '@remirror/test-fixtures';
import React, { Fragment } from 'react';
import { renderToString } from 'react-dom/server';
import { Remirror } from '..';

const label = 'Remirror editor';
const handlers = {
  onChange: jest.fn(),
  onBlur: jest.fn(),
  onFocus: jest.fn(),
  onFirstRender: jest.fn(),
};

test('can render in a node server environment', () => {
  const Component = 'span';
  const mock = jest.fn(() => <Component />);
  const reactString = renderToString(
    <Remirror {...handlers} label={label} initialContent={docNodeSimpleJSON} manager={createTestManager()}>
      {mock}
    </Remirror>,
  );

  expect(mock).toHaveBeenCalledWith(expect.any(Object));
  expect(handlers.onFirstRender).not.toHaveBeenCalledWith();
  expect(reactString).toInclude('This is a node with');
  expect(reactString).toInclude(`<${Component}`);
});

test('can render with a non-dom top level node', () => {
  const reactString = renderToString(
    <Remirror {...handlers} label={label} initialContent={docNodeSimpleJSON} manager={createTestManager()}>
      {() => <Fragment />}
    </Remirror>,
  );

  expect(reactString).toInclude('This is a node with');
  expect(reactString).toInclude('<div role="textbox"');
});

const wrapperId = 'ROOT';
const finalId = 'INNER123';
const outerId = 'OUTER123';

test('appends to the react element by default with getRootProps', () => {
  const reactString = renderToString(
    <Remirror {...handlers} label={label} initialContent={docNodeSimpleJSON} manager={createTestManager()}>
      {({ getRootProps }) => (
        <div>
          <div data-testid={outerId}>
            <p>Awesome</p>
          </div>
          <div {...getRootProps()} data-testid={wrapperId} />
          <div data-testid={finalId}>
            <p>inside the editor</p>
          </div>
        </div>
      )}
    </Remirror>,
  );
  expect(reactString).toInclude('This is a node with');
  const indexOfOuter = reactString.indexOf(outerId);
  const indexOfWrapper = reactString.indexOf(wrapperId);
  const indexOfInnerDiv = reactString.indexOf(finalId);
  const indexOfInjectedSSRComponent = reactString.indexOf(EDITOR_CLASS_NAME);
  expect(indexOfOuter).toBeLessThan(indexOfWrapper);
  expect(
    isAscending([indexOfOuter, indexOfWrapper, indexOfInnerDiv, indexOfInjectedSSRComponent]),
  ).toBeTrue();
});

test('prepends to the react element when insertPosition=start with getRootProps', () => {
  const reactString = renderToString(
    <Remirror
      {...handlers}
      label={label}
      initialContent={docNodeSimpleJSON}
      manager={createTestManager()}
      insertPosition='start'
    >
      {({ getRootProps }) => (
        <div>
          <div {...getRootProps()} data-testid={wrapperId} />
          <div data-testid={finalId}>
            <p>inside the editor</p>
          </div>
          <div data-testid={outerId} />
        </div>
      )}
    </Remirror>,
  );

  const indexOfOuter = reactString.indexOf(outerId);
  const indexOfInnerDiv = reactString.indexOf(finalId);
  const indexOfInjectedSSRComponent = reactString.indexOf(EDITOR_CLASS_NAME);
  expect(isAscending([indexOfInjectedSSRComponent, indexOfInnerDiv, indexOfOuter])).toBeTrue();
});

/**
 * Check that the numbers passed in are of ascending order.
 *
 * @param numbers - the array of numbers to test
 */
export const isAscending = (numbers: number[], strict = false) => {
  let current: number | null = null;
  for (const num of numbers) {
    if (current === null) {
      current = num;
    } else {
      if (strict ? num <= current : num < current) {
        return false;
      }
    }
  }

  return true;
};
