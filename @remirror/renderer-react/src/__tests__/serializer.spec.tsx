import React from 'react';

import { Cast, Doc, ExtensionManager, Paragraph, Text } from '@remirror/core';
import { Bold, Italic, Underline } from '@remirror/core-extensions';
import { simpleJSON, testJSON } from '@test-fixtures/object-nodes';
import { shallow } from 'enzyme';
import { Node as PMNode } from 'prosemirror-model';

import { ReactSerializer } from '../serializer';

const extensions = [new Doc(), new Paragraph(), new Text(), new Bold(), new Italic(), new Underline()];
const manager = new ExtensionManager(extensions, Cast(() => ({})), Cast(() => ({})));
const schema = manager.createSchema();
const serializer = ReactSerializer.fromExtensionManager(manager);

test('ReactSerializer.fromExtensionManager', () => {
  expect(serializer).toBeInstanceOf(ReactSerializer);
  expect(serializer.nodes.paragraph).toBeFunction();
  expect(serializer.marks.bold).toBeFunction();

  // fills in for a missing text
  const altExtensions = [new Doc(), new Paragraph(), new Bold()];
  const altManager = new ExtensionManager(altExtensions, Cast(() => ({})), Cast(() => ({})));
  expect(ReactSerializer.fromExtensionManager(altManager).nodes.text).toBeFunction();
});

describe('ReactSerializer', () => {
  describe('#serializeNode', () => {
    it('serializes the node', () => {
      // TODO add marks to the jest-remirror library
      const node = PMNode.fromJSON(schema, simpleJSON);
      expect(shallow(serializer.serializeNode(node) as JSX.Element)).toMatchElement(
        <p>
          This is a node with <strong>bold text.</strong>
        </p>,
      );
    });
    it('serializes the node with nested data', () => {
      // TODO add marks to the jest-remirror library
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

  it('supports wrapping an already created element', () => {
    expect(shallow(ReactSerializer.renderSpec(['div'], <h1 />) as JSX.Element)).toMatchElement(
      <div>
        <h1 />
      </div>,
    );
  });
});
