/**
 * @jest-environment node
 */

import React, { Fragment } from 'react';
import { renderToString } from 'react-dom/server';

import { EDITOR_CLASS_NAME } from '@remirror/core';
import { BoldExtension, createReactManager, docNodeSimpleJSON } from '@remirror/test-fixtures';

import { ReactEditor } from '../react-editor';

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
    <ReactEditor
      {...handlers}
      label={label}
      initialContent={docNodeSimpleJSON}
      manager={createReactManager({ extensions: [new BoldExtension()] })}
    >
      {mock}
    </ReactEditor>,
  );

  expect(mock).toHaveBeenCalledWith(expect.any(Object));
  expect(handlers.onFirstRender).not.toHaveBeenCalledWith();
  expect(reactString).toInclude('This is a node with');
  expect(reactString).toInclude(`<${Component}`);
});

test('can render with a non-dom top level node', () => {
  const reactString = renderToString(
    <ReactEditor
      {...handlers}
      label={label}
      initialContent={docNodeSimpleJSON}
      manager={createReactManager()}
    >
      {() => <Fragment />}
    </ReactEditor>,
  );

  expect(reactString).toInclude('This is a node with');
  expect(reactString).toInclude('<div role="textbox"');
});

const wrapperId = 'ROOT';
const finalId = 'INNER123';
const outerId = 'OUTER123';

test('appends to the react element by default with getRootProps', () => {
  const reactString = renderToString(
    <ReactEditor
      {...handlers}
      label={label}
      initialContent={docNodeSimpleJSON}
      manager={createReactManager()}
    >
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
    </ReactEditor>,
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
    <ReactEditor
      {...handlers}
      label={label}
      initialContent={docNodeSimpleJSON}
      manager={createReactManager()}
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
    </ReactEditor>,
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
