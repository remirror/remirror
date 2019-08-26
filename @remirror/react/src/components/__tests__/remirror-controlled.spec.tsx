import { EditorState, fromHTML } from '@remirror/core';
import { InjectedRemirrorProps, RemirrorStateListenerParams } from '@remirror/react-utils';
import { createTestManager } from '@test-fixtures/schema-helpers';
import { act, render } from '@testing-library/react';
import React, { useState } from 'react';
import { Remirror } from '..';
import { RemirrorProviderProps } from '../providers';

const label = 'Remirror editor';

describe('Remirror Controlled Component', () => {
  const initialContent = `<p>Hello</p>`;
  const expectedContent = `<p>World</p>`;
  let props: Omit<RemirrorProviderProps, 'children'>;

  beforeEach(() => {
    props = {
      label,
      manager: createTestManager(),
      initialContent,
      stringHandler: fromHTML,
    };
  });

  it('should call onStateChange', () => {
    let value: EditorState | null = null;
    const onStateChange = jest.fn<void, [RemirrorStateListenerParams]>(params => {
      value = params.newState;
    });
    render(
      <Remirror {...props} value={value} onStateChange={onStateChange}>
        {() => <div />}
      </Remirror>,
    );
    expect(onStateChange).toHaveBeenCalled();
    expect(value).not.toBeNull();
  });

  it('responds to setContent updates', () => {
    let stateParams!: RemirrorStateListenerParams;
    let renderParams!: InjectedRemirrorProps;

    const onStateChange = jest.fn<void, [RemirrorStateListenerParams]>(params => {
      stateParams = params;
    });
    const mock = jest.fn((params: InjectedRemirrorProps) => {
      renderParams = params;
      return <div />;
    });
    const Component = ({ value }: { value?: EditorState | null }) => (
      <Remirror {...props} onStateChange={onStateChange} value={value}>
        {mock}
      </Remirror>
    );
    const { rerender, getByRole } = render(<Component value={null} />);

    renderParams.setContent(expectedContent, true);
    rerender(<Component value={null} />);
    expect(getByRole('textbox')).toContainHTML(initialContent);
    rerender(<Component value={stateParams.newState} />);
    expect(getByRole('textbox')).toContainHTML(expectedContent);
  });

  it('responds to direct value updates', () => {
    let stateParams!: RemirrorStateListenerParams;

    const onStateChange = jest.fn<void, [RemirrorStateListenerParams]>(params => {
      stateParams = params;
    });

    const Component = ({ value }: { value?: EditorState | null }) => (
      <Remirror {...props} onStateChange={onStateChange} value={value}>
        {() => <div />}
      </Remirror>
    );
    const { rerender, getByRole } = render(<Component value={null} />);

    const firstUpdate = '<p>First Update</p>';
    rerender(<Component value={stateParams.createStateFromContent(firstUpdate)} />);
    expect(getByRole('textbox')).toContainHTML(firstUpdate);

    const secondUpdate = '<p>Second Update</p>';
    rerender(<Component value={stateParams.createStateFromContent(secondUpdate)} />);
    expect(getByRole('textbox')).toContainHTML(secondUpdate);

    expect(onStateChange.mock.calls.every(call => call[0].tr === undefined)).toBeTrue();
  });

  it('responds to internal editor updates', () => {
    let latestState: EditorState | null = null;
    let renderParams!: InjectedRemirrorProps;

    const Component = () => {
      const [value, setValue] = useState<EditorState>();

      const onStateChange = (params: RemirrorStateListenerParams) => {
        latestState = params.newState;
        setValue(params.newState);
      };

      return (
        <Remirror {...props} onStateChange={onStateChange} value={value}>
          {(params: InjectedRemirrorProps) => {
            renderParams = params;
            return <div />;
          }}
        </Remirror>
      );
    };
    const { getByRole } = render(<Component />);
    expect(latestState).toBe(renderParams.state.newState);

    act(() => renderParams.view.dispatch(renderParams.state.newState.tr.insertText('Awesome')));
    expect(getByRole('textbox')).toHaveTextContent('Awesome');
  });

  it('responds to state overrides', () => {
    let renderParams!: InjectedRemirrorProps;

    const Component = () => {
      const [value, setValue] = useState<EditorState>();

      const onStateChange = (params: RemirrorStateListenerParams) => {
        if (params.getText().includes('World')) {
          setValue(params.newState);
        } else {
          const stateOverride = renderParams.manager.createState({
            content: expectedContent,
            stringHandler: fromHTML,
          });

          setValue(stateOverride);
        }
      };

      return (
        <Remirror {...props} onStateChange={onStateChange} value={value}>
          {(params: InjectedRemirrorProps) => {
            renderParams = params;
            return <div />;
          }}
        </Remirror>
      );
    };

    const { getByRole } = render(<Component />);

    act(() => renderParams.view.dispatch(renderParams.state.newState.tr.insertText('Awesome')));
    expect(getByRole('textbox')).toHaveTextContent('Awesome');
  });
});
