import React from 'react';
import TestRenderer from 'react-test-renderer';

import {
  DocExtension,
  EditorManager,
  NodeExtension,
  NodeExtensionSpec,
  NodeGroup,
  TextExtension,
} from '@remirror/core';
import { BoldExtension, CodeBlockExtension, ParagraphExtension } from '@remirror/core-extensions';
import { Node as PMNode } from '@remirror/pm/model';
import { createTestManager, simpleJSON, testJSON } from '@remirror/test-fixtures';

import { ReactSerializer } from '../react-serializer';

class FooExtension extends NodeExtension {
  get name() {
    return 'foo' as const;
  }
  public schema: NodeExtensionSpec = {
    content: 'block*',
    group: NodeGroup.Block,

    toDOM: () => {
      const attributes = {
        'data-foo-type': 'true',
      };
      return ['div', attributes, ['div', { class: 'inside' }, 0]];
    },
  };
}

const manager = createTestManager([
  { extension: new CodeBlockExtension(), priority: 2 },
  { extension: new FooExtension(), priority: 3 },
]);
const { schema } = manager;
const serializer = ReactSerializer.fromManager(manager);

test('ReactSerializer.fromManager', () => {
  expect(serializer).toBeInstanceOf(ReactSerializer);
  expect(serializer.nodes.paragraph).toBeFunction();
  expect(serializer.marks.bold).toBeFunction();

  // fills in for a missing text
  const altExtensions = [
    { extension: new DocExtension(), priority: 2 },
    { extension: new ParagraphExtension(), priority: 2 },
    { extension: new TextExtension(), priority: 2 },
    { extension: new BoldExtension(), priority: 2 },
    { extension: new CodeBlockExtension(), priority: 2 },
  ];
  const altManager = EditorManager.create(altExtensions);

  expect(ReactSerializer.fromManager(altManager).nodes.text).toBeFunction();
});

describe('ReactSerializer', () => {
  describe('#serializeNode', () => {
    it('serializes the node', () => {
      const node = PMNode.fromJSON(schema, simpleJSON);

      expect(TestRenderer.create(serializer.serializeNode(node) as JSX.Element))
        .toMatchInlineSnapshot(`
        <p>
          This is a node with${' '}
          <strong>
            bold text.
          </strong>
        </p>
      `);
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

      expect(TestRenderer.create(serializer.serializeNode(node) as JSX.Element))
        .toMatchInlineSnapshot(`
        <pre>
          <code>
            Hello
          </code>
        </pre>
      `);
    });

    it('serializes the node with nested data', () => {
      const node = PMNode.fromJSON(schema, testJSON);

      expect(TestRenderer.create(serializer.serializeNode(node) as JSX.Element))
        .toMatchInlineSnapshot(`
        <p>
          This is a node with${' '}
          <strong>
            bold text and${' '}
          </strong>
          <strong>
            <em>
              italic bold and${' '}
            </em>
          </strong>
          <strong>
            <em>
              <u>
                underlined italic text
              </u>
            </em>
          </strong>
        </p>
      `);
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
