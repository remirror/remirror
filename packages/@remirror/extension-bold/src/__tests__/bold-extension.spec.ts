import { pmBuild } from 'jest-prosemirror';
import { renderEditor } from 'jest-remirror';

import { fromHtml, toHtml } from '@remirror/core';
import { createBaseManager, isExtensionValid } from '@remirror/testing';

import { BoldExtension, BoldOptions } from '../..';

test('is bold extension valid', () => {
  expect(isExtensionValid(BoldExtension, {}));
});

describe('schema', () => {
  const { schema } = createBaseManager({
    extensions: [new BoldExtension()],
    presets: [],
  });

  const { bold, p, doc } = pmBuild(schema, {
    bold: { markType: 'bold' },
  });

  it('creates the correct dom node', () => {
    expect(toHtml({ node: p('Hello ', bold('friend!')), schema })).toMatchInlineSnapshot(`
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
    const node = fromHtml({ schema, content });
    const expected = doc(p('Hello ', bold('friend!')));

    expect(node).toEqualProsemirrorNode(expected);
  });

  it.each([
    ['tag: `b`', '<p>Hello <b style="font-weight: normal">friend!</b></p>'],
    ['style: `font-weight`', '<p>Hello <span style="font-weight: normal">friend!</span></p>'],
  ])('does not parse when font-weight is normal: %s', (_, content) => {
    const node = fromHtml({ schema, content });
    const expected = doc(p('Hello ', 'friend!'));

    expect(node).toEqualProsemirrorNode(expected);
  });
});

test('supports extra attributes', () => {
  const { schema } = createBaseManager({
    extensions: [new BoldExtension({ extraAttributes: { 'data-custom': 'hello-world' } })],
    presets: [],
  });

  const { bold, p } = pmBuild(schema, {
    bold: { markType: 'bold' },
  });

  expect(toHtml({ node: p('Hello ', bold('friend!')), schema })).toMatchInlineSnapshot(`
    <p>
      Hello
      <strong data-custom="hello-world">
        friend!
      </strong>
    </p>
  `);
});

function create(options?: BoldOptions) {
  const boldExtension = new BoldExtension(options);
  return renderEditor([boldExtension]);
}

test('inputRules', () => {
  const {
    add,
    nodes: { p, doc },
    marks: { bold },
  } = create();

  add(doc(p('Start<cursor>')))
    .insertText(' **bold me** for input rule match')
    .callback((content) => {
      expect(content.state.doc).toEqualRemirrorDocument(
        doc(p('Start ', bold('bold me'), ' for input rule match')),
      );
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
              friend
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
            Hello friend, lets dance.
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
          friend, lets dance.
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
