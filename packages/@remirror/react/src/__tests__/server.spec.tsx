/**
 * @jest-environment node
 */

import React, { Fragment } from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';

import { EDITOR_CLASS_NAME } from '@remirror/core';
import { BoldExtension, docNodeBasicJSON, docNodeSimpleJSON } from '@remirror/testing';
import { createReactManager } from '@remirror/testing/react';

import { RemirrorProvider, useRemirror } from '../..';

const label = 'Remirror editor';
const handlers = {
  onChange: jest.fn(),
  onBlur: jest.fn(),
  onFocus: jest.fn(),
  onFirstRender: jest.fn(),
};

describe('RemirrorProvider: Server', () => {
  it('can render in a node server environment', () => {
    const mock = jest.fn();

    const Component = () => {
      const context = useRemirror();
      mock(context);

      return <span {...context.getRootProps()} />;
    };

    const reactString = renderToString(
      <RemirrorProvider
        {...handlers}
        label={label}
        initialContent={docNodeSimpleJSON}
        manager={createReactManager([new BoldExtension()])}
      >
        <Component />
      </RemirrorProvider>,
    );

    expect(mock).toHaveBeenCalledWith(expect.any(Object));
    expect(handlers.onFirstRender).not.toHaveBeenCalledWith();
    expect(reactString).toInclude('This is a node with');
    expect(reactString).toInclude(`<span`);
  });

  it('renders with a custom component', () => {
    const TestComponent = () => {
      const { getRootProps } = useRemirror();
      const rootProps = getRootProps();
      return (
        <div data-testid='1'>
          <div data-testid='2'>
            <div data-testid='target' {...rootProps} />
          </div>
        </div>
      );
    };

    const element = (
      <RemirrorProvider initialContent={docNodeBasicJSON} manager={createReactManager([])}>
        <TestComponent />
      </RemirrorProvider>
    );
    const reactString = renderToStaticMarkup(element);

    expect(reactString).toInclude('basic');
  });

  it('still renders content with a non-dom top level node', () => {
    const reactString = renderToString(
      <RemirrorProvider
        {...handlers}
        label={label}
        initialContent={docNodeSimpleJSON}
        manager={createReactManager([new BoldExtension()])}
        autoRender={true}
      >
        <Fragment />
      </RemirrorProvider>,
    );

    expect(reactString).toMatchInlineSnapshot(`
    <div>
      <div role="textbox"
           aria-multiline="true"
           aria-label="Remirror editor"
           aria-placeholder
           class="Prosemirror remirror-editor"
           contenteditable="true"
      >
        <p>
          This is a node with
          <strong>
            bold text.
          </strong>
        </p>
      </div>
    </div>
  `);
  });

  const wrapperId = 'ROOT';
  const finalId = 'INNER123';
  const outerId = 'OUTER123';

  it('appends to the react element by default with `getRootProps`', () => {
    const Component = () => {
      const { getRootProps } = useRemirror();

      return <div {...getRootProps()} data-testid={wrapperId} />;
    };

    const reactString = renderToString(
      <RemirrorProvider
        {...handlers}
        label={label}
        initialContent={docNodeSimpleJSON}
        manager={createReactManager([new BoldExtension()])}
      >
        <div>
          <div data-testid={outerId}>
            <p>Awesome</p>
          </div>
          <Component />
          <div data-testid={finalId}>
            <p>inside the editor</p>
          </div>
        </div>
      </RemirrorProvider>,
    );

    expect(reactString).toMatchSnapshot();
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

  it('prepends to the react element when insertPosition=start with getRootProps', () => {
    const reactString = renderToString(
      <RemirrorProvider
        {...handlers}
        label={label}
        initialContent={docNodeSimpleJSON}
        manager={createReactManager(() => [new BoldExtension()])}
        insertPosition='start'
      >
        {() => (
          <div>
            <div {...useRemirror().getRootProps()} data-testid={wrapperId} />
            <div data-testid={finalId}>
              <p>inside the editor</p>
            </div>
            <div data-testid={outerId} />
          </div>
        )}
      </RemirrorProvider>,
    );

    const indexOfOuter = reactString.indexOf(outerId);
    const indexOfInnerDiv = reactString.indexOf(finalId);
    const indexOfInjectedSSRComponent = reactString.indexOf(EDITOR_CLASS_NAME);

    expect(isAscending([indexOfInjectedSSRComponent, indexOfInnerDiv, indexOfOuter])).toBeTrue();
  });
});

test('autoFocus', () => {
  const reactString = renderToString(
    <RemirrorProvider
      {...handlers}
      label={label}
      autoFocus={true}
      initialContent={docNodeSimpleJSON}
      manager={createReactManager([new BoldExtension()])}
      autoRender={true}
    >
      {() => <Fragment />}
    </RemirrorProvider>,
  );

  expect(reactString).toMatchInlineSnapshot(`
    <div>
      <div role="textbox"
           autofocus
           aria-multiline="true"
           aria-label="Remirror editor"
           aria-placeholder
           class="Prosemirror remirror-editor"
           contenteditable="true"
      >
        <p>
          This is a node with
          <strong>
            bold text.
          </strong>
        </p>
      </div>
    </div>
  `);
});

/**
 * Check that the numbers passed in are of ascending order.
 *
 * @param numbers - the array of numbers to test
 */
function isAscending(numbers: number[], strict = false) {
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
}
