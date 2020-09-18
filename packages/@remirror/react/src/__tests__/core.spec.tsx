import { axe } from 'jest-axe';
import { RemirrorTestChain } from 'jest-remirror';
import React, { useCallback, useState } from 'react';
import { renderToString } from 'react-dom/server';

import {
  AnyExtension,
  AnyPreset,
  CombinedUnion,
  fromHtml,
  RemirrorEventListener,
} from '@remirror/core';
import { hideConsoleError, rafMock } from '@remirror/testing';
import {
  act,
  createReactManager,
  fireEvent,
  RemirrorProvider,
  render,
  strictRender,
  useManager,
  useRemirror,
} from '@remirror/testing/react';

import type { ReactCombinedUnion, ReactFrameworkOutput } from '../react-types';

const textContent = `This is editor text`;
const label = 'Remirror editor';
const handlers = {
  onChange: jest.fn(),
  onBlur: jest.fn(),
  onFocus: jest.fn(),
};

test('should be called via a render prop', () => {
  const { getByLabelText } = strictRender(
    <RemirrorProvider
      manager={createReactManager([])}
      label={label}
      {...handlers}
      autoRender='start'
    />,
  );

  expect(handlers.onChange).toHaveBeenCalledWith(expect.any(Object));
  expect(handlers.onChange.mock.calls[0][0].getText()).toBe('');
  expect(handlers.onChange.mock.calls[0][0].getJSON().doc.type).toBe('doc');
  expect(handlers.onChange.mock.calls[0][0].getHTML().type).toBeUndefined();

  const editorNode = getByLabelText(label);

  expect(editorNode).toHaveAttribute('role', 'textbox');
});

test('can `suppressHydrationWarning` without breaking', () => {
  const { getByLabelText } = strictRender(
    <RemirrorProvider
      manager={createReactManager([])}
      label={label}
      {...handlers}
      suppressHydrationWarning={true}
      autoRender='start'
    />,
  );

  expect(handlers.onChange).toHaveBeenCalledWith(expect.any(Object));
  expect(handlers.onChange.mock.calls[0][0].getText()).toBe('');
  expect(handlers.onChange.mock.calls[0][0].getJSON().doc.type).toBe('doc');
  expect(handlers.onChange.mock.calls[0][0].getHTML().type).toBeUndefined();

  const editorNode = getByLabelText(label);

  expect(editorNode).toHaveAttribute('role', 'textbox');
});

describe('basic functionality', () => {
  hideConsoleError(true);

  it('is accessible', async () => {
    const results = await axe(
      renderToString(<RemirrorProvider manager={createReactManager([])} autoRender='start' />),
    );

    expect(results).toHaveNoViolations();
  });

  it('should allow text input and fire all handlers', () => {
    const setContent = jest.fn();

    const Component = () => {
      setContent.mockImplementation(useRemirror().setContent);
      return null;
    };

    const { getByLabelText } = strictRender(
      <RemirrorProvider
        label={label}
        {...handlers}
        manager={createReactManager([])}
        stringHandler={fromHtml}
        autoRender='start'
      >
        <Component />
      </RemirrorProvider>,
    );

    act(() => {
      setContent(`<p>${textContent}</p>`, { triggerChange: true });
    });
    const editorNode = getByLabelText(label);

    expect(handlers.onChange).toHaveBeenCalledTimes(2);
    expect(handlers.onChange.mock.calls[0][0].getText()).toBe(textContent);
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
      return (
        <RemirrorProvider editable={editable} label={label} manager={manager} autoRender='start' />
      );
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
      <RemirrorProvider
        label={label}
        {...handlers}
        manager={createReactManager([])}
        initialContent={'<p>Hello</p>'}
        stringHandler={fromHtml}
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
      <RemirrorProvider
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
  let context: ReactFrameworkOutput<any>;
  let editorNode: HTMLElement;

  const Component = () => {
    context = useRemirror();
    return null;
  };

  beforeEach(() => {
    mock = rafMock();

    const { getByRole } = strictRender(
      <RemirrorProvider
        label={label}
        {...handlers}
        manager={createReactManager([])}
        initialContent={content}
        autoFocus={true}
        autoRender='start'
      >
        <Component />
      </RemirrorProvider>,
    );

    mock.flush();
    editorNode = getByRole('textbox');
  });

  afterEach(() => {
    mock.cleanup();
  });

  it('should do nothing when focusing on a focused editor without a new position', () => {
    expect(context.getState().selection.from).toBe(1);

    act(() => {
      context.focus();
      mock.flush();
    });

    expect(context.getState().selection.from).toBe(1);
  });

  it('can focus on the `end`', () => {
    editorNode.blur();

    act(() => {
      context.focus('end');
      mock.flush();
    });

    expect(context.getState().selection.from).toBe(16);
  });

  it('can focus on `all`', () => {
    editorNode.blur();

    act(() => {
      context.focus('all');
      mock.flush();
    });

    expect(context.getState().selection.from).toBe(0);
    expect(context.getState().selection.to).toBe(17);
  });

  it('can focus on the `start` even when already focused', () => {
    act(() => {
      context.focus('start');
      mock.flush();
    });

    expect(context.getState().selection.from).toBe(1);
  });

  it('can specify the exact position for the blurred editor', () => {
    editorNode.blur();

    act(() => {
      context.focus(10);
      mock.flush();
    });

    expect(context.getState().selection.from).toBe(10);
  });

  const expected = { from: 2, to: 5 };

  it('can specify the selection for the editor', () => {
    editorNode.blur();

    act(() => {
      context.focus(expected);
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
      context.focus(anchorHead);
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
      context.focus(expected);
      mock.flush();
    });

    {
      const { from, to } = context.getState().selection;

      expect({ from, to }).toEqual(expected);
      expect(context.view.hasFocus()).toBeTrue();
    }

    editorNode.blur();

    act(() => {
      context.focus();
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
      context.focus(false);
      mock.flush();
    });

    expect(context.getState().selection.from).toBe(1);
    expect(context.view.hasFocus()).toBeFalse();
  });
});

test('`focus` should be chainable', () => {
  const mock = rafMock();

  const manager = createReactManager([]);
  const editor = RemirrorTestChain.create(manager);
  let context: ReactFrameworkOutput<CombinedUnion<AnyExtension, AnyPreset>>;

  const TrapContext = () => {
    context = useRemirror();

    return null;
  };

  const Component = () => {
    const [value, setValue] = useState(() =>
      manager.createState({
        content: '<p>Content </p>',
        selection: 'end',
        stringHandler: fromHtml,
      }),
    );

    const onChange: RemirrorEventListener<ReactCombinedUnion<never>> = useCallback(
      ({ state, firstRender }) => {
        if (firstRender) {
          return;
        }

        act(() => {
          setValue(state);
        });
      },
      [],
    );

    return (
      <RemirrorProvider
        autoFocus={true}
        manager={manager}
        onChange={onChange}
        value={value}
        autoRender='start'
      >
        <TrapContext />
      </RemirrorProvider>
    );
  };

  const { getByRole } = strictRender(<Component />);
  const editorNode = getByRole('textbox');
  editorNode.blur();

  act(() => {
    editor.commands.insertText(' abc');
    context.focus(1);
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
  const chain = RemirrorTestChain.create(createReactManager(() => []));
  const mock = jest.fn();

  const Component = () => {
    const manager = useManager(chain.manager);
    const [state, setState] = useState(0);

    const onChange = () => {
      setState((value) => value + 1);
      mock(state);
    };

    return (
      <RemirrorProvider manager={manager} onChange={onChange}>
        <TextEditor />
      </RemirrorProvider>
    );
  };

  const TextEditor = () => {
    const { getRootProps } = useRemirror();

    return (
      <>
        <div {...getRootProps()} />
      </>
    );
  };

  beforeEach(() => {
    mock.mockClear();
  });

  it('updates values', () => {
    render(<Component />);

    for (const char of 'mazing!') {
      act(() => {
        chain.insertText(char);
      });
    }

    expect(mock).toHaveBeenCalledTimes(8);
    expect(mock).toHaveBeenLastCalledWith(7);
  });

  it('updates values in `StrictMode`', () => {
    strictRender(<Component />);

    for (const char of 'mazing!') {
      act(() => {
        chain.insertText(char);
      });
    }

    expect(mock).toHaveBeenCalledTimes(8);
    expect(mock).toHaveBeenLastCalledWith(7);
  });
});
