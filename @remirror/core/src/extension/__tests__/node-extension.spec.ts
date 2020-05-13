import { pmBuild } from 'jest-prosemirror';

import { NodeGroup } from '@remirror/core-constants';
import { NodeExtensionSpec } from '@remirror/core-types';
import { fromHTML } from '@remirror/core-utils';
import { createBaseManager } from '@remirror/test-fixtures';

import { ExtensionFactory } from '..';

const CustomExtension = ExtensionFactory.node({
  name: 'custom',
  createNodeSchema() {
    return {
      content: 'inline*',
      group: NodeGroup.Block,
      draggable: false,
      parseDOM: [
        {
          tag: 'p',
        },
      ],
      toDOM: () => ['p', 0],
    };
  },
});

describe('extraAttributes', () => {
  const run = 'true';
  const title = 'awesome';
  const customExtension = CustomExtension.of({
    extraAttributes: [
      'title',
      ['run', 'failure', 'data-run'],
      {
        default: 'yo',
        getAttribute: (domNode) => (domNode as Element).getAttribute('simple'),
        name: 'crazy',
      },
      {
        name: 'foo',
        default: '',
      },
      {
        name: 'bar',
        default: null,
      },
    ],
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
    const node = fromHTML({
      content: `<p title="${title}" data-run="${run}">hello</p>`,
      schema,
    });
    console.log(node);

    const expected = doc(custom('hello'));

    expect(node).toEqualProsemirrorNode(expected);
  });

  it('support parsing with getAttributes method', () => {
    const node = fromHTML({
      content: `<p title="${title}" data-run="${run}" simple="believe me">hello</p>`,
      schema,
    });
    const expected = doc(other('hello'));

    expect(node).toEqualProsemirrorNode(expected);
  });
});
