import { act, fireEvent, render } from '@testing-library/react';
import { axe } from 'jest-axe';
import React from 'react';
import { renderToString } from 'react-dom/server';

import { AnyCombinedUnion, fromHTML } from '@remirror/core';
import { createReactManager } from '@remirror/test-fixtures';

import { RenderEditor } from '..';
import { RemirrorContextProps } from '../../react-types';

const textContent = `This is editor text`;
const label = 'Remirror editor';
const handlers = {
  onChange: jest.fn(),
  onBlur: jest.fn(),
  onFocus: jest.fn(),
  onFirstRender: jest.fn(),
};

test('should be called via a render prop', () => {
  const mock = jest.fn(() => <div />);
  const { getByLabelText } = render(
    <RenderEditor manager={createReactManager()} label={label} {...handlers}>
      {mock}
    </RenderEditor>,
  );

  expect(mock).toHaveBeenCalledWith(expect.any(Object));
  expect(handlers.onFirstRender).toHaveBeenCalledWith(expect.any(Object));
  expect(handlers.onFirstRender.mock.calls[0][0].getText()).toBe('');
  expect(handlers.onFirstRender.mock.calls[0][0].getJSON().doc.type).toBe('doc');
  expect(handlers.onFirstRender.mock.calls[0][0].getHTML().type).toBeUndefined();

  const editorNode = getByLabelText(label);

  expect(editorNode).toHaveAttribute('role', 'textbox');
});

test('can `suppressHydrationWarning` without breaking', () => {
  const mock = jest.fn(() => <div />);
  const { getByLabelText } = render(
    <RenderEditor
      manager={createReactManager()}
      label={label}
      {...handlers}
      suppressHydrationWarning={true}
    >
      {mock}
    </RenderEditor>,
  );

  expect(mock).toHaveBeenCalledWith(expect.any(Object));
  expect(handlers.onFirstRender).toHaveBeenCalledWith(expect.any(Object));
  expect(handlers.onFirstRender.mock.calls[0][0].getText()).toBe('');
  expect(handlers.onFirstRender.mock.calls[0][0].getJSON().doc.type).toBe('doc');
  expect(handlers.onFirstRender.mock.calls[0][0].getHTML().type).toBeUndefined();

  const editorNode = getByLabelText(label);

  expect(editorNode).toHaveAttribute('role', 'textbox');
});

describe('basic functionality', () => {
  it('is accessible', async () => {
    const results = await axe(
      renderToString(<RenderEditor manager={createReactManager()}>{() => <div />}</RenderEditor>),
    );

    expect(results).toHaveNoViolations();
  });

  it("doesn't render the editor without `children` as a render prop", () => {
    expect(() =>
      // @ts-expect-error
      render(<RenderEditor label={label} manager={createReactManager()} />),
    ).toMatchSnapshot();
  });

  it('should allow text input and fire all handlers', () => {
    let setContent: RemirrorContextProps<AnyCombinedUnion>['setContent'] = jest.fn();
    const mock = jest.fn((value: RemirrorContextProps<AnyCombinedUnion>) => {
      setContent = value.setContent;
      return <div />;
    });

    const { getByLabelText } = render(
      <RenderEditor
        label={label}
        {...handlers}
        manager={createReactManager()}
        stringHandler={fromHTML}
      >
        {mock}
      </RenderEditor>,
    );

    act(() => {
      setContent(`<p>${textContent}</p>`, true);
    });
    const editorNode = getByLabelText(label);

    expect(handlers.onChange).toHaveBeenCalledTimes(1);
    expect(handlers.onFirstRender.mock.calls[0][0].getText()).toBe(textContent);

    fireEvent.blur(editorNode);
    expect(handlers.onBlur).toHaveBeenCalledTimes(1);

    fireEvent.focus(editorNode);
    expect(handlers.onFocus).toHaveBeenCalledTimes(1);
  });

  it('changes when the editable prop changes', () => {
    const mock = jest.fn(() => <div />);
    const manager = createReactManager();
    const El = ({ editable }: { editable: boolean }) => (
      <RenderEditor editable={editable} label={label} manager={manager}>
        {mock}
      </RenderEditor>
    );
    const { rerender, getByLabelText } = render(<El editable={true} />);

    expect(getByLabelText(label)).toHaveAttribute('contenteditable', 'true');

    rerender(<El editable={false} />);

    expect(getByLabelText(label)).toHaveAttribute('contenteditable', 'false');
  });
});

describe('initialContent', () => {
  it('should render with string content', () => {
    const { container } = render(
      <RenderEditor
        label={label}
        {...handlers}
        manager={createReactManager()}
        initialContent={'<p>Hello</p>'}
        stringHandler={fromHTML}
      >
        {() => <div />}
      </RenderEditor>,
    );

    expect(container.innerHTML).toInclude('Hello');
  });

  it('renders with json', () => {
    const content = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
    };

    const { container } = render(
      <RenderEditor
        label={label}
        {...handlers}
        manager={createReactManager()}
        initialContent={content}
      >
        {() => <div />}
      </RenderEditor>,
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
    const { getByRole } = render(
      <RenderEditor
        label={label}
        {...handlers}
        manager={createReactManager()}
        initialContent={content}
        autoFocus={true}
      >
        {(ctx) => {
          context = ctx;
          return <div />;
        }}
      </RenderEditor>,
    );

    editorNode = getByRole('textbox');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should do nothing when focusing on a focused editor without a new position', () => {
    expect(context.state.newState.selection.from).toBe(1);

    act(() => {
      context.focus();
      jest.runAllTimers();
    });

    expect(context.state.newState.selection.from).toBe(1);
  });

  it('can focus on the end', () => {
    fireEvent.blur(editorNode);

    act(() => {
      context.focus('end');
      jest.runAllTimers();
    });

    expect(context.state.newState.selection.from).toBe(16);
  });

  it('can focus on the start even when already focused', () => {
    act(() => {
      context.focus('start');
      jest.runAllTimers();
    });

    expect(context.state.newState.selection.from).toBe(1);
  });

  it('can specify the exact position for the blurred editor', () => {
    fireEvent.blur(editorNode);
    act(() => {
      context.focus(10);
      jest.runAllTimers();
    });

    expect(context.state.newState.selection.from).toBe(10);
  });

  const expected = { from: 2, to: 5 };

  it('can specify the selection for the editor', () => {
    fireEvent.blur(editorNode);

    act(() => {
      context.focus(expected);
      jest.runAllTimers();
    });

    {
      const { from, to } = context.state.newState.selection;

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
      const { from, to } = context.state.newState.selection;

      expect({ from, to }).toEqual(expected);
    }

    fireEvent.blur(editorNode);

    act(() => {
      context.focus();
      jest.runAllTimers();
    });

    {
      const { from, to } = context.state.newState.selection;

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

    expect(context.state.newState.selection.from).toBe(1);
  });
});
