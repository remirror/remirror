import React from 'react';

import { axe, fireEvent, render, renderString } from '@test-utils';
import { InjectedRemirrorProps, Remirror } from '..';

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
    <Remirror {...handlers} label={label}>
      {mock}
    </Remirror>,
  );
  expect(mock).toHaveBeenCalledWith(expect.any(Object));
  expect(handlers.onFirstRender).toHaveBeenCalledWith(expect.any(Object));
  expect(handlers.onFirstRender.mock.calls[0][0].getText()).toBe('');
  expect(handlers.onFirstRender.mock.calls[0][0].getJSON().doc.type).toBe('doc');
  expect(handlers.onFirstRender.mock.calls[0][0].getHTML().type).toBe(undefined);
  const editorNode = getByLabelText(label);
  expect(editorNode).toHaveAttribute('role', 'textbox');
});

test('TextEditor is accessible', async () => {
  const results = await axe(renderString(<Remirror>{() => <div />}</Remirror>));
  expect(results).toHaveNoViolations();
});

test('should not render the editor when no render prop available', () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  // @ts-ignore
  expect(() => render(<Remirror label={label} />)).toThrowErrorMatchingInlineSnapshot(
    `"The child argument to the Remirror component must be a function."`,
  );
  expect(spy).toHaveBeenCalledTimes(2);
  spy.mockRestore();
});

test('should allow text input and fire all handlers', () => {
  let setContent: InjectedRemirrorProps['setContent'] = jest.fn();
  const mock = jest.fn((val: InjectedRemirrorProps) => {
    setContent = val.setContent;
    return <div />;
  });
  const { getByLabelText } = render(
    <Remirror label={label} {...handlers}>
      {mock}
    </Remirror>,
  );

  setContent(`<p>${textContent}</p>`, true);
  const editorNode = getByLabelText(label);
  expect(handlers.onChange).toHaveBeenCalledTimes(1);
  expect(handlers.onFirstRender.mock.calls[0][0].getText()).toBe(textContent);
  fireEvent.blur(editorNode);
  expect(handlers.onBlur).toHaveBeenCalledTimes(1);
  fireEvent.focus(editorNode);
  expect(handlers.onFocus).toHaveBeenCalledTimes(1);
});

test('can update contenteditable with props', () => {
  const mock = jest.fn(() => <div />);
  const El = ({ editable }: { editable: boolean }) => (
    <Remirror editable={editable} label={label}>
      {mock}
    </Remirror>
  );
  const { rerender, getByLabelText } = render(<El editable={true} />);
  expect(getByLabelText(label)).toHaveAttribute('contenteditable', 'true');
  rerender(<El editable={false} />);
  expect(getByLabelText(label)).toHaveAttribute('contenteditable', 'false');
});

test('should render a unique class on the root document', () => {
  const mock = jest.fn(() => <div />);
  const { getByLabelText } = render(
    <Remirror label={label} {...handlers}>
      {mock}
    </Remirror>,
  );
  const editorNode = getByLabelText(label);
  expect(editorNode.className).toMatch(/remirror-[A-Za-z0-9_-]{5}/);
});
