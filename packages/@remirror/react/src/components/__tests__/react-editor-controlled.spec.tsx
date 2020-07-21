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
import { act, render } from '@remirror/testing/react';

import { createReactManager } from '../../react-helpers';
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

let errorSpy = jest.spyOn(console, 'error');

beforeEach(() => {
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockRestore();
});

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

    expect(chain.dom).toMatchSnapshot();
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
            setValue(parameter.state);
          }}
        >
          {() => <div />}
        </ReactEditor>
      );
    };

    render(<Component />);

    act(() => {
      chain.dispatchCommand(({ dispatch, tr }) => dispatch(tr.insertText('add more value ')));
    });

    expect(chain.dom).toMatchSnapshot();
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
            const { createStateFromContent, getText } = parameter;

            setValue(createStateFromContent(`<p>Hello</p><p>${getText()}</p>`));
          }}
        >
          {() => <div />}
        </ReactEditor>
      );
    };

    render(<Component />);

    act(() => {
      chain.dispatchCommand(({ dispatch, tr }) => dispatch(tr.insertText('add more value ')));
    });

    expect(chain.dom).toMatchSnapshot();
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

  it('throws when switching from controlled to non-controlled', () => {
    const { manager, props } = create();

    const value = manager.createState({
      content: '<p>some content</p>',
      stringHandler: fromHtml,
    });

    const set = jest.fn();

    const Component = () => {
      const [state, setState] = useState(value);
      set.mockImplementation(setState);

      return (
        <ReactEditor {...props} value={state} manager={manager} onChange={jest.fn()}>
          {() => <div />}
        </ReactEditor>
      );
    };

    render(<Component />);

    expect(() =>
      act(() => {
        set();
      }),
    ).toThrowErrorMatchingSnapshot();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('throws when switching from non-controlled to controlled', () => {
    const { manager, props } = create();

    const value = manager.createState({
      content: '<p>some content</p>',
      stringHandler: fromHtml,
    });

    const set = jest.fn();

    const Component = () => {
      const [state, setState] = useState();
      set.mockImplementation(setState);

      return (
        <ReactEditor {...props} value={state} manager={manager} onChange={jest.fn()}>
          {() => <div />}
        </ReactEditor>
      );
    };

    render(<Component />);

    expect(() =>
      act(() => {
        set(value);
      }),
    ).toThrowErrorMatchingSnapshot();
    expect(errorSpy).toHaveBeenCalled();
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
            const { state } = parameter;

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

    const { state, previousState } = mock.mock.calls[1][0];

    expect(state).toBe(chain.state);
    expect(state).not.toBe(previousState);
  });
});
