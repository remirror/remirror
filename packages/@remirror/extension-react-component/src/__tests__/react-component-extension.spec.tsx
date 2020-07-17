import { extensionValidityTest, RemirrorTestChain } from 'jest-remirror';
import React, { ComponentType } from 'react';

import {
  ApplySchemaAttributes,
  NodeExtension,
  NodeExtensionSpec,
  NodeGroup,
  setBlockType,
} from '@remirror/core';
import { act, createReactManager, RemirrorProvider, strictRender } from '@remirror/testing/react';

import { ReactComponentExtension } from '..';
import type { NodeViewComponentProps } from '../node-view-types';

extensionValidityTest(ReactComponentExtension);

class TestExtension extends NodeExtension<{ useContent: boolean }> {
  get name(): string {
    return 'test' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      attrs: {
        ...extra.defaults(),
        custom: { default: 'custom' },
      },
      content: 'inline*',
      group: NodeGroup.Block,
      toDOM: (node) => {
        if (this.options.useContent) {
          return ['nav', extra.dom(node), 0];
        }

        return ['nav', extra.dom(node)];
      },
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
    <RemirrorProvider manager={chain.manager}>
      <div />
    </RemirrorProvider>,
  );
  const { doc } = chain.nodes;
  const { test } = chain.attributeNodes;

  act(() => {
    chain.add(doc(test({ custom: 'awesome' })('content<cursor>'))).insertText(' hello world');
  });

  expect(chain.dom).toMatchSnapshot();
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

  const { doc } = chain.nodes;
  const { test } = chain.attributeNodes;

  act(() => {
    chain.add(doc(test({ custom: 'awesome' })('content<cursor>'))).insertText('hello world');
  });

  expect(chain.dom).toMatchSnapshot();
});

test('node views can be created from commands', () => {
  const chain = RemirrorTestChain.create(
    createReactManager([new ReactComponentExtension(), new TestExtension({ useContent: true })]),
  );

  strictRender(
    <RemirrorProvider manager={chain.manager}>
      <div />
    </RemirrorProvider>,
  );

  const { doc, p } = chain.nodes;

  act(() => {
    chain.add(doc(p('content<cursor>'))).insertText('hello world\nasdf');
    chain.commands.toggleCustomBlock();
  });

  expect(chain.dom).toMatchSnapshot();
});
