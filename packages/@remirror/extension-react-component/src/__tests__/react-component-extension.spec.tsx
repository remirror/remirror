import { extensionValidityTest, RemirrorTestChain } from 'jest-remirror';
import { ComponentType } from 'react';
import { createReactManager, Remirror } from 'remirror/react';

import {
  ApplySchemaAttributes,
  ExtensionTag,
  NodeExtension,
  NodeExtensionSpec,
  setBlockType,
} from '@remirror/core';
import { act, render, strictRender } from '@remirror/testing/react';

import { ReactComponentExtension } from '..';
import type { NodeViewComponentProps } from '../node-view-types';

extensionValidityTest(ReactComponentExtension);

class TestExtension extends NodeExtension<{ useContent: boolean }> {
  get name(): string {
    return 'test' as const;
  }

  createTags() {
    return [ExtensionTag.Block];
  }

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    const toDOM: NodeExtensionSpec['toDOM'] = this.options.useContent
      ? (node) => ['span', extra.dom(node), 0]
      : undefined;

    return {
      attrs: {
        ...extra.defaults(),
        custom: { default: 'custom' },
      },
      content: 'inline*',
      toDOM,
    };
  }

  createCommands = () => {
    return {
      toggleCustomBlock: () => setBlockType(this.type, {}),
    };
  };

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
    <Remirror manager={chain.manager}>
      <div />
    </Remirror>,
  );
  const { doc } = chain.nodes;
  const { test: t } = chain.attributeNodes;

  act(() => {
    chain.add(doc(t({ custom: 'awesome' })('content<cursor>'))).insertText(' hello world');
  });

  expect(chain.dom).toMatchSnapshot();
});

test('NodeViews are created without content', () => {
  const chain = RemirrorTestChain.create(
    createReactManager([new ReactComponentExtension(), new TestExtension({ useContent: false })]),
  );

  strictRender(
    <Remirror manager={chain.manager}>
      <div />
    </Remirror>,
  );

  const { doc } = chain.nodes;
  const { test: t } = chain.attributeNodes;

  act(() => {
    chain.add(doc(t({ custom: 'awesome' })('content<cursor>'))).insertText('hello world');
  });

  expect(chain.dom).toMatchSnapshot();
});

test('node views can be created from commands', () => {
  const chain = RemirrorTestChain.create(
    createReactManager([new ReactComponentExtension(), new TestExtension({ useContent: true })]),
  );

  strictRender(
    <Remirror manager={chain.manager}>
      <div />
    </Remirror>,
  );

  const { doc, p } = chain.nodes;

  act(() => {
    chain.add(doc(p('content<cursor>'))).insertText('hello world\nasdf');
    chain.commands.toggleCustomBlock();
  });

  expect(chain.dom).toMatchSnapshot();
});

test('simple commands', () => {
  const chain = RemirrorTestChain.create(
    createReactManager([new ReactComponentExtension(), new TestExtension({ useContent: true })]),
  );

  render(
    <Remirror manager={chain.manager}>
      <div />
    </Remirror>,
  );

  const { doc, p } = chain.nodes;

  act(() => {
    chain.add(doc(p('<cursor>'))).commands.toggleCustomBlock();
    chain.insertText('add');
  });

  expect(chain.dom).toMatchSnapshot();
});
