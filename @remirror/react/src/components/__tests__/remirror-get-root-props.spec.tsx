import { createTestManager } from '@remirror/test-fixtures';
import { render, RenderResult } from '@testing-library/react';
import { axe } from 'jest-axe';
import React, { forwardRef, FunctionComponent, Ref, RefAttributes } from 'react';
import { Remirror } from '..';

const mock = jest.fn();
const CustomRoot: FunctionComponent<RefAttributes<HTMLDivElement>> = forwardRef((props, ref) => {
  mock(ref);
  return <div {...props} ref={ref} />;
});

test('supports a custom root element', () => {
  render(
    <Remirror manager={createTestManager()}>
      {({ getRootProps }) => {
        return <CustomRoot {...getRootProps()} />;
      }}
    </Remirror>,
  );
  expect(mock).toHaveBeenCalledWith(expect.any(Function));
});

test('supports a custom ref label and passed props through', () => {
  function Cmp(props: { customRef: Ref<HTMLDivElement> }) {
    mock(props);
    return <div ref={props.customRef} />;
  }
  const testProp = 'test';
  render(
    <Remirror manager={createTestManager()}>
      {({ getRootProps }) => {
        return <Cmp {...getRootProps({ refKey: 'customRef', testProp })} />;
      }}
    </Remirror>,
  );
  expect(mock.mock.calls[0][0].customRef).toBeFunction();
  expect(mock.mock.calls[0][0].testProp).toBe(testProp);
});

test('throws an error when called multiple times during render', () => {
  expect.assertions(2);
  render(
    <Remirror manager={createTestManager()}>
      {({ getRootProps }) => {
        expect(() => getRootProps()).not.toThrow();
        expect(() => getRootProps()).toThrowErrorMatchingInlineSnapshot(
          `"\`getRootProps\` has been called MULTIPLE times. It should only be called ONCE during render."`,
        );
        return <div />;
      }}
    </Remirror>,
  );
});

describe('nestedRootProps', () => {
  let result: RenderResult;

  beforeEach(() => {
    result = render(
      <Remirror manager={createTestManager()} label='Editor'>
        {({ getRootProps }) => {
          return (
            <div>
              <div {...getRootProps()} id='nested-div'>
                <div id='wrapped-div'>Wrapped text</div>
              </div>
            </div>
          );
        }}
      </Remirror>,
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
