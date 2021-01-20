import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { createCoreManager } from 'remirror/extensions';
import { htmlToProsemirrorNode, prosemirrorNodeToHtml } from '@remirror/core';

import { CodeExtension } from '../';

extensionValidityTest(CodeExtension);

describe('schema', () => {
  const codeTester = () => {
    const { schema } = createCoreManager([new CodeExtension()]);
    const { code, doc, p } = pmBuild(schema, {
      code: { markType: 'code' },
    });

    return { schema, code, doc, p };
  };

  it('returns the correct html', () => {
    const expected = 'Brilliant';
    const { p, code } = codeTester();

    expect(prosemirrorNodeToHtml(p(code(expected)))).toBe(`<p><code>${expected}</code></p>`);
  });

  it('can parse content', () => {
    const { p, code, schema, doc } = codeTester();
    const parsedString = 'Test';
    const node = htmlToProsemirrorNode({
      content: `<p><code>${parsedString}</code></p>`,
      schema,
    });
    const expected = doc(p(code(parsedString)));

    expect(node).toEqualProsemirrorNode(expected);
  });
});

describe('inputRules', () => {
  let {
    add,
    nodes: { p, doc },
    marks: { code },
  } = renderEditor([new CodeExtension()]);

  beforeEach(() => {
    ({
      add,
      nodes: { p, doc },
      marks: { code },
    } = renderEditor([new CodeExtension()]));
  });

  it('should match input rule', () => {
    add(doc(p('Start<cursor>')))
      .insertText(' `code here!` for input rule match')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(
          doc(p('Start ', code('code here!'), ' for input rule match')),
        );
      });
  });

  it('should ignore whitespace', () => {
    add(doc(p('<cursor>')))
      .insertText('` `\n   `')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('` `\n'), p('   `')));
      });
  });
});

describe('commands', () => {
  let {
    add,
    view,
    nodes: { p, doc },
    marks: { code },
    commands,
  } = renderEditor([new CodeExtension()]);

  beforeEach(() => {
    ({
      add,
      view,
      nodes: { p, doc },
      marks: { code },
      commands,
    } = renderEditor([new CodeExtension()]));
  });

  it('#toggleBold', () => {
    add(doc(p('Hello <start>code<end>, lets dance.')));
    commands.toggleCode();

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        Hello
        <code>
          <span class="selection">
            code
          </span>
        </code>
        , lets dance.
      </p>
    `);
    expect(view.state.doc).toEqualRemirrorDocument(doc(p('Hello ', code('code'), ', lets dance.')));

    commands.toggleCode();

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        Hello
        <span class="selection">
          code
        </span>
        , lets dance.
      </p>
    `);
    expect(view.state.doc).toEqualRemirrorDocument(doc(p('Hello code, lets dance.')));
  });
});
