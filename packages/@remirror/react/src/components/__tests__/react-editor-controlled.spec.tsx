import { RemirrorTestChain } from 'jest-remirror';
import React, { FC, useState } from 'react';

import {
  AnyCombinedUnion,
  AnyExtension,
  EditorState,
  fromHtml,
  PlainExtension,
  RemirrorEventListener,
  SchemaFromCombined,
  StateUpdateLifecycleParameter,
} from '@remirror/core';
import { BoldExtension, ItalicExtension } from '@remirror/testing';
import { act, fireEvent, render, strictRender } from '@remirror/testing/react';

import { useManager, useRemirror } from '../../hooks';
import { createReactManager } from '../../react-helpers';
import type { RemirrorContextProps } from '../../react-types';
import { RemirrorProvider } from '../providers';
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

    const { getByRole } = strictRender(
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

    strictRender(
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

    strictRender(<Component />);

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

    strictRender(<Component />);

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

    strictRender(<Component editorState={value} />);

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

    strictRender(<Component />);

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

    strictRender(<Component />);

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

      onStateUpdate: (update: StateUpdateLifecycleParameter) => void = mock;
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

    strictRender(<Component />);

    act(() => {
      chain.commands.insertText('First text update');
    });

    expect(mock).toHaveBeenCalledTimes(4);

    const { state, previousState } = mock.mock.calls[3][0];

    expect(state).toBe(chain.state);
    expect(state).not.toBe(previousState);
  });
});

test('can run multiple commands', () => {
  const { manager, props, chain, doc, p } = create([new BoldExtension(), new ItalicExtension()]);
  const { bold, italic } = chain.marks;

  const InnerComponent: FC = () => {
    const { getRootProps, commands } = useRemirror<BoldExtension | ItalicExtension>();

    return (
      <div>
        <div data-testid='target' {...getRootProps()} />
        <button
          onClick={() => {
            commands.toggleBold();
            commands.toggleItalic();
          }}
        />
      </div>
    );
  };

  const Component = () => {
    const [value, setValue] = useState<EditorState>(
      manager.createState({
        content: '',
        stringHandler: fromHtml,
      }),
    );

    return (
      <RemirrorProvider
        {...props}
        value={value}
        manager={manager}
        onChange={(parameter) => {
          const { state } = parameter;
          setValue(state);
        }}
      >
        <InnerComponent />
      </RemirrorProvider>
    );
  };

  const { getByRole } = strictRender(<Component />);

  act(() => {
    chain.commands.insertText('This');
  });

  act(() => {
    chain.selectText('all');
  });

  act(() => {
    fireEvent.click(getByRole('button'));
  });

  expect(chain.state.doc).toEqualRemirrorDocument(doc(p(bold(italic('This')))));
});

test('NOTE: this test is to show that synchronous state updates only show the most recent state update', () => {
  const { manager, props, chain, doc, p } = create([]);

  const InnerComponent: FC = () => {
    const { getRootProps, view } = useRemirror();

    return (
      <div>
        <div data-testid='target' {...getRootProps()} />
        <button
          onClick={() => {
            // TWO UPDATES
            view.dispatch(view.state.tr.insertText('a'));
            view.dispatch(view.state.tr.insertText('b'));
          }}
        />
      </div>
    );
  };

  const Component = () => {
    const [value, setValue] = useState<EditorState>(
      manager.createState({
        content: '',
        stringHandler: fromHtml,
      }),
    );

    return (
      <RemirrorProvider
        {...props}
        value={value}
        manager={manager}
        onChange={(parameter) => {
          const { state } = parameter;
          setValue(state);
        }}
      >
        <InnerComponent />
      </RemirrorProvider>
    );
  };

  const { getByRole } = strictRender(<Component />);

  act(() => {
    fireEvent.click(getByRole('button'));
  });

  expect(chain.state.doc).toEqualRemirrorDocument(doc(p('b')));
});

test('support for rendering a nested controlled editor in strict mode', () => {
  const chain = RemirrorTestChain.create(createReactManager(() => [new BoldExtension()]));

  const Component = () => {
    const manager = useManager(chain.manager);

    const [value, setValue] = useState(
      manager.createState({
        content: '<p>test</p>',
        selection: 'all',
        stringHandler: fromHtml,
      }),
    );

    const onChange: RemirrorEventListener<AnyExtension> = ({ state }) => {
      setValue(state);
    };

    return (
      <RemirrorProvider manager={manager} onChange={onChange} value={value}>
        <div id='1'>
          <TextEditor />
        </div>
      </RemirrorProvider>
    );
  };

  const TextEditor = () => {
    const { getRootProps, active, commands } = useRemirror<BoldExtension>({ autoUpdate: true });

    return (
      <>
        <div {...getRootProps()} />
        <button
          onClick={() => commands.toggleBold()}
          style={{ fontWeight: active.bold() ? 'bold' : undefined }}
        />
      </>
    );
  };

  const { getByRole } = strictRender(<Component />);
  const button = getByRole('button');

  act(() => {
    fireEvent.click(button);
  });

  expect(button).toHaveStyle('font-weight: bold');

  act(() => {
    fireEvent.click(getByRole('button'));
  });

  expect(button).not.toHaveStyle('font-weight: bold');
});

describe('onChange', () => {
  const chain = RemirrorTestChain.create(createReactManager(() => [new BoldExtension()]));
  const mock = jest.fn();

  const Component = () => {
    const manager = useManager(chain.manager);

    const [value, setValue] = useState(
      manager.createState({
        content: '<p>A</p>',
        selection: 'end',
        stringHandler: fromHtml,
      }),
    );

    const onChange: RemirrorEventListener<AnyExtension> = ({ state }) => {
      setValue(state);
      mock(value.doc.textContent);
    };

    return (
      <RemirrorProvider manager={manager} onChange={onChange} value={value}>
        <TextEditor />
      </RemirrorProvider>
    );
  };

  const TextEditor = () => {
    const { getRootProps } = useRemirror<BoldExtension>();

    return (
      <>
        <div {...getRootProps()} />
      </>
    );
  };

  it('updates values', () => {
    render(<Component />);

    for (const char of 'mazing!') {
      act(() => {
        chain.insertText(char);
      });
    }

    expect(mock).toHaveBeenCalledTimes(8);
    expect(mock).toHaveBeenLastCalledWith('Amazing');
  });

  it('updates values in `StrictMode`', () => {
    strictRender(<Component />);

    for (const char of 'mazing!') {
      act(() => {
        chain.insertText(char);
      });
    }

    expect(mock).toHaveBeenCalledTimes(8);
    expect(mock).toHaveBeenLastCalledWith('Amazing');
  });
});
