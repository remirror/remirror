import { axe } from 'jest-axe';
import React from 'react';
import { renderToString } from 'react-dom/server';

import { AnyCombinedUnion, fromHtml } from '@remirror/core';
import { act, createReactManager, fireEvent, strictRender } from '@remirror/testing/react';

import type { RemirrorContextProps } from '../../react-types';
import { ReactEditor } from '../react-editor';

const textContent = `This is editor text`;
const label = 'Remirror editor';
const handlers = {
  onChange: jest.fn(),
  onBlur: jest.fn(),
  onFocus: jest.fn(),
};

test('should be called via a render prop', () => {
  const mock = jest.fn(() => <div />);
  const { getByLabelText } = strictRender(
    <ReactEditor manager={createReactManager([])} label={label} {...handlers}>
      {mock}
    </ReactEditor>,
  );

  expect(mock).toHaveBeenCalledWith(expect.any(Object));
  expect(handlers.onChange).toHaveBeenCalledWith(expect.any(Object));
  expect(handlers.onChange.mock.calls[0][0].getText()).toBe('');
  expect(handlers.onChange.mock.calls[0][0].getJSON().doc.type).toBe('doc');
  expect(handlers.onChange.mock.calls[0][0].getHTML().type).toBeUndefined();

  const editorNode = getByLabelText(label);

  expect(editorNode).toHaveAttribute('role', 'textbox');
});

test('can `suppressHydrationWarning` without breaking', () => {
  const mock = jest.fn(() => <div />);
  const { getByLabelText } = strictRender(
    <ReactEditor
      manager={createReactManager([])}
      label={label}
      {...handlers}
      suppressHydrationWarning={true}
    >
      {mock}
    </ReactEditor>,
  );

  expect(mock).toHaveBeenCalledWith(expect.any(Object));
  expect(handlers.onChange).toHaveBeenCalledWith(expect.any(Object));
  expect(handlers.onChange.mock.calls[0][0].getText()).toBe('');
  expect(handlers.onChange.mock.calls[0][0].getJSON().doc.type).toBe('doc');
  expect(handlers.onChange.mock.calls[0][0].getHTML().type).toBeUndefined();

  const editorNode = getByLabelText(label);

  expect(editorNode).toHaveAttribute('role', 'textbox');
});

describe('basic functionality', () => {
  it('is accessible', async () => {
    const results = await axe(
      renderToString(<ReactEditor manager={createReactManager([])}>{() => <div />}</ReactEditor>),
    );

    expect(results).toHaveNoViolations();
  });

  it("doesn't render the editor without `children` as a render prop", () => {
    expect(() =>
      // @ts-expect-error
      strictRender(<ReactEditor label={label} manager={createReactManager([])} />),
    ).toMatchSnapshot();
  });

  it('should allow text input and fire all handlers', () => {
    let setContent: RemirrorContextProps<AnyCombinedUnion>['setContent'] = jest.fn();
    const mock = jest.fn((value: RemirrorContextProps<AnyCombinedUnion>) => {
      setContent = value.setContent;
      return <div />;
    });

    const { getByLabelText } = strictRender(
      <ReactEditor
        label={label}
        {...handlers}
        manager={createReactManager([])}
        stringHandler={fromHtml}
      >
        {mock}
      </ReactEditor>,
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
    const mock = jest.fn(() => <div />);
    const manager = createReactManager([]);

    const El = ({ editable }: { editable: boolean }) => {
      return (
        <ReactEditor editable={editable} label={label} manager={manager}>
          {mock}
        </ReactEditor>
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
      <ReactEditor
        label={label}
        {...handlers}
        manager={createReactManager([])}
        initialContent={'<p>Hello</p>'}
        stringHandler={fromHtml}
      >
        {() => <div />}
      </ReactEditor>,
    );

    expect(container.innerHTML).toInclude('Hello');
  });

  it('renders with json', () => {
    const content = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
    };

    const { container } = strictRender(
      <ReactEditor
        label={label}
        {...handlers}
        manager={createReactManager([])}
        initialContent={content}
      >
        {() => <div />}
      </ReactEditor>,
    );

    expect(container.innerHTML).toInclude('Hello');
  });
});

describe('focus', () => {
  const content = {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A sentence here' }] }],
  };

  let context!: RemirrorContextProps<any>;
  let editorNode: HTMLElement;

  beforeEach(() => {
    jest.useFakeTimers();
    const { getByRole } = strictRender(
      <ReactEditor
        label={label}
        {...handlers}
        manager={createReactManager([])}
        initialContent={content}
        autoFocus={true}
      >
        {(ctx) => {
          context = ctx;
          return <div />;
        }}
      </ReactEditor>,
    );

    editorNode = getByRole('textbox');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should do nothing when focusing on a focused editor without a new position', () => {
    expect(context.getState().selection.from).toBe(1);

    act(() => {
      context.focus();
      jest.runAllTimers();
    });

    expect(context.getState().selection.from).toBe(1);
  });

  it('can focus on the `end`', () => {
    fireEvent.blur(editorNode);

    act(() => {
      context.focus('end');
      jest.runAllTimers();
    });

    expect(context.getState().selection.from).toBe(16);
  });

  it('can focus on `all`', () => {
    fireEvent.blur(editorNode);

    act(() => {
      context.focus('all');
      jest.runAllTimers();
    });

    expect(context.getState().selection.from).toBe(0);
    expect(context.getState().selection.to).toBe(17);
  });

  it('can focus on the `start` even when already focused', () => {
    act(() => {
      context.focus('start');
      jest.runAllTimers();
    });

    expect(context.getState().selection.from).toBe(1);
  });

  it('can specify the exact position for the blurred editor', () => {
    fireEvent.blur(editorNode);
    act(() => {
      context.focus(10);
      jest.runAllTimers();
    });

    expect(context.getState().selection.from).toBe(10);
  });

  const expected = { from: 2, to: 5 };

  it('can specify the selection for the editor', () => {
    fireEvent.blur(editorNode);

    act(() => {
      context.focus(expected);
      jest.runAllTimers();
    });

    {
      const { from, to } = context.getState().selection;

      expect({ from, to }).toEqual(expected);
    }
  });

  it('restores the previous selection when focused without a parameter', () => {
    fireEvent.blur(editorNode);
    act(() => {
      context.focus(expected);
      jest.runAllTimers();
    });

    {
      const { from, to } = context.getState().selection;

      expect({ from, to }).toEqual(expected);
    }

    fireEvent.blur(editorNode);

    act(() => {
      context.focus();
      jest.runAllTimers();
    });

    {
      const { from, to } = context.getState().selection;

      expect({ from, to }).toEqual(expected);
      // expect(props.view.hasFocus()).toBeTrue();
    }
  });

  it('should do nothing when passing `false`', () => {
    fireEvent.blur(editorNode);

    act(() => {
      context.focus(false);
      jest.runAllTimers();
    });

    expect(context.getState().selection.from).toBe(1);
  });
});
