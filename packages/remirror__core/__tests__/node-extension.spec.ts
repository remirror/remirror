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
      numeric: {
        default: 0,
        parseDOM: (dom) => {
          const val = dom.getAttribute('data-numeric');
          return val ? Number.parseInt(val, 10) : 0;
        },
      },
      boolean: {
        default: false,
        parseDOM: (dom) => dom.getAttribute('data-boolean') === 'true',
      },
    },
  });

  const { schema } = createCoreManager([customExtension]);
  const { doc, custom, other } = pmBuild(schema, {
    custom: { nodeType: 'custom', run, title, crazy: 'yo', numeric: 100, boolean: true },
    other: { nodeType: 'custom', run, title, crazy: 'believe me', numeric: 0, boolean: false },
  });

  it('creates attrs with the correct shape', () => {
    expect(schema.nodes.custom.spec.attrs).toEqual({
      title: { default: null },
      run: { default: 'failure' },
      crazy: { default: 'yo' },
      foo: { default: '' },
      bar: { default: null },
      numeric: { default: 0 },
      boolean: { default: false },
    });
  });

  it('parses the dom for extra attributes', () => {
    const node = htmlToProsemirrorNode({
      content: `<p title="${title}" data-run="${run}" data-numeric="100" data-boolean="true">hello</p>`,
      schema,
    });

    expect(node).toEqualProsemirrorNode(doc(custom('hello')));
  });

  it('supports parsing with getAttributes method', () => {
    const node = htmlToProsemirrorNode({
      content: `<p title="${title}" data-run="${run}" simple="believe me" data-boolean="false">hello</p>`,
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
