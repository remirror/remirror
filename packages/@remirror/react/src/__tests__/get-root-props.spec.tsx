import { axe } from 'jest-axe';
import React, { forwardRef, FunctionComponent, RefAttributes } from 'react';

import { RenderResult, strictRender } from '@remirror/testing/react';

import { createReactManager, RemirrorProvider, useRemirror } from '../..';

const mock = jest.fn();

test('supports a custom root element', () => {
  const Component: FunctionComponent<RefAttributes<HTMLDivElement>> = forwardRef((_, ref) => {
    mock(ref);

    return <div {...useRemirror().getRootProps({ ref })} />;
  });

  strictRender(
    <RemirrorProvider manager={createReactManager([])}>
      <Component ref={() => {}} />
    </RemirrorProvider>,
  );

  expect(mock).toHaveBeenCalledWith(expect.any(Function));
});

test('supports a custom ref label and passed props through', () => {
  const Component = () => {
    const context = useRemirror();
    const props = context.getRootProps({ refKey: 'customRef', testProp });
    mock(props);
    return <div ref={props.customRef} />;
  };

  const testProp = 'test';
  strictRender(
    <RemirrorProvider manager={createReactManager([])}>
      <Component />
    </RemirrorProvider>,
  );

  expect(mock.mock.calls[0][0].customRef).toBeFunction();
  expect(mock.mock.calls[0][0].testProp).toBe(testProp);
});

describe('nestedRootProps', () => {
  let result: RenderResult;
  const Component = () => {
    return (
      <div>
        <div {...useRemirror().getRootProps()} id='nested-div'>
          <div id='wrapped-div'>Wrapped text</div>
        </div>
      </div>
    );
  };

  beforeEach(() => {
    result = strictRender(
      <main>
        <RemirrorProvider manager={createReactManager([])} label='Editor'>
          <Component />
        </RemirrorProvider>
      </main>,
    );
  });

  it('should not duplicate nodes', () => {
    const { baseElement } = result;

    expect(baseElement.querySelectorAll('#nested-div')).toHaveLength(1);
  });

  it('renders the nested elements', () => {
    const { baseElement, getByRole } = result;
    const innerLabel = baseElement.querySelector('#wrapped-div') as HTMLElement;
    const wrapper = baseElement.querySelector('#nested-div');

    expect(innerLabel).toBeVisible();
    expect(wrapper!.childElementCount).toBe(2);
    expect(wrapper).toContainElement(innerLabel);
    expect(wrapper).toContainElement(getByRole('textbox'));
  });

  it('retains accessibility', async () => {
    await expect(axe(result.container.outerHTML)).resolves.toHaveNoViolations();
  });
});
