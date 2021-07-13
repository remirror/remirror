import {
  BoldExtension,
  CodeBlockExtension,
  ItalicExtension,
  UnderlineExtension,
} from 'remirror/extensions';
import { simpleJSON, testJSON } from 'testing';
import { TestRenderer } from 'testing/react';
import { ExtensionTag, NodeExtension, NodeExtensionSpec } from '@remirror/core';
import { Node as PMNode } from '@remirror/pm/model';
import { createReactManager } from '@remirror/react';

import { ReactSerializer } from '..';

class FooExtension extends NodeExtension {
  static disableExtraAttributes = true;

  get name() {
    return 'foo' as const;
  }

  createTags() {
    return [ExtensionTag.Block];
  }

  createNodeSpec(): NodeExtensionSpec {
    return {
      content: 'block*',

      toDOM: () => {
        const attributes = {
          'data-foo-type': 'true',
        };
        return ['div', attributes, ['div', { class: 'inside' }, 0]];
      },
    };
  }
}

const manager = createReactManager([
  new CodeBlockExtension(),
  new FooExtension(),
  new BoldExtension(),
  new ItalicExtension(),
  new UnderlineExtension(),
]);
const { schema } = manager;
const serializer = ReactSerializer.fromManager(manager);

test('ReactSerializer.fromManager', () => {
  expect(serializer).toBeInstanceOf(ReactSerializer);
  expect(serializer.nodes.paragraph).toBeFunction();
  expect(serializer.marks.bold).toBeFunction();
  expect(serializer.nodes.text).toBeFunction();
});

describe('ReactSerializer', () => {
  describe('#serializeNode', () => {
    it('serializes the node', () => {
      const node = PMNode.fromJSON(schema, simpleJSON);

      expect(TestRenderer.create(serializer.serializeNode(node) as JSX.Element)).toMatchSnapshot();
    });

    it('serializes a codeBlock node with nested array from `toDOM` call', () => {
      const codeBlockJSON = {
        type: 'codeBlock',
        content: [
          {
            type: 'text',
            text: 'Hello',
          },
        ],
      };

      const node = PMNode.fromJSON(schema, codeBlockJSON);

      expect(TestRenderer.create(serializer.serializeNode(node) as JSX.Element)).toMatchSnapshot();
    });

    it('serializes the node with nested data', () => {
      const node = PMNode.fromJSON(schema, testJSON);

      expect(TestRenderer.create(serializer.serializeNode(node) as JSX.Element)).toMatchSnapshot();
    });

    it('serializes a deeply nested custom node', () => {
      const node = PMNode.fromJSON(schema, {
        type: 'foo',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'This is the foo thing' }] },
        ],
      });

      expect(TestRenderer.create(serializer.serializeNode(node) as JSX.Element))
        .toMatchInlineSnapshot(`
        <div
          data-foo-type="true"
        >
          <div
            className="inside"
          >
            <p>
              This is the foo thing
            </p>
          </div>
        </div>
      `);
    });
  });
});

describe('ReactSerializer.renderSpec', () => {
  const attributes = { 'data-attribute': 'some attribute' };

  it('supports simple renders', () => {
    expect(
      TestRenderer.create(ReactSerializer.renderSpec(['p']) as JSX.Element),
    ).toMatchInlineSnapshot(`<p />`);
  });

  it('renders just text when a string is passed', () => {
    expect(ReactSerializer.renderSpec('Just text')).toBe('Just text');
  });

  it('supports attrs', () => {
    expect(TestRenderer.create(ReactSerializer.renderSpec(['p', attributes]) as JSX.Element))
      .toMatchInlineSnapshot(`
      <p
        data-attribute="some attribute"
      />
    `);
  });

  it('supports nesting', () => {
    expect(
      TestRenderer.create(
        ReactSerializer.renderSpec(['div', attributes, ['p', 0], 'message']) as JSX.Element,
      ),
    ).toMatchInlineSnapshot(`
      <div
        data-attribute="some attribute"
      >
        <p />
        message
      </div>
    `);
  });

  it('supports deep nesting', () => {
    expect(
      TestRenderer.create(
        ReactSerializer.renderSpec(
          ['div', attributes, ['div', { class: 'inside' }, 0]],
          'message',
        ) as JSX.Element,
      ),
    ).toMatchInlineSnapshot(`
      <div
        data-attribute="some attribute"
      >
        <div
          className="inside"
        >
          message
        </div>
      </div>
    `);
  });

  it('supports wrapping an already created element', () => {
    expect(TestRenderer.create(ReactSerializer.renderSpec(['div', 0], <h1 />) as JSX.Element))
      .toMatchInlineSnapshot(`
      <div>
        <h1 />
      </div>
    `);
  });
});
