/**
 * @jest-environment node
 */

import React, { Fragment } from 'react';
import { renderToString } from 'react-dom/server';
import { Remirror } from '..';

import { EDITOR_CLASS_NAME } from '@remirror/core';
import { docNodeSimpleJSON } from '@test-fixtures/object-nodes';
import { extensions } from '@test-fixtures/schema-helpers';

// const textContent = `This is editor text`;
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
    <Remirror
      {...handlers}
      label={label}
      initialContent={docNodeSimpleJSON}
      extensions={extensions}
      usesBuiltInExtensions={false}
    >
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
    <Remirror
      {...handlers}
      label={label}
      initialContent={docNodeSimpleJSON}
      extensions={extensions}
      usesBuiltInExtensions={false}
    >
      {() => <Fragment />}
    </Remirror>,
  );

  expect(reactString).toInclude('This is a node with');
  expect(reactString).toInclude('<div role="textbox"');
});

describe('Position when getRootProps is used', () => {
  const wrapperId = 'ABC123';
  const innerId = 'INNER123';
  const outerId = 'OUTER123';

  it('appends to the react element by default', () => {
    const reactString = renderToString(
      <Remirror
        {...handlers}
        label={label}
        initialContent={docNodeSimpleJSON}
        extensions={extensions}
        usesBuiltInExtensions={false}
      >
        {({ getRootProps }) => (
          <div>
            <div id={outerId}>
              <p>Awesome</p>
            </div>
            <div {...getRootProps()} id={wrapperId}>
              <div id={innerId}>
                <p>inside the editor</p>
              </div>
            </div>
          </div>
        )}
      </Remirror>,
    );
    expect(reactString).toInclude('This is a node with');
    const indexOfOuter = reactString.indexOf(outerId);
    const indexOfWrapper = reactString.indexOf(wrapperId);
    const indexOfInnerDiv = reactString.indexOf(innerId);
    const indexOfInjectedSSRComponent = reactString.indexOf(EDITOR_CLASS_NAME);
    expect(indexOfOuter).toBeLessThan(indexOfWrapper);
    expect(
      isAscending([indexOfOuter, indexOfWrapper, indexOfInnerDiv, indexOfInjectedSSRComponent]),
    ).toBeTrue();
  });

  it('prepends to the react element when insertPosition=start', () => {
    const reactString = renderToString(
      <Remirror
        {...handlers}
        label={label}
        initialContent={docNodeSimpleJSON}
        extensions={extensions}
        usesBuiltInExtensions={false}
        insertPosition='start'
      >
        {({ getRootProps }) => (
          <div>
            <div {...getRootProps()} id={wrapperId}>
              <div id={innerId}>
                <p>inside the editor</p>
              </div>
            </div>
            <div id={outerId} />
          </div>
        )}
      </Remirror>,
    );

    const indexOfOuter = reactString.indexOf(outerId);
    const indexOfInnerDiv = reactString.indexOf(innerId);
    const indexOfInjectedSSRComponent = reactString.indexOf(EDITOR_CLASS_NAME);
    expect(isAscending([indexOfInjectedSSRComponent, indexOfInnerDiv, indexOfOuter])).toBeTrue();
  });
});

const isAscending = (numbers: number[], strict = false) => {
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
