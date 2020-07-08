import { pmBuild } from 'jest-prosemirror';
import { renderEditor } from 'jest-remirror';

import { fromHtml, toHtml } from '@remirror/core';
import { createCoreManager, isExtensionValid } from '@remirror/testing';

import { BlockquoteExtension } from '..';

test('is blockquote extension valid', () => {
  expect(isExtensionValid(BlockquoteExtension, {}));
});

describe('schema', () => {
  const { schema } = createCoreManager([new BlockquoteExtension()]);

  const { blockquote, doc, p } = pmBuild(schema, {});

  it('creates the correct dom node', () => {
    expect(toHtml({ node: blockquote(p('Hello friend!')), schema })).toMatchInlineSnapshot(`
      <blockquote>
        <p>
          Hello friend!
        </p>
      </blockquote>
    `);
  });

  it('parses the dom structure and finds itself ', () => {
    const node = fromHtml({ schema, content: '<blockquote>Hello friend!</blockquote>' });
    const expected = doc(blockquote(p('Hello friend!')));

    expect(node).toEqualProsemirrorNode(expected);
  });
});

test('supports extra attributes', () => {
  const { schema } = createCoreManager([
    new BlockquoteExtension({ extraAttributes: { 'data-custom': 'hello-world' } }),
  ]);
  const { blockquote, p } = pmBuild(schema, {});

  expect(toHtml({ node: blockquote(p('friend!')), schema })).toMatchInlineSnapshot(`
    <blockquote data-custom="hello-world">
      <p>
        friend!
      </p>
    </blockquote>
  `);
});

function create() {
  const blockquoteExtension = new BlockquoteExtension();
  return renderEditor([blockquoteExtension]);
}

test('inputRules', () => {
  const {
    add,
    nodes: { p, doc, blockquote },
  } = create();

  add(doc(p('<cursor>')))
    .insertText('> I am a blockquote')
    .callback((content) => {
      expect(content.state.doc).toEqualRemirrorDocument(doc(blockquote(p('I am a blockquote'))));
    });
});

describe('commands', () => {
  const {
    add,
    view,
    nodes: { p, doc, blockquote },

    commands,
  } = create();

  it('#toggleBlockquote', () => {
    add(doc(p('Hello friend, <cursor>lets dance.')));
    commands.toggleBlockquote();

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <blockquote>
        <p>
          Hello friend, lets dance.
        </p>
      </blockquote>
    `);
    expect(view.state.doc).toEqualRemirrorDocument(doc(blockquote(p('Hello friend, lets dance.'))));

    commands.toggleBlockquote();

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
          <p>
            Hello friend, lets dance.
          </p>
        `);
    expect(view.state.doc).toEqualRemirrorDocument(doc(p('Hello friend, lets dance.')));
  });
});
