import { act, render } from '@testing-library/react';
import React, { useState } from 'react';

import { EditorState, fromHTML } from '@remirror/core';
import { createTestManager } from '@remirror/test-fixtures';

import { RenderEditor } from '..';
import { InjectedRenderEditorProps, RemirrorStateListenerParameter } from '../../react-types';
import { RemirrorProviderProps } from '../remirror-provider';

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
    const onStateChange = jest.fn<void, [RemirrorStateListenerParameter]>((params) => {
      value = params.newState;
    });
    render(
      <RenderEditor {...props} value={value} onStateChange={onStateChange}>
        {() => <div />}
      </RenderEditor>,
    );

    expect(onStateChange).toHaveBeenCalled();
    expect(value).not.toBeNull();
  });

  it('responds to setContent updates', () => {
    let stateParameter!: RemirrorStateListenerParameter;
    let renderParameter!: InjectedRenderEditorProps;

    const onStateChange = jest.fn<void, [RemirrorStateListenerParameter]>((params) => {
      stateParameter = params;
    });
    const mock = jest.fn((params: InjectedRenderEditorProps) => {
      renderParameter = params;
      return <div />;
    });
    const Component = ({ value }: { value?: EditorState | null }) => (
      <RenderEditor {...props} onStateChange={onStateChange} value={value}>
        {mock}
      </RenderEditor>
    );
    const { rerender, getByRole } = render(<Component value={null} />);

    renderParameter.setContent(expectedContent, true);
    rerender(<Component value={null} />);

    expect(getByRole('textbox')).toContainHTML(initialContent);

    rerender(<Component value={stateParameter.newState} />);

    expect(getByRole('textbox')).toContainHTML(expectedContent);
  });

  it('responds to direct value updates', () => {
    let stateParameter!: RemirrorStateListenerParameter;

    const onStateChange = jest.fn<void, [RemirrorStateListenerParameter]>((params) => {
      stateParameter = params;
    });

    const Component = ({ value }: { value?: EditorState | null }) => (
      <RenderEditor {...props} onStateChange={onStateChange} value={value}>
        {() => <div />}
      </RenderEditor>
    );
    const { rerender, getByRole } = render(<Component value={null} />);

    const firstUpdate = '<p>First Update</p>';
    rerender(<Component value={stateParameter.createStateFromContent(firstUpdate)} />);

    expect(getByRole('textbox')).toContainHTML(firstUpdate);

    const secondUpdate = '<p>Second Update</p>';
    rerender(<Component value={stateParameter.createStateFromContent(secondUpdate)} />);

    expect(getByRole('textbox')).toContainHTML(secondUpdate);

    expect(onStateChange.mock.calls.every((call) => call[0].tr === undefined)).toBeTrue();
  });

  it('responds to internal editor updates', () => {
    let latestState: EditorState | null = null;
    let renderParameter!: InjectedRenderEditorProps;

    const Component = () => {
      const [value, setValue] = useState<EditorState>();

      const onStateChange = (params: RemirrorStateListenerParameter) => {
        latestState = params.newState;
        setValue(params.newState);
      };

      return (
        <RenderEditor {...props} onStateChange={onStateChange} value={value}>
          {(params: InjectedRenderEditorProps) => {
            renderParameter = params;
            return <div />;
          }}
        </RenderEditor>
      );
    };
    const { getByRole } = render(<Component />);

    expect(latestState).toBe(renderParameter.state.newState);

    act(() =>
      renderParameter.view.dispatch(renderParameter.state.newState.tr.insertText('Awesome')),
    );

    expect(getByRole('textbox')).toHaveTextContent('Awesome');
  });

  it('responds to state overrides', () => {
    let renderParameter!: InjectedRenderEditorProps;

    const Component = () => {
      const [value, setValue] = useState<EditorState>();

      const onStateChange = (params: RemirrorStateListenerParameter) => {
        if (params.getText().includes('World')) {
          setValue(params.newState);
        } else {
          const stateOverride = renderParameter.manager.createState({
            content: expectedContent,
            stringHandler: fromHTML,
          });

          setValue(stateOverride);
        }
      };

      return (
        <RenderEditor {...props} onStateChange={onStateChange} value={value}>
          {(params: InjectedRenderEditorProps) => {
            renderParameter = params;
            return <div />;
          }}
        </RenderEditor>
      );
    };

    const { getByRole } = render(<Component />);

    act(() =>
      renderParameter.view.dispatch(renderParameter.state.newState.tr.insertText('Awesome')),
    );

    expect(getByRole('textbox')).toHaveTextContent('Awesome');
  });
});
