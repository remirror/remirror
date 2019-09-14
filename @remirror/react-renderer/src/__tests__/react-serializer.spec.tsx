// tslint:disable: no-implicit-dependencies
import {
  DocExtension,
  ExtensionManager,
  NodeExtension,
  NodeExtensionSpec,
  NodeGroup,
  TextExtension,
} from '@remirror/core';
import { BoldExtension, CodeBlockExtension, ParagraphExtension } from '@remirror/core-extensions';
import { simpleJSON, testJSON } from '@test-fixtures/object-nodes';
import { createTestManager } from '@test-fixtures/schema-helpers';
import { shallow } from 'enzyme';
import { Node as PMNode } from 'prosemirror-model';
import React from 'react';
import { ReactSerializer } from '../react-serializer';

class FooExtension extends NodeExtension {
  public name = 'foo';
  public schema: NodeExtensionSpec = {
    content: 'block*',
    group: NodeGroup.Block,

    toDOM() {
      const attrs = {
        'data-foo-type': 'true',
      };
      return ['div', attrs, ['div', { class: 'inside' }, 0]];
    },
  };
}

const manager = createTestManager([
  { extension: new CodeBlockExtension(), priority: 2 },
  { extension: new FooExtension(), priority: 3 },
]);
const { schema } = manager;
const serializer = ReactSerializer.fromExtensionManager(manager);
test('ReactSerializer.fromExtensionManager', () => {
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
  const altManager = ExtensionManager.create(altExtensions);
  expect(ReactSerializer.fromExtensionManager(altManager).nodes.text).toBeFunction();
});

describe('ReactSerializer', () => {
  describe('#serializeNode', () => {
    it('serializes the node', () => {
      const node = PMNode.fromJSON(schema, simpleJSON);
      expect(shallow(serializer.serializeNode(node) as JSX.Element)).toMatchElement(
        <p>
          This is a node with <strong>bold text.</strong>
        </p>,
      );
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
      expect(shallow(serializer.serializeNode(node) as JSX.Element)).toMatchElement(
        <pre>
          <code>Hello</code>
        </pre>,
      );
    });

    it('serializes the node with nested data', () => {
      const node = PMNode.fromJSON(schema, testJSON);
      expect(shallow(serializer.serializeNode(node) as JSX.Element)).toMatchElement(
        <p>
          This is a node with <strong>bold text and </strong>
          <strong>
            <em>italic bold and </em>
          </strong>
          <strong>
            <em>
              <u>underlined italic text</u>
            </em>
          </strong>
        </p>,
      );
    });

    it('serializes a deeply nested custom node', () => {
      const node = PMNode.fromJSON(schema, {
        type: 'foo',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'This is the foo thing' }] }],
      });

      expect(shallow(serializer.serializeNode(node) as JSX.Element)).toMatchElement(
        <div data-foo-type='true'>
          <div className='inside'>
            <p>This is the foo thing</p>
          </div>
        </div>,
      );
    });
  });
});

describe('ReactSerializer.renderSpec', () => {
  const attrs = { 'data-attribute': 'some attribute' };

  it('supports simple renders', () => {
    expect(shallow(ReactSerializer.renderSpec(['p']) as JSX.Element)).toMatchElement(<p />);
  });

  it('renders just text when a string is passed', () => {
    expect(ReactSerializer.renderSpec('Just text')).toBe('Just text');
  });

  it('supports attrs', () => {
    expect(shallow(ReactSerializer.renderSpec(['p', attrs]) as JSX.Element)).toMatchElement(<p {...attrs} />);
  });

  it('supports nesting', () => {
    expect(
      shallow(ReactSerializer.renderSpec(['div', attrs, ['p', 0], 'message']) as JSX.Element),
    ).toMatchElement(
      <div {...attrs}>
        <p />
        message
      </div>,
    );
  });

  it('supports deep nesting', () => {
    expect(
      shallow(ReactSerializer.renderSpec(
        ['div', attrs, ['div', { class: 'inside' }, 0]],
        'message',
      ) as JSX.Element),
    ).toMatchElement(
      <div {...attrs}>
        <div>message</div>
      </div>,
    );
  });

  it('supports wrapping an already created element', () => {
    expect(shallow(ReactSerializer.renderSpec(['div', 0], <h1 />) as JSX.Element)).toMatchElement(
      <div>
        <h1 />
      </div>,
    );
  });
});
