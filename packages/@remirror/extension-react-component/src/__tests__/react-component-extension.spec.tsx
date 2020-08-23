import { extensionValidityTest, RemirrorTestChain } from 'jest-remirror';
import React, { ComponentType } from 'react';

import {
  ApplySchemaAttributes,
  ExtensionTag,
  NodeExtension,
  NodeExtensionSpec,
} from '@remirror/core';
import { act, createReactManager, RemirrorProvider, strictRender } from '@remirror/testing/react';

import { ReactComponentExtension } from '..';
import type { NodeViewComponentProps } from '../node-view-types';

extensionValidityTest(ReactComponentExtension);

class TestExtension extends NodeExtension<{ useContent: boolean }> {
  get name(): string {
    return 'test' as const;
  }

  readonly tags = [ExtensionTag.BlockNode];

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      attrs: {
        ...extra.defaults(),
        custom: { default: 'custom' },
      },
      content: 'inline*',
      toDOM: (node) => ['nav', extra.dom(node), 0],
    };
  }

  ReactComponent: ComponentType<NodeViewComponentProps> = ({ node, forwardRef }) => {
    if (this.options.useContent) {
      return <p {...node.attrs} ref={forwardRef} />;
    }

    return <div>Ignore content</div>;
  };
}

test('NodeViews are created with content', () => {
  const chain = RemirrorTestChain.create(
    createReactManager([new ReactComponentExtension(), new TestExtension({ useContent: true })]),
  );

  strictRender(
    <RemirrorProvider manager={chain.manager}>
      <div />
    </RemirrorProvider>,
  );
  const {
    add,
    dom,
    nodes: { doc },
    attributeNodes: { test },
  } = chain;

  act(() => {
    add(doc(test({ custom: 'awesome' })('content<cursor>'))).insertText(' hello world');
  });

  expect(dom).toMatchSnapshot();
});

test('NodeViews are created without content', () => {
  const chain = RemirrorTestChain.create(
    createReactManager([new ReactComponentExtension(), new TestExtension({ useContent: false })]),
  );

  strictRender(
    <RemirrorProvider manager={chain.manager}>
      <div />
    </RemirrorProvider>,
  );

  const {
    add,
    dom,
    nodes: { doc },
    attributeNodes: { test },
  } = chain;

  act(() => {
    add(doc(test({ custom: 'awesome' })('content<cursor>'))).insertText('hello world');
  });

  expect(dom).toMatchSnapshot();
});
