import { RemirrorTestChain } from 'jest-remirror';
import { FC, useState } from 'react';
import {
  AnyExtension,
  EditorState,
  PlainExtension,
  RemirrorEventListener,
  StateUpdateLifecycleProps,
} from 'remirror';
import { BoldExtension, ItalicExtension } from 'remirror/extensions';
import { act, fireEvent, render, strictRender } from 'testing/react';
import { useRemirror } from '@remirror/react';

import type { ReactExtensions } from '../';
import { createReactManager, Remirror, useRemirrorContext } from '../';

const label = 'Remirror editor';
const props = { label, stringHandler: 'text' as const };

function create<Extension extends AnyExtension>(
  extensions: Extension[] = [],
): RemirrorTestChain<ReactExtensions<Extension>> {
  return RemirrorTestChain.create(createReactManager(extensions, { stringHandler: 'html' }));
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
    const { manager } = create();

    const value = manager.createState({
      content: '<p>This is the initial value</p>',
    });
    const onChange = jest.fn();

    const { getByRole } = strictRender(
      <Remirror
        {...props}
        state={value}
        manager={manager}
        onChange={onChange}
        autoRender='start'
      />,
    );

    expect(getByRole('textbox')).toMatchSnapshot();

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange.mock.calls[0][0].firstRender).toBeTrue();
  });

  it('overrides initial content', () => {
    const chain = create();

    const value = chain.manager.createState({
      content: '<p>Not terrible</p>',
    });
    const onChange = jest.fn();

    strictRender(
      <Remirror
        {...props}
        manager={chain.manager}
        initialContent='<p>Terrible</p>'
        state={value}
        onChange={onChange}
        autoRender='start'
      />,
    );

    expect(chain.dom).toMatchSnapshot();
  });

  it('updates with the editable prop', () => {
    const chain = create();

    const value = chain.manager.createState({
      content: '<p>Not terrible</p>',
    });
    const onChange = jest.fn();

    const { rerender } = strictRender(
      <Remirror
        {...props}
        manager={chain.manager}
        state={value}
        onChange={onChange}
        autoRender='start'
        editable
      />,
    );

    expect(chain.dom.getAttribute('contenteditable')).toBe('true');

    rerender(
      <Remirror
        {...props}
        manager={chain.manager}
        state={value}
        onChange={onChange}
        autoRender='start'
        editable={false}
      />,
    );

    expect(chain.dom.getAttribute('contenteditable')).toBe('false');
  });

  it('responds to updates to the editor state', () => {
    const chain = create();

    const Component = () => {
      const [value, setValue] = useState<EditorState>(
        chain.manager.createState({
          content: '<p>some content</p>',

          selection: 'start',
        }),
      );

      return (
        <Remirror
          {...props}
          state={value}
          manager={chain.manager}
          onChange={(changeProps) => {
            setValue(changeProps.state);
          }}
          autoRender='start'
        />
      );
    };

    strictRender(<Component />);

    act(() => {
      chain.dispatchCommand(({ dispatch, tr }) => dispatch(tr.insertText('add more value ')));
    });

    expect(chain.dom).toMatchSnapshot();
  });

  it('can override updates to the editor state', () => {
    const chain = create();

    const Component = () => {
      const [state, setState] = useState<EditorState>(
        chain.manager.createState({
          content: '<p>some content</p>',
          selection: 'start',
        }),
      );

      return (
        <Remirror
          {...props}
          state={state}
          manager={chain.manager}
          onChange={(changeProps) => {
            const { createStateFromContent, helpers, state } = changeProps;
            setState(
              createStateFromContent(`<p>Hello</p><p>${helpers.getText({ state })}</p>`, 'start'),
            );
          }}
          autoRender='start'
        />
      );
    };

    strictRender(<Component />);

    act(() => {
      chain.dispatchCommand(({ dispatch, tr }) => dispatch(tr.insertText('add more value ')));
    });

    expect(chain.dom).toMatchSnapshot();
  });

  it('throws when switching from controlled to non-controlled', () => {
    const { manager } = create();

    const value = manager.createState({
      content: '<p>some content</p>',
    });

    const set = jest.fn();

    const Component = () => {
      const [state, setState] = useState(value);
      set.mockImplementation(setState);

      return (
        <Remirror
          {...props}
          state={state}
          manager={manager}
          onChange={jest.fn()}
          autoRender='start'
        />
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
    const { manager } = create();

    const value = manager.createState({
      content: '<p>some content</p>',
    });

    const set = jest.fn();

    const Component = () => {
      const [state, setState] = useState();
      set.mockImplementation(setState);

      return (
        <Remirror
          {...props}
          state={state}
          manager={manager}
          onChange={jest.fn()}
          autoRender='start'
        />
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

      onStateUpdate: (update: StateUpdateLifecycleProps) => void = mock;
    }

    const chain = create([new UpdateExtension()]);

    const { doc, p } = chain.nodes;

    const Component = () => {
      const [value, setValue] = useState<EditorState>(() =>
        chain.manager.createState({
          content: doc(p('some content')),

          selection: 'end',
        }),
      );

      return (
        <Remirror
          {...props}
          state={value}
          manager={chain.manager}
          onChange={(changeProps) => {
            const { state } = changeProps;

            setValue(state);
          }}
          autoRender='start'
        />
      );
    };

    strictRender(<Component />);

    act(() => {
      chain.commands.insertText('First text update');
    });

    expect(mock).toHaveBeenCalledTimes(3);
    const { state, previousState } = mock.mock.calls[2][0];

    expect(state).toBe(chain.state);
    expect(state).not.toBe(previousState);
  });
});

test('can run multiple commands', () => {
  const chain = create([new BoldExtension(), new ItalicExtension()]);
  const { manager, nodes, marks } = chain;
  const { doc, p } = nodes;
  const { bold, italic } = marks;

  const InnerComponent: FC = () => {
    const { getRootProps, commands } = useRemirrorContext();

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
      }),
    );

    return (
      <Remirror
        {...props}
        state={value}
        manager={manager}
        onChange={(changeProps) => {
          const { state } = changeProps;
          setValue(state);
        }}
      >
        <InnerComponent />
      </Remirror>
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
  const chain = create([]);
  const { manager, nodes } = chain;
  const { doc, p } = nodes;

  const InnerComponent: FC = () => {
    const { getRootProps, view } = useRemirrorContext();

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
      }),
    );

    return (
      <Remirror
        {...props}
        state={value}
        manager={manager}
        onChange={(changeProps) => {
          const { state } = changeProps;
          setValue(state);
        }}
      >
        <InnerComponent />
      </Remirror>
    );
  };

  const { getByRole } = strictRender(<Component />);

  act(() => {
    fireEvent.click(getByRole('button'));
  });

  expect(chain.state.doc).toEqualRemirrorDocument(doc(p('b')));
});

test('support for rendering a nested controlled editor in strict mode', () => {
  const chain = RemirrorTestChain.create(
    createReactManager(() => [new BoldExtension()], { stringHandler: 'html' }),
  );

  const Component = () => {
    const { manager, state, onChange } = useRemirror({
      extensions: chain.manager,
      content: '<p>test</p>',
      selection: 'all',
    });

    return (
      <Remirror manager={manager} onChange={onChange} state={state}>
        <div id='1'>
          <TextEditor />
        </div>
      </Remirror>
    );
  };

  const TextEditor = () => {
    const { getRootProps, active, commands } = useRemirrorContext<BoldExtension>({
      autoUpdate: true,
    });

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
  let chain = RemirrorTestChain.create(createReactManager([], { stringHandler: 'html' }));
  const mock = jest.fn();

  const Component = () => {
    const { manager, state, setState } = useRemirror({
      extensions: chain.manager,
      content: '<p>A</p>',
      selection: 'end',
    });

    const onChange: RemirrorEventListener<AnyExtension> = ({ state }) => {
      setState(state);
      mock(state.doc.textContent);
    };

    return <Remirror manager={manager} onChange={onChange} state={state} autoRender={true} />;
  };

  beforeEach(() => {
    chain = RemirrorTestChain.create(createReactManager([], { stringHandler: 'html' }));
    mock.mockClear();
  });

  it('updates values', () => {
    render(<Component />);

    for (const char of 'mazing!') {
      act(() => {
        chain.insertText(char);
      });
    }

    expect(mock).toHaveBeenCalledTimes(9);
    expect(mock).toHaveBeenLastCalledWith('Amazing!');
  });

  it('updates values in `StrictMode`', () => {
    strictRender(<Component />);

    for (const char of 'mazing!') {
      act(() => {
        chain.insertText(char);
      });
    }

    expect(mock).toHaveBeenCalledTimes(9);
    expect(mock).toHaveBeenLastCalledWith('Amazing!');
  });
});
