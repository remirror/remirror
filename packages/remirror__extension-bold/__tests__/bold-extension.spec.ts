import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { createCoreManager } from 'remirror/extensions';
import { htmlToProsemirrorNode, prosemirrorNodeToHtml } from '@remirror/core';

import { BoldExtension, BoldOptions } from '../';

extensionValidityTest(BoldExtension);

describe('schema', () => {
  const { schema } = createCoreManager([new BoldExtension()]);
  const { bold, p, doc } = pmBuild(schema, {
    bold: { markType: 'bold' },
  });

  it('creates the correct dom node', () => {
    expect(prosemirrorNodeToHtml(p('Hello ', bold('friend!')))).toMatchInlineSnapshot(`
      <p>
        Hello
        <strong>
          friend!
        </strong>
      </p>
    `);
  });

  it.each([
    ['tag: `b`', '<p>Hello <b>friend!</b></p>'],
    ['tag: `strong`', '<p>Hello <strong>friend!</strong></p>'],
    ['style: `font-weight`', '<p>Hello <span style="font-weight: bold">friend!</span></p>'],
  ])('parses the dom structure and finds itself with: %s', (_, content) => {
    const node = htmlToProsemirrorNode({ schema, content: content });
    const expected = doc(p('Hello ', bold('friend!')));

    expect(node).toEqualProsemirrorNode(expected);
  });

  it.each([
    ['tag: `b`', '<p>Hello <b style="font-weight: normal">friend!</b></p>'],
    ['style: `font-weight`', '<p>Hello <span style="font-weight: normal">friend!</span></p>'],
  ])('does not parse when font-weight is normal: %s', (_, content) => {
    const node = htmlToProsemirrorNode({ schema, content: content });
    const expected = doc(p('Hello ', 'friend!'));

    expect(node).toEqualProsemirrorNode(expected);
  });
});

test('supports extra attributes', () => {
  const { schema } = createCoreManager([
    new BoldExtension({ extraAttributes: { 'data-custom': 'hello-world' } }),
  ]);
  const { bold, p } = pmBuild(schema, {
    bold: { markType: 'bold' },
  });

  expect(prosemirrorNodeToHtml(p('Hello ', bold('friend!')))).toMatchInlineSnapshot(`
    <p>
      Hello
      <strong data-custom="hello-world">
        friend!
      </strong>
    </p>
  `);
});

function create(options?: BoldOptions) {
  return renderEditor([new BoldExtension(options)]);
}

describe('inputRules', () => {
  let {
    add,
    nodes: { p, doc },
    marks: { bold },
  } = create();

  beforeEach(() => {
    ({
      add,
      nodes: { p, doc },
      marks: { bold },
    } = create());
  });

  it('should match input rule', () => {
    add(doc(p('Start<cursor>')))
      .insertText(' **bold me** for input rule match')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(
          doc(p('Start ', bold('bold me'), ' for input rule match')),
        );
      });
  });

  it('should ignore whitespace', () => {
    add(doc(p('<cursor>')))
      .insertText('** **\n   **')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('** **\n'), p('   **')));
      });
  });
});

test('options', () => {
  const {
    add,
    view: { dom },
    nodes: { p, doc },
    marks: { bold },
  } = create({ weight: 800 });

  add(doc(p('Hello ', bold('friend!'))));
  expect(dom.innerHTML).toMatchInlineSnapshot(`
    <p>
      Hello
      <strong font-weight="800">
        friend!
      </strong>
    </p>
  `);
});

describe('commands', () => {
  const {
    add,
    view,
    nodes: { p, doc },
    marks: { bold },
    commands,
  } = create();

  it('#toggleBold', () => {
    add(doc(p('Hello <start>friend<end>, lets dance.')));
    commands.toggleBold();

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        Hello
        <strong>
          <span class="selection">
            friend
          </span>
        </strong>
        , lets dance.
      </p>
    `);
    expect(view.state.doc).toEqualRemirrorDocument(
      doc(p('Hello ', bold('friend'), ', lets dance.')),
    );

    commands.toggleBold();

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        Hello
        <span class="selection">
          friend
        </span>
        , lets dance.
      </p>
    `);
    expect(view.state.doc).toEqualRemirrorDocument(doc(p('Hello friend, lets dance.')));
  });

  it('#setBold', () => {
    add(doc(p('Hello <start>friend<end>, lets dance.')));
    commands.setBold({ from: 1, to: 6 });

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        <strong>
          Hello
        </strong>
        <span class="selection">
          friend
        </span>
        , lets dance.
      </p>
    `);
    expect(view.state.doc).toEqualRemirrorDocument(doc(p(bold('Hello'), ' friend, lets dance.')));
  });

  it('#removeBold', () => {
    add(doc(p(bold('Hello'), ' friend, lets dance.')));
    commands.removeBold({ from: 1, to: 6 });

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        Hello friend, lets dance.
      </p>
    `);
    expect(view.state.doc).toEqualRemirrorDocument(doc(p('Hello friend, lets dance.')));
  });
});
