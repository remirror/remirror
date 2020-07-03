import { act, render } from '@testing-library/react';
import { RemirrorTestChain } from 'jest-remirror';
import React, { FC, useState } from 'react';

import {
  AnyCombinedUnion,
  EditorState,
  fromHtml,
  PlainExtension,
  SchemaFromCombined,
  StateUpdateLifecycleMethod,
} from '@remirror/core';

import { createReactManager } from '../../hooks/editor-hooks';
import { RemirrorContextProps } from '../../react-types';
import { ReactEditor } from '../react-editor';

const label = 'Remirror editor';

function create<Combined extends AnyCombinedUnion>(combined?: Combined[]) {
  const manager = createReactManager(combined ?? []);
  const chain = RemirrorTestChain.create(manager);

  return {
    manager,
    chain,
    doc: chain.nodes.doc,
    p: chain.nodes.paragraph,
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
      <ReactEditor {...props} value={value} manager={manager} onChange={onChange}>
        {() => <div />}
      </ReactEditor>,
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
      <ReactEditor
        {...props}
        manager={manager}
        initialContent='<p>Terrible</p>'
        value={value}
        onChange={onChange}
      >
        {() => <div />}
      </ReactEditor>,
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
        <ReactEditor
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
        </ReactEditor>
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
        <ReactEditor
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
        </ReactEditor>
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
        <ReactEditor {...props} value={editorState} manager={manager} onChange={jest.fn()}>
          {(context) => {
            ctx = context as any;
            return <div />;
          }}
        </ReactEditor>
      );
    };

    render(<Component editorState={value} />);

    expect(() => ctx.setContent('<p>Error</p>')).toThrowErrorMatchingSnapshot();
    expect(() => ctx.clearContent()).toThrowErrorMatchingSnapshot();
  });

  it('notifies extensions of state updates via `manager.onStateUpdate`', () => {
    const mock = jest.fn();

    class UpdateExtension extends PlainExtension {
      get name() {
        return 'update' as const;
      }

      onStateUpdate: StateUpdateLifecycleMethod = mock;
    }

    const { manager, props, chain, doc, p } = create([new UpdateExtension()]);

    const Component = () => {
      const [value, setValue] = useState<EditorState>(
        manager.createState({
          content: doc(p('some content')),
          stringHandler: fromHtml,
        }),
      );

      return (
        <ReactEditor
          {...props}
          value={value}
          manager={manager}
          onChange={(parameter) => {
            const { firstRender, state } = parameter;

            if (firstRender) {
              return;
            }

            setValue(state);
          }}
        >
          {() => <div />}
        </ReactEditor>
      );
    };

    render(<Component />);

    act(() => {
      chain.commands.insertText('First text update');
    });

    expect(mock).toHaveBeenCalledTimes(2);
    expect(mock.mock.calls[1][0].state).toBe(chain.state);
  });
});
