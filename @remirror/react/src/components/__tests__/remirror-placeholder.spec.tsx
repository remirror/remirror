import React from 'react';

import { Doc, ExtensionManager, Paragraph, Text } from '@remirror/core';
import { EMPTY_NODE_CLASS_NAME, History } from '@remirror/core-extensions';
import { createTestManager } from '@test-fixtures/schema-helpers';
import { render } from 'react-testing-library';
import { Remirror } from '../..';
import { InjectedRemirrorProps } from '../../types';

const label = 'Remirror editor';
const handlers = {
  onChange: jest.fn(),
  onBlur: jest.fn(),
  onFocus: jest.fn(),
  onFirstRender: jest.fn(),
};
const placeholderText = 'Start typing...';
const extensions = [
  { extension: new Doc(), priority: 2 },
  { extension: new Text(), priority: 2 },
  { extension: new Paragraph(), priority: 2 },
  { extension: new History(), priority: 2 },
];
// const placeholderExtension = { extension: new Placeholder(), priority: 2 }

test('should not fail without the placeholder extension', () => {
  expect(() =>
    render(
      <Remirror {...handlers} label={label} manager={ExtensionManager.create(extensions)}>
        {() => <div />}
      </Remirror>,
    ),
  ).not.toThrowError();
});

test('should display a placeholder when the content is empty', () => {
  const { baseElement, getByLabelText } = render(
    <Remirror {...handlers} label={label} placeholder={placeholderText} manager={createTestManager()}>
      {() => <div />}
    </Remirror>,
  );

  const emptyNode = baseElement.querySelector(`.${EMPTY_NODE_CLASS_NAME}`) as HTMLElement;
  expect(emptyNode).toBeVisible();
  expect(getByLabelText(label)).toHaveAttribute('aria-placeholder', placeholderText);
});

test('should lose placeholder when content is entered', () => {
  let updateContent: InjectedRemirrorProps['setContent'];

  const { baseElement } = render(
    <Remirror {...handlers} label={label} placeholder={placeholderText} manager={createTestManager()}>
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
