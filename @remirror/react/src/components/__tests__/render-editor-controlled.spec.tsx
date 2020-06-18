import { act, render } from '@testing-library/react';
import { RemirrorTestChain } from 'jest-remirror';
import React, { FC, useState } from 'react';

import { EditorState, fromHtml, SchemaFromCombined } from '@remirror/core';

import { createReactManager } from '../../hooks/editor-hooks';
import { RemirrorContextProps } from '../../react-types';
import { RenderEditor } from '../render-editor';

const label = 'Remirror editor';

function create() {
  const manager = createReactManager([]);
  const chain = RemirrorTestChain.create(manager);

  return {
    manager,
    chain,
    props: {
      label,
      stringHandler: fromHtml,
    },
  };
}

describe('Remirror Controlled Component', () => {
  it('should set the initial value', () => {
    const { manager, props } = create();

    const value = manager.createState({
      content: '<p>This is the initial value</p>',
      stringHandler: fromHtml,
    });
    const onChange = jest.fn();

    const { getByRole } = render(
      <RenderEditor {...props} value={value} manager={manager} onChange={onChange}>
        {() => <div />}
      </RenderEditor>,
    );

    expect(getByRole('textbox')).toMatchSnapshot();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].firstRender).toBeTrue();
  });

  it('overrides initial content', () => {
    const { manager, props, chain } = create();

    const value = manager.createState({
      content: '<p>Not terrible</p>',
      stringHandler: fromHtml,
    });
    const onChange = jest.fn();

    render(
      <RenderEditor
        {...props}
        manager={manager}
        initialContent='<p>Terrible</p>'
        value={value}
        onChange={onChange}
      >
        {() => <div />}
      </RenderEditor>,
    );

    expect(chain.view.dom).toMatchSnapshot();
  });

  it('responds to updates to the editor state', () => {
    const { manager, props, chain } = create();

    const Component = () => {
      const [value, setValue] = useState<EditorState>(
        manager.createState({
          content: '<p>some content</p>',
          stringHandler: fromHtml,
        }),
      );

      return (
        <RenderEditor
          {...props}
          value={value}
          manager={manager}
          onChange={(parameter) => {
            if (parameter.firstRender) {
              return;
            }

            setValue(parameter.state);
          }}
        >
          {() => <div />}
        </RenderEditor>
      );
    };

    const { rerender } = render(<Component />);

    act(() => {
      chain.dispatchCommand(({ dispatch, tr }) => dispatch(tr.insertText('add more value ')));
    });

    rerender(<Component />);

    expect(chain.view.dom).toMatchSnapshot();
  });

  it('can override updates to the editor state', () => {
    const { manager, props, chain } = create();

    const Component = () => {
      const [value, setValue] = useState<EditorState>(
        manager.createState({
          content: '<p>some content</p>',
          stringHandler: fromHtml,
        }),
      );

      return (
        <RenderEditor
          {...props}
          value={value}
          manager={manager}
          onChange={(parameter) => {
            const { firstRender, createStateFromContent, getText } = parameter;

            if (firstRender) {
              return;
            }

            setValue(createStateFromContent(`<p>Hello</p><p>${getText()}</p>`));
          }}
        >
          {() => <div />}
        </RenderEditor>
      );
    };

    const { rerender } = render(<Component />);

    act(() => {
      chain.dispatchCommand(({ dispatch, tr }) => dispatch(tr.insertText('add more value ')));
    });

    rerender(<Component />);

    expect(chain.view.dom).toMatchSnapshot();
  });

  it('throws when using  `setContent` updates', () => {
    const { manager, props } = create();

    const value = manager.createState({
      content: '<p>some content</p>',
      stringHandler: fromHtml,
    });

    let ctx: RemirrorContextProps<typeof manager['~EP']>;

    const Component: FC<{
      editorState: EditorState<SchemaFromCombined<typeof manager['~EP']>>;
    }> = ({ editorState }) => {
      return (
        <RenderEditor {...props} value={editorState} manager={manager} onChange={jest.fn()}>
          {(context) => {
            ctx = context as any;
            return <div />;
          }}
        </RenderEditor>
      );
    };

    render(<Component editorState={value} />);

    expect(() => ctx.setContent('<p>Error</p>')).toThrowErrorMatchingSnapshot();
    expect(() => ctx.clearContent()).toThrowErrorMatchingSnapshot();
  });
});
