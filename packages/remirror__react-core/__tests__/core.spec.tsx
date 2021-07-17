import { axe } from 'jest-axe';
import { RemirrorTestChain } from 'jest-remirror';
import { useCallback, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { RemirrorEventListener } from 'remirror';
import { hideConsoleError, rafMock } from 'testing';
import { act, fireEvent, render, strictRender } from 'testing/react';
import {
  createReactManager,
  ReactExtensions,
  ReactFrameworkOutput,
  Remirror,
  useRemirror,
  useRemirrorContext,
} from '@remirror/react';

const textContent = `This is editor text`;
const label = 'Remirror editor';
const handlers = {
  onChange: jest.fn(),
  onBlur: jest.fn(),
  onFocus: jest.fn(),
};

test('should be called via a render prop', () => {
  const { getByLabelText } = strictRender(
    <Remirror manager={createReactManager([])} label={label} {...handlers} autoRender='start' />,
  );

  expect(handlers.onChange).toHaveBeenCalledWith(expect.any(Object));
  expect(handlers.onChange.mock.calls[0][0].helpers.getText()).toBe('');
  expect(handlers.onChange.mock.calls[0][0].helpers.getJSON().type).toBe('doc');
  expect(handlers.onChange.mock.calls[0][0].helpers.getStateJSON().doc.type).toBe('doc');
  expect(handlers.onChange.mock.calls[0][0].helpers.getHTML().type).toBeUndefined();

  const editorNode = getByLabelText(label);

  expect(editorNode).toHaveAttribute('role', 'textbox');
});

test('can `suppressHydrationWarning` without breaking', () => {
  const { getByLabelText } = strictRender(
    <Remirror
      manager={createReactManager([])}
      label={label}
      {...handlers}
      suppressHydrationWarning={true}
      autoRender='start'
    />,
  );

  expect(handlers.onChange).toHaveBeenCalledWith(expect.any(Object));
  expect(handlers.onChange.mock.calls[0][0].helpers.getText()).toBe('');
  expect(handlers.onChange.mock.calls[0][0].helpers.getJSON().type).toBe('doc');
  expect(handlers.onChange.mock.calls[0][0].helpers.getHTML().type).toBeUndefined();

  const editorNode = getByLabelText(label);

  expect(editorNode).toHaveAttribute('role', 'textbox');
});

describe('basic functionality', () => {
  hideConsoleError(true);

  it('is accessible', async () => {
    const results = await axe(
      renderToString(<Remirror manager={createReactManager([])} autoRender='start' />),
    );

    expect(results).toHaveNoViolations();
  });

  it('should allow text input and fire all handlers', () => {
    const setContent = jest.fn();

    const Component = () => {
      setContent.mockImplementation(useRemirrorContext().setContent);
      return null;
    };

    const { getByLabelText } = strictRender(
      <Remirror
        label={label}
        {...handlers}
        manager={createReactManager([], { stringHandler: 'html' })}
        autoRender='start'
      >
        <Component />
      </Remirror>,
    );

    act(() => {
      setContent(`<p>${textContent}</p>`, { triggerChange: true });
    });
    const editorNode = getByLabelText(label);

    expect(handlers.onChange).toHaveBeenCalledTimes(3);
    expect(handlers.onChange.mock.calls[0][0].helpers.getText()).toBe(textContent);
    expect(handlers.onChange.mock.calls[0][0].firstRender).toBe(true);
    expect(handlers.onChange.mock.calls[1][0].firstRender).toBe(false);

    fireEvent.blur(editorNode);
    expect(handlers.onBlur).toHaveBeenCalledTimes(1);

    fireEvent.focus(editorNode);
    expect(handlers.onFocus).toHaveBeenCalledTimes(1);
  });

  it('changes when the editable prop changes', () => {
    const manager = createReactManager([]);

    const El = ({ editable }: { editable: boolean }) => {
      return <Remirror editable={editable} label={label} manager={manager} autoRender='start' />;
    };

    const { rerender, getByLabelText } = strictRender(<El editable={true} />);
    expect(getByLabelText(label)).toHaveAttribute('contenteditable', 'true');

    rerender(<El editable={false} />);
    expect(getByLabelText(label)).toHaveAttribute('contenteditable', 'false');
  });
});

describe('initialContent', () => {
  it('should render with string content', () => {
    const { container } = strictRender(
      <Remirror
        label={label}
        {...handlers}
        manager={createReactManager([], { stringHandler: 'html' })}
        initialContent={'<p>Hello</p>'}
        autoRender='start'
      />,
    );

    expect(container.innerHTML).toInclude('Hello');
  });

  it('renders with json', () => {
    const content = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
    };

    const { container } = strictRender(
      <Remirror
        label={label}
        {...handlers}
        manager={createReactManager([])}
        initialContent={content}
        autoRender='start'
      />,
    );

    expect(container.innerHTML).toInclude('Hello');
  });
});

describe('focus', () => {
  const content = {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A sentence here' }] }],
  };

  let mock: ReturnType<typeof rafMock>;
  let context: ReactFrameworkOutput<Remirror.Extensions>;
  let editorNode: HTMLElement;

  const Component = () => {
    context = useRemirrorContext();
    return null;
  };

  beforeEach(() => {
    mock = rafMock();

    const { getByRole } = strictRender(
      <Remirror
        label={label}
        {...handlers}
        manager={createReactManager([])}
        initialContent={content}
        autoFocus={true}
        autoRender='start'
      >
        <Component />
      </Remirror>,
    );

    mock.flush();
    editorNode = getByRole('textbox');
  });

  afterEach(() => {
    mock.cleanup();
  });

  it('should do nothing when focusing on a focused editor without a new position', () => {
    expect(context.getState().selection.from).toBe(16);

    act(() => {
      context.commands.focus();
      mock.flush();
    });

    expect(context.getState().selection.from).toBe(16);
  });

  it('can focus on the `end`', () => {
    editorNode.blur();

    act(() => {
      context.commands.focus('end');
      mock.flush();
    });

    expect(context.getState().selection.from).toBe(16);
  });

  it('can focus on `all`', () => {
    editorNode.blur();

    act(() => {
      context.commands.focus('all');
      mock.flush();
    });

    expect(context.getState().selection.from).toBe(0);
    expect(context.getState().selection.to).toBe(17);
  });

  it('can focus on the `start` even when already focused', () => {
    act(() => {
      context.commands.focus('start');
      mock.flush();
    });

    expect(context.getState().selection.from).toBe(1);
  });

  it('can specify the exact position for the blurred editor', () => {
    editorNode.blur();

    act(() => {
      context.commands.focus(10);
      mock.flush();
    });

    expect(context.getState().selection.from).toBe(10);
  });

  const expected = { from: 2, to: 5 };

  it('can specify the selection for the editor', () => {
    editorNode.blur();

    act(() => {
      context.commands.focus(expected);
      mock.flush();
    });

    {
      const { from, to } = context.getState().selection;

      expect({ from, to }).toEqual(expected);
    }
  });

  it('can specify expected anchor and head for the editor editor', () => {
    const anchorHead = { anchor: 5, head: 2 };
    editorNode.blur();

    act(() => {
      context.commands.focus(anchorHead);
      mock.flush();
    });

    {
      const { from, to, head, anchor } = context.getState().selection;

      expect({ from, to, anchor, head }).toEqual({ ...anchorHead, ...expected });
    }
  });

  it('restores the previous selection when focused without a parameter', () => {
    editorNode.blur();

    act(() => {
      context.commands.focus(expected);
      mock.flush();
    });

    {
      const { from, to } = context.getState().selection;

      expect({ from, to }).toEqual(expected);
      expect(context.view.hasFocus()).toBeTrue();
    }

    editorNode.blur();

    act(() => {
      context.commands.focus();
      mock.flush();
    });

    {
      const { from, to } = context.getState().selection;

      expect({ from, to }).toEqual(expected);
      expect(context.view.hasFocus()).toBeTrue();
    }
  });

  it('should do nothing when passing `false`', () => {
    editorNode.blur();

    act(() => {
      context.commands.focus(false);
      mock.flush();
    });

    expect(context.getState().selection.from).toBe(16);
    expect(context.view.hasFocus()).toBeFalse();
  });
});

test('`focus` should be chainable', () => {
  const mock = rafMock();

  const manager = createReactManager([], { stringHandler: 'html' });
  const editor = RemirrorTestChain.create(manager);
  let context: ReactFrameworkOutput<Remirror.Extensions>;

  const TrapContext = () => {
    context = useRemirrorContext();
    return null;
  };

  const Component = () => {
    const [state, setState] = useState(() =>
      manager.createState({
        content: '<p>Content </p>',
        selection: 'end',
      }),
    );

    const onChange: RemirrorEventListener<ReactExtensions<never>> = useCallback(
      ({ state, firstRender }) => {
        if (firstRender) {
          return;
        }

        act(() => {
          setState(state);
        });
      },
      [],
    );

    return (
      <Remirror
        autoFocus={true}
        manager={manager}
        onChange={onChange}
        state={state}
        autoRender='start'
      >
        <TrapContext />
      </Remirror>
    );
  };

  const { getByRole } = strictRender(<Component />);
  const editorNode = getByRole('textbox');
  editorNode.blur();

  act(() => {
    editor.commands.insertText(' abc');
    context.commands.focus(1);
    mock.flush();
  });

  expect(editor.state.selection.from).toBe(1);
  expect(editor.view.hasFocus()).toBeTrue();
  expect(editor.innerHTML).toMatchInlineSnapshot(`
    <p>
      Content abc
    </p>
  `);

  mock.cleanup();
});

describe('onChange', () => {
  it('updates values', () => {
    const chain = RemirrorTestChain.create(createReactManager(() => []));
    const mock = jest.fn();

    const Component = () => {
      const { manager } = useRemirror({ extensions: chain.manager });
      const [state, setState] = useState(0);

      const onChange = () => {
        setState((value) => value + 1);
        mock(state);
      };

      return <Remirror manager={manager} onChange={onChange} />;
    };

    render(<Component />);

    for (const char of 'mazing!') {
      act(() => {
        chain.insertText(char);
      });
    }

    expect(mock).toHaveBeenCalledTimes(9);
    expect(mock).toHaveBeenLastCalledWith(8);
  });

  it('updates values in `StrictMode`', () => {
    const chain = RemirrorTestChain.create(createReactManager(() => []));
    const mock = jest.fn();

    const Component = () => {
      const { manager } = useRemirror({ extensions: chain.manager });
      const [state, setState] = useState(0);

      const onChange = () => {
        setState((value) => value + 1);
        mock(state);
      };

      return <Remirror manager={manager} onChange={onChange} />;
    };

    strictRender(<Component />);

    for (const char of 'mazing!') {
      act(() => {
        chain.insertText(char);
      });
    }

    expect(mock).toHaveBeenCalledTimes(9);
    expect(mock).toHaveBeenLastCalledWith(8);
  });
});
