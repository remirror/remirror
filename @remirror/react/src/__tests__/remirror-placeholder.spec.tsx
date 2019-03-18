import React from 'react';

import { Doc, Paragraph, Text } from '@remirror/core';
import { EMPTY_NODE_CLASS_NAME } from '@remirror/core-extensions';
import { render } from '@test-utils';
import { Remirror } from '..';
import { InjectedRemirrorProps } from '../types';

const label = 'Remirror editor';
const handlers = {
  onChange: jest.fn(),
  onBlur: jest.fn(),
  onFocus: jest.fn(),
  onFirstRender: jest.fn(),
};
const placeholderText = 'Start typing...';

test('should not fail without the placeholder extension', () => {
  expect(() =>
    render(
      <Remirror
        {...handlers}
        label={label}
        usesBuiltInExtensions={false}
        extensions={[new Doc(), new Paragraph(), new Text()]}
      >
        {() => <div />}
      </Remirror>,
    ),
  ).not.toThrowError();
});

test('should display a placeholder when the content is empty', () => {
  const { baseElement, getByLabelText } = render(
    <Remirror {...handlers} label={label} placeholder={placeholderText}>
      {() => <div />}
    </Remirror>,
  );

  // console.log(document.documentElement.outerHTML);
  // const target = `.${EDITOR_CLASS_NAME} p.${EMPTY_NODE_CLASS_NAME}:first-of-type::before`;
  // expect(baseElement).toHaveStyleRule('content', placeholderText, {
  //   target,
  // });

  const emptyNode = baseElement.querySelector(`.${EMPTY_NODE_CLASS_NAME}`) as HTMLElement;
  // console.log(window.getComputedStyle(emptyNode, ':before').content);
  expect(emptyNode).toBeVisible();
  expect(getByLabelText(label)).toHaveAttribute('aria-placeholder', placeholderText);
});

test('should lose placeholder when content is entered', () => {
  let updateContent: InjectedRemirrorProps['setContent'];

  const { baseElement } = render(
    <Remirror {...handlers} label={label} placeholder={placeholderText}>
      {({ setContent, view }) => {
        const {} = view.state.schema.nodes;
        updateContent = setContent;
        return <div />;
      }}
    </Remirror>,
  );

  updateContent!('<p>New content</p>');
  const emptyNode = baseElement.querySelector(`.${EMPTY_NODE_CLASS_NAME}`) as HTMLElement;
  expect(emptyNode).toBeFalsy();
});
