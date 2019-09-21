import { fromHTML, toHTML } from '@remirror/core';
import { createBaseTestManager } from '@remirror/test-fixtures';
import { pmBuild } from 'jest-prosemirror';
import { renderEditor } from 'jest-remirror';
import typescriptPlugin from 'prettier/parser-typescript';
import { formatWithCursor } from 'prettier/standalone';
import javascript from 'refractor/lang/javascript';
import markdown from 'refractor/lang/markdown';
import tsx from 'refractor/lang/tsx';
import typescript from 'refractor/lang/typescript';
import { CodeBlockExtension, CodeBlockExtensionOptions } from '../';
import { CodeBlockFormatter } from '../code-block-types';
import { getLanguage } from '../code-block-utils';

describe('schema', () => {
  const { schema } = createBaseTestManager([{ extension: new CodeBlockExtension(), priority: 1 }]);
  const attrs = { language: 'typescript' };
  const content = 'unchanged without decorations';

  const { codeBlock, doc } = pmBuild(schema, {
    codeBlock: { nodeType: 'codeBlock', ...attrs },
  });

  it('creates the correct dom node', () => {
    expect(toHTML({ node: codeBlock(content), schema })).toBe(
      `<pre class="language-${attrs.language}"><code data-code-block-language="${attrs.language}">${content}</code></pre>`,
    );
  });

  it('parses the dom structure and finds itself', () => {
    const node = fromHTML({
      schema,
      content: `<pre><code class="language-${attrs.language}" data-code-block-language="${attrs.language}">${content}</code></pre>`,
    });
    const expected = doc(codeBlock(content));
    expect(node).toEqualProsemirrorNode(expected);
  });
});

describe('constructor', () => {
  it('is created with the correct options', () => {
    const codeBlock = new CodeBlockExtension({
      syntaxTheme: 'a11yDark',
    });
    expect(codeBlock.options.syntaxTheme).toEqual('a11yDark');
    expect(codeBlock.options.defaultLanguage).toEqual('markup');
  });
});

const supportedLanguages = [typescript, javascript, markdown, tsx];

const create = (params: CodeBlockExtensionOptions = {}) =>
  renderEditor({
    plainNodes: [],
    attrNodes: [new CodeBlockExtension({ ...params, supportedLanguages })],
  });

describe('plugin', () => {
  let {
    view,
    add,
    attrNodes: { codeBlock },
    nodes: { doc, p },
  } = create();

  let { dom } = view;

  let tsBlock = codeBlock({ language: 'typescript' });

  beforeEach(() => {
    ({
      view,
      add,
      attrNodes: { codeBlock },
      nodes: { doc, p },
    } = create());
    tsBlock = codeBlock({ language: 'typescript' });
    ({ dom } = view);
  });

  it('renders the correct decorations', () => {
    add(doc(tsBlock(`const a = 'test';`)));

    expect(dom.querySelector('.language-typescript code')!.innerHTML).toMatchSnapshot();
  });

  it('can be updated', () => {
    const plainBlock = codeBlock({});
    const adder = add(doc(tsBlock(`const a = 'test';<cursor>`), plainBlock('Nothing to see here')));

    expect(dom.querySelector('.language-typescript code')!.innerHTML).toMatchSnapshot();
    adder.insertText('\n\nconsole.log(a);');
    expect(dom.querySelector('.language-typescript code')!.innerHTML).toMatchSnapshot();
  });

  it('updates when multiple changes occur', () => {
    const { overwrite } = add(doc(tsBlock(`const a = 'test';`), tsBlock(`let b;`)));
    expect(dom.innerHTML).toMatchSnapshot();

    overwrite(doc(tsBlock(`const c = 'test';`), tsBlock(`let d;`)));
    expect(dom.innerHTML).toMatchSnapshot();
  });

  it('changes markup when the language changes', () => {
    const markupBlock = codeBlock();
    const content = `const a = 'test';`;
    const { overwrite } = add(doc(markupBlock(content)));
    const initialHtml = dom.querySelector('.language-markup code')!.innerHTML;

    overwrite(doc(tsBlock(content)));
    const newHtml = dom.querySelector('.language-typescript code')!.innerHTML;
    expect(newHtml).not.toBe(initialHtml);
    expect(newHtml).toMatchSnapshot();
  });

  describe('Backspace', () => {
    it('can be deleted', () => {
      const { state } = add(doc(tsBlock('<cursor>'))).press('Backspace');
      expect(state.doc).toEqualRemirrorDocument(doc(p()));
    });

    it('is still deleted when all that remains is whitespace', () => {
      const { state } = add(doc(tsBlock('<cursor>          '))).press('Backspace');
      expect(state.doc).toEqualRemirrorDocument(doc(p()));
    });

    it('steps into the previous node when content', () => {
      const { state } = add(doc(p(), tsBlock('<cursor>content')))
        .press('Backspace')
        .insertText('abc');
      expect(state.doc).toEqualRemirrorDocument(doc(p('abc'), tsBlock('content')));
    });

    it('creates a paragraph node when content', () => {
      const { state } = add(doc(tsBlock('<cursor>content')))
        .press('Backspace')
        .insertText('abc');
      expect(state.doc).toEqualRemirrorDocument(doc(p('abc'), tsBlock('content')));
    });
  });

  describe('Space', () => {
    it('responds to space input rule', () => {
      const { state } = add(doc(p('<cursor>'))).insertText('```typescript abc');
      expect(state.doc).toEqualRemirrorDocument(doc(tsBlock('abc'), p()));
    });

    it('responds to empty space input rule using the default language', () => {
      const markupBlock = codeBlock({ language: 'markup' });
      const { state } = add(doc(p('<cursor>'))).insertText('``` abc');
      expect(state.doc).toEqualRemirrorDocument(doc(markupBlock('abc'), p()));
    });

    it('does not match invalid regex', () => {
      const { state } = add(doc(p('<cursor>'))).insertText('```123-__ ');
      expect(state.doc).toEqualRemirrorDocument(doc(p('```123-__ ')));
    });

    it('use default markup for non existent language', () => {
      const markupBlock = codeBlock({ language: 'markup' });
      const { state } = add(doc(p('<cursor>'))).insertText('```abcde abc');
      expect(state.doc).toEqualRemirrorDocument(doc(markupBlock('abc'), p()));
    });

    it('keeps alias language name when supported', () => {
      const htmlBlock = codeBlock({ language: 'html' });
      const { state } = add(doc(p('<cursor>'))).insertText('```html abc');
      expect(state.doc).toEqualRemirrorDocument(doc(htmlBlock('abc'), p()));
    });
  });

  describe('Enter', () => {
    it('responds to enter key press', () => {
      const { state } = add(doc(p('<cursor>')))
        .insertText('```typescript')
        .press('Enter')
        .insertText('abc');
      expect(state.doc).toEqualRemirrorDocument(doc(tsBlock('abc'), p()));
    });

    it('uses default language when no language provided', () => {
      const markupBlock = codeBlock({ language: 'markup' });
      const { state } = add(doc(p('<cursor>')))
        .insertText('```')
        .press('Enter')
        .insertText('abc');
      expect(state.doc).toEqualRemirrorDocument(doc(markupBlock('abc'), p()));
    });

    it('uses default language when given an invalid language', () => {
      const markupBlock = codeBlock({ language: 'markup' });
      const { state } = add(doc(p('<cursor>')))
        .insertText('```invalidlang')
        .press('Enter')
        .insertText('abc');
      expect(state.doc).toEqualRemirrorDocument(doc(markupBlock('abc'), p()));
    });

    it('keeps alias language name when supported', () => {
      const htmlBlock = codeBlock({ language: 'html' });
      const { state } = add(doc(p('<cursor>')))
        .insertText('```html')
        .press('Enter')
        .insertText('abc');
      expect(state.doc).toEqualRemirrorDocument(doc(htmlBlock('abc'), p()));
    });
  });
});

describe('commands', () => {
  let {
    view,
    add,
    attrNodes: { codeBlock },
    nodes: { doc, p },
  } = create();

  let tsBlock = codeBlock({ language: 'typescript' });

  beforeEach(() => {
    ({
      view,
      add,
      attrNodes: { codeBlock },
      nodes: { doc, p },
    } = create());
    tsBlock = codeBlock({ language: 'typescript' });
  });

  describe('updateCodeBlock ', () => {
    it('updates the language', () => {
      const markupBlock = codeBlock({ language: 'markup' });
      const { actions } = add(doc(markupBlock(`const a = 'test';<cursor>`)));

      expect(view.dom.querySelector('.language-markup code')).toBeTruthy();

      actions.updateCodeBlock({ language: 'javascript' });

      expect(view.dom.querySelector('.language-markup code')).toBeFalsy();
      expect(view.dom.querySelector('.language-javascript code')!.outerHTML).toMatchSnapshot();
    });
  });

  describe('createCodeBlock ', () => {
    it('creates the codeBlock', () => {
      const { state } = add(doc(p(`<cursor>`))).actionsCallback(actions => {
        actions.createCodeBlock({ language: 'typescript' });
      });

      expect(state.doc).toEqualRemirrorDocument(doc(tsBlock('')));
    });

    it('creates the default codeBlock when no language is provided', () => {
      const markupBlock = codeBlock({ language: 'markup' });

      const { state } = add(doc(p(`<cursor>`))).actionsCallback(actions => {
        // @ts-ignore
        actions.createCodeBlock();
      });

      expect(state.doc).toEqualRemirrorDocument(doc(markupBlock('')));
    });
  });

  describe('toggleCodeBlock ', () => {
    it('toggles the codeBlock', () => {
      const { state, actionsCallback } = add(doc(p(`<cursor>`))).actionsCallback(actions => {
        actions.toggleCodeBlock({ language: 'typescript' });
      });

      expect(state.doc).toEqualRemirrorDocument(doc(tsBlock('')));

      const { state: stateTwo } = actionsCallback(actions =>
        actions.toggleCodeBlock({ language: 'typescript' }),
      );
      expect(stateTwo.doc).toEqualRemirrorDocument(doc(p('')));
    });

    it('toggles the default codeBlock when no language is provided', () => {
      const markupBlock = codeBlock({ language: 'markup' });
      const { state: stateOne, actionsCallback } = add(doc(p(`<cursor>`))).actionsCallback(actions => {
        actions.toggleCodeBlock();
      });

      expect(stateOne.doc).toEqualRemirrorDocument(doc(markupBlock('')));

      const { state: stateTwo } = actionsCallback(actions => actions.toggleCodeBlock());
      expect(stateTwo.doc).toEqualRemirrorDocument(doc(p('')));
    });
  });

  describe('formatCodeBlock', () => {
    const formatter: CodeBlockFormatter = ({ cursorOffset, language, source }) => {
      if (getLanguage({ fallback: 'text', language, supportedLanguages }) === 'typescript') {
        return formatWithCursor(source, {
          cursorOffset,
          plugins: [typescriptPlugin],
          parser: 'typescript',
          singleQuote: true,
        });
      }
      return;
    };

    beforeEach(() => {
      ({
        view,
        add,
        attrNodes: { codeBlock },
        nodes: { doc, p },
      } = create({ formatter }));

      tsBlock = codeBlock({ language: 'typescript' });
    });

    it('can format the codebase', () => {
      const { state } = add(
        doc(tsBlock(`const a: string\n = 'test'  ;\n\n\nconsole.log("welcome friends")<cursor>`)),
      ).actionsCallback(actions => actions.formatCodeBlock());

      expect(state.doc).toEqualRemirrorDocument(
        doc(tsBlock(`const a: string = 'test';\n\nconsole.log('welcome friends');\n`)),
      );
    });

    it('maintains cursor position after formatting', () => {
      const { state } = add(
        doc(tsBlock(`const a: string\n = 'test<cursor>'  ;\n\n\nconsole.log("welcome friends")`)),
      )
        .actionsCallback(actions => actions.formatCodeBlock())
        .insertText('ing');

      expect(state.doc).toEqualRemirrorDocument(
        doc(tsBlock(`const a: string = 'testing';\n\nconsole.log('welcome friends');\n`)),
      );
    });

    it('formats text selections', () => {
      const { state, start, end } = add(
        doc(tsBlock(`<start>const a: string\n = 'test'  ;<end>\n\n\nconsole.log("welcome friends")`)),
      ).actionsCallback(actions => actions.formatCodeBlock());

      expect(state.doc).toEqualRemirrorDocument(
        doc(tsBlock(`const a: string = 'test';\n\nconsole.log('welcome friends');\n`)),
      );
      expect([start, end]).toEqual([1, 26]);
    });

    it('can format complex scenarios', () => {
      const content = p('Hello darkness, my old friend.');
      const otherCode = tsBlock(`document.addEventListener("click",  console.log)`);
      const { state } = add(
        doc(
          content,
          content,
          tsBlock(`const a: string\n = 'test<cursor>'  ;\n\n\nconsole.log("welcome friends")`),
          content,
          content,
          otherCode,
        ),
      )
        .actionsCallback(actions => actions.formatCodeBlock())
        .insertText('ing');

      expect(state.doc).toEqualRemirrorDocument(
        doc(
          content,
          content,
          tsBlock(`const a: string = 'testing';\n\nconsole.log('welcome friends');\n`),
          content,
          content,
          otherCode,
        ),
      );
    });
  });
});
