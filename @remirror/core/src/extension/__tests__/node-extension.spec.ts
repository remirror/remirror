import { pmBuild } from 'jest-prosemirror';

import { NodeGroup } from '@remirror/core-constants';
import { ApplyExtraAttributes, NodeExtensionSpec } from '@remirror/core-types';
import { fromHtml } from '@remirror/core-utils';
import { createBaseManager } from '@remirror/test-fixtures';

import { NodeExtension } from '..';

class CustomExtension extends NodeExtension {
  get name() {
    return 'custom' as const;
  }

  createNodeSpec(extra: ApplyExtraAttributes): NodeExtensionSpec {
    return {
      content: 'inline*',
      attrs: {
        ...extra.defaults(),
      },
      group: NodeGroup.Block,
      draggable: false,
      parseDOM: [
        {
          tag: 'p',
          getAttrs: (node) => extra.parse(node as HTMLElement),
        },
      ],
      toDOM: (node) => ['p', extra.dom(node.attrs), 0],
    };
  }
}

describe('extraAttributes', () => {
  const run = 'true';
  const title = 'awesome';
  const customExtension = new CustomExtension({
    extraAttributes: {
      title: { default: null },
      run: { default: 'failure', parseDOM: (dom) => dom.getAttribute('data-run') },
      crazy: { default: 'yo', parseDOM: (domNode) => domNode.getAttribute('simple') },
      foo: { default: '' },
      bar: { default: null },
    },
  });

  const { schema } = createBaseManager({ extensions: [customExtension], presets: [] });
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
    const node = fromHtml({
      content: `<p title="${title}" data-run="${run}">hello</p>`,
      schema,
    });

    expect(node).toEqualProsemirrorNode(doc(custom('hello')));
  });

  it('supports parsing with getAttributes method', () => {
    const node = fromHtml({
      content: `<p title="${title}" data-run="${run}" simple="believe me">hello</p>`,
      schema,
    });
    const expected = doc(other('hello'));

    expect(node).toEqualProsemirrorNode(expected);
  });

  it('can `disableExtraAttributes`', () => {
    const { schema } = createBaseManager({
      extensions: [customExtension],
      presets: [],
      settings: { disableExtraAttributes: true },
    });

    expect(schema.nodes.custom.spec.attrs).toEqual({});
  });
});
