import { RemirrorTestChain } from 'jest-remirror';
import React, { ComponentType } from 'react';

import { ApplySchemaAttributes, NodeExtension, NodeExtensionSpec, NodeGroup } from '@remirror/core';
import { isExtensionValid } from '@remirror/testing';
import { act, createReactManager, RemirrorProvider, render } from '@remirror/testing/react';

import { ReactComponentExtension } from '..';
import { NodeViewComponentProps } from '../node-view-types';

test('`ReactComponentExtension`: is valid', () => {
  expect(isExtensionValid(ReactComponentExtension)).toBeTrue();
});

class TestExtension extends NodeExtension<{ useContent: boolean }> {
  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      attrs: {
        ...extra.defaults(),
        custom: { default: 'custom' },
      },
      content: 'inline*',
      group: NodeGroup.Block,
      toDOM: (node) => ['nav', extra.dom(node), 0],
    };
  }

  get name(): string {
    return 'test' as const;
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

  render(
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

  render(
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
