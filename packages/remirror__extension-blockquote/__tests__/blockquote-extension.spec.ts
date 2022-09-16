import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { htmlToProsemirrorNode, prosemirrorNodeToHtml } from '@remirror/core';

import { BlockquoteExtension } from '../';

extensionValidityTest(BlockquoteExtension);

describe('schema', () => {
  const {
    nodes: { blockquote, doc, p },
    schema,
  } = renderEditor<BlockquoteExtension>([new BlockquoteExtension()]);

  it('creates the correct dom node', () => {
    expect(prosemirrorNodeToHtml(blockquote(p('Hello friend!')))).toMatchInlineSnapshot(`
      <blockquote>
        <p>
          Hello friend!
        </p>
      </blockquote>
    `);
  });

  it('parses the dom structure and finds itself', () => {
    const node = htmlToProsemirrorNode({
      schema,
      content: '<blockquote>Hello friend!</blockquote>',
    });
    const expected = doc(blockquote(p('Hello friend!')));

    expect(node).toEqualProsemirrorNode(expected);
  });
});

test('supports extra attributes', () => {
  const {
    nodes: { blockquote, p },
  } = renderEditor<BlockquoteExtension>([
    new BlockquoteExtension({ extraAttributes: { 'data-custom': 'hello-world' } }),
  ]);

  expect(prosemirrorNodeToHtml(blockquote(p('friend!')))).toMatchInlineSnapshot(`
    <blockquote data-custom="hello-world">
      <p>
        friend!
      </p>
    </blockquote>
  `);
});

function create() {
  const blockquoteExtension = new BlockquoteExtension();
  return renderEditor<BlockquoteExtension>([blockquoteExtension]);
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
