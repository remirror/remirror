/**
 * @jest-environment node
 */

import { Fragment } from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { CoreTheme } from 'remirror';
import { BoldExtension } from 'remirror/extensions';
import { docNodeBasicJSON, docNodeSimpleJSON } from 'testing';

import { createReactManager, Remirror, useRemirrorContext } from '../';

const label = 'Remirror editor';
const handlers = {
  onChange: jest.fn(),
  onBlur: jest.fn(),
  onFocus: jest.fn(),
  onFirstRender: jest.fn(),
};

describe('Remirror: Server', () => {
  it('can render in a node server environment', () => {
    const mock = jest.fn();

    const Component = () => {
      const context = useRemirrorContext();
      mock(context);

      return <span {...context.getRootProps()} />;
    };

    const reactString = renderToString(
      <Remirror
        {...handlers}
        label={label}
        initialContent={docNodeSimpleJSON}
        manager={createReactManager([new BoldExtension()])}
      >
        <Component />
      </Remirror>,
    );

    expect(mock).toHaveBeenCalledWith(expect.any(Object));
    expect(handlers.onFirstRender).not.toHaveBeenCalledWith();
    expect(reactString).toInclude('This is a node with');
    expect(reactString).toInclude(`<span`);
  });

  it('renders with a custom component', () => {
    const TestComponent = () => {
      const { getRootProps } = useRemirrorContext();
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
      <Remirror initialContent={docNodeBasicJSON} manager={createReactManager([])}>
        <TestComponent />
      </Remirror>
    );
    const reactString = renderToStaticMarkup(element);

    expect(reactString).toInclude('basic');
  });

  it('still renders content with a non-dom top level node', () => {
    const reactString = renderToString(
      <Remirror
        {...handlers}
        label={label}
        initialContent={docNodeSimpleJSON}
        manager={createReactManager([new BoldExtension()])}
        autoRender={true}
      >
        <Fragment />
      </Remirror>,
    );

    expect(reactString).toMatchInlineSnapshot(`
      <div class="remirror-editor-wrapper">
        <div role="textbox"
             aria-multiline="true"
             aria-label="Remirror editor"
             class="Prosemirror remirror-editor"
             aria-placeholder
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
      const { getRootProps } = useRemirrorContext();

      return <div {...getRootProps()} data-testid={wrapperId} />;
    };

    const reactString = renderToString(
      <Remirror
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
      </Remirror>,
    );

    expect(reactString).toMatchSnapshot();
    expect(reactString).toInclude('This is a node with');

    const indexOfOuter = reactString.indexOf(outerId);
    const indexOfWrapper = reactString.indexOf(wrapperId);
    const indexOfInjectedSSRComponent = reactString.indexOf(CoreTheme.EDITOR);
    const indexOfInnerDiv = reactString.indexOf(finalId);

    expect(indexOfOuter).toBeLessThan(indexOfWrapper);
    expect(
      isAscending([indexOfOuter, indexOfWrapper, indexOfInjectedSSRComponent, indexOfInnerDiv]),
    ).toBeTrue();
  });

  it('prepends to the react element when insertPosition=start with getRootProps', () => {
    const reactString = renderToString(
      <Remirror
        {...handlers}
        label={label}
        initialContent={docNodeSimpleJSON}
        manager={createReactManager(() => [new BoldExtension()])}
        insertPosition='start'
      >
        {() => (
          <div>
            <div {...useRemirrorContext().getRootProps()} data-testid={wrapperId} />
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
    const indexOfInjectedSSRComponent = reactString.indexOf(CoreTheme.EDITOR);

    expect(isAscending([indexOfInjectedSSRComponent, indexOfInnerDiv, indexOfOuter])).toBeTrue();
  });
});

test('autoFocus', () => {
  const reactString = renderToString(
    <Remirror
      {...handlers}
      label={label}
      autoFocus={true}
      initialContent={docNodeSimpleJSON}
      manager={createReactManager([new BoldExtension()])}
      autoRender={true}
    >
      {() => <Fragment />}
    </Remirror>,
  );

  expect(reactString).toMatchInlineSnapshot(`
    <div class="remirror-editor-wrapper">
      <div role="textbox"
           autofocus
           aria-multiline="true"
           aria-label="Remirror editor"
           class="Prosemirror remirror-editor"
           aria-placeholder
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
