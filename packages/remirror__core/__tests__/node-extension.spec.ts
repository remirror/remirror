import { pmBuild } from 'jest-prosemirror';
import { createCoreManager } from 'remirror/extensions';
import { ExtensionPriority, ExtensionTag } from '@remirror/core-constants';
import type { ApplySchemaAttributes, NodeExtensionSpec } from '@remirror/core-types';
import { htmlToProsemirrorNode } from '@remirror/core-utils';

import { NodeExtension } from '../';

class CustomExtension extends NodeExtension {
  get name() {
    return 'custom' as const;
  }

  createTags() {
    return [ExtensionTag.Block];
  }

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      content: 'inline*',
      attrs: {
        ...extra.defaults(),
      },
      draggable: false,
      parseDOM: [
        {
          tag: 'p',
          getAttrs: (node) => extra.parse(node as HTMLElement),
        },
      ],
      toDOM: (node) => ['p', extra.dom(node), 0],
    };
  }
}

describe('extraAttributes', () => {
  const run = 'true';
  const title = 'awesome';
  const customExtension = new CustomExtension({
    priority: ExtensionPriority.High,
    extraAttributes: {
      title: { default: null },
      run: { default: 'failure', parseDOM: (dom) => dom.getAttribute('data-run') },
      crazy: { default: 'yo', parseDOM: (domNode) => domNode.getAttribute('simple') },
      foo: { default: '' },
      bar: { default: null },
    },
  });

  const { schema } = createCoreManager([customExtension]);
  const { doc, custom, other } = pmBuild(schema, {
    custom: { nodeType: 'custom', run, title, crazy: 'yo' },
    other: { nodeType: 'custom', run, title, crazy: 'believe me' },
  });

  it('creates attrs with the correct shape', () => {
    expect(schema.nodes.custom.spec.attrs).toEqual({
      title: { default: null },
      run: { default: 'failure' },
      crazy: { default: 'yo' },
      foo: { default: '' },
      bar: { default: null },
    });
  });

  it('parses the dom for extra attributes', () => {
    const node = htmlToProsemirrorNode({
      content: `<p title="${title}" data-run="${run}">hello</p>`,
      schema,
    });

    expect(node).toEqualProsemirrorNode(doc(custom('hello')));
  });

  it('supports parsing with getAttributes method', () => {
    const node = htmlToProsemirrorNode({
      content: `<p title="${title}" data-run="${run}" simple="believe me">hello</p>`,
      schema,
    });
    const expected = doc(other('hello'));

    expect(node).toEqualProsemirrorNode(expected);
  });

  it('can `disableExtraAttributes`', () => {
    const { schema } = createCoreManager([customExtension], {
      disableExtraAttributes: true,
    });

    expect(schema.nodes.custom.spec.attrs).toEqual({});
  });
});
