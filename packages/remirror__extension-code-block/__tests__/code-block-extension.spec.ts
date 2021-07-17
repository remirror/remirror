import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest, renderEditor } from 'jest-remirror';
import typescriptPlugin from 'prettier/parser-typescript';
import { formatWithCursor } from 'prettier/standalone';
import refractor from 'refractor/core';
import graphql from 'refractor/lang/graphql';
import javascript from 'refractor/lang/javascript';
import markdown from 'refractor/lang/markdown';
import tsx from 'refractor/lang/tsx';
import typescript from 'refractor/lang/typescript';
import yaml from 'refractor/lang/yaml';
import {
  BlockquoteExtension,
  BoldExtension,
  CodeBlockExtension,
  CodeBlockOptions,
  CodeExtension,
  createCoreManager,
  FormatterProps,
  getLanguage,
  HardBreakExtension,
} from 'remirror/extensions';
import {
  ExtensionPriority,
  htmlToProsemirrorNode,
  object,
  prosemirrorNodeToHtml,
} from '@remirror/core';

extensionValidityTest(CodeBlockExtension);

describe('schema', () => {
  const { schema } = createCoreManager([
    new CodeBlockExtension({ priority: ExtensionPriority.High }),
  ]);
  const attributes = { language: 'typescript' };
  const content = 'unchanged without decorations';
  const { codeBlock, doc } = pmBuild(schema, {
    codeBlock: { nodeType: 'codeBlock', ...attributes },
  });

  it('creates the correct dom node', () => {
    expect(prosemirrorNodeToHtml(codeBlock(content))).toBe(
      `<pre class="language-${attributes.language}"><code data-code-block-language="${attributes.language}">${content}</code></pre>`,
    );
  });

  it('parses the dom structure and finds itself', () => {
    const node = htmlToProsemirrorNode({
      schema,
      content: `<pre><code class="language-${attributes.language}" data-code-block-language="${attributes.language}">${content}</code></pre>`,
    });
    const expected = doc(codeBlock(content));

    expect(node).toEqualProsemirrorNode(expected);
  });
});

describe('constructor', () => {
  it('is created with the correct default properties and settings', () => {
    const codeBlock = new CodeBlockExtension({ syntaxTheme: 'a11y_dark' });

    expect(codeBlock.options.syntaxTheme).toEqual('a11y_dark');
    expect(codeBlock.options.defaultLanguage).toEqual('markup');
    expect(codeBlock.options.plainTextClassName).toEqual('');
  });
});

const supportedLanguages = [typescript, javascript, markdown, tsx];

function create(options: CodeBlockOptions = object()) {
  return renderEditor([
    new CodeBlockExtension({ ...options, supportedLanguages }),
    new HardBreakExtension(),
    new BoldExtension(),
    new BlockquoteExtension(),
    new CodeExtension(),
  ]);
}

describe('plugin', () => {
  const {
    view,
    add,
    attributeNodes: { codeBlock },
    nodes: { doc, p, hardBreak: br },
  } = create();

  const { dom } = view;

  const tsBlock = codeBlock({ language: 'typescript' });

  it('renders the correct decorations', () => {
    add(doc(tsBlock(`const a = 'test';`)));

    expect(dom.querySelector('.language-typescript code')!.innerHTML).toMatchSnapshot();
  });

  it('can be updated', () => {
    const plainBlock = codeBlock({});
    add(doc(tsBlock(`const a = 'test';<cursor>`), plainBlock('Nothing to see here')))
      .callback(() => {
        expect(dom.querySelector('.language-typescript code')!.innerHTML).toMatchSnapshot();
      })
      .insertText('\n\nlog(a);')
      .callback(() => {
        expect(dom.querySelector('.language-typescript code')!.innerHTML).toMatchSnapshot();
      });
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
      add(doc(tsBlock('<cursor>'))).press('Backspace');

      expect(view.state.doc).toEqualRemirrorDocument(doc(p()));
    });

    it('is still deleted when all that remains is whitespace', () => {
      const { state } = add(doc(tsBlock('<cursor>          '))).press('Backspace');

      expect(state.doc).toEqualRemirrorDocument(doc(p()));
    });

    it('can be deleted when empty with content before', () => {
      add(doc(p('other content'), tsBlock('<cursor>'))).press('Backspace');

      expect(view.state.doc).toEqualRemirrorDocument(doc(p('other content')));
    });

    it('steps into the previous node when content', () => {
      const { state } = add(doc(p(), tsBlock('<cursor>content')))
        .press('Backspace')
        .insertText('abc');

      expect(state.doc).toEqualRemirrorDocument(doc(p('abc'), tsBlock('content')));
    });

    it('avoids stepping into the previous node with non empty selection', () => {
      const { state } = add(doc(p('abc'), tsBlock('<start>code<end>content'))).press('Backspace');

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

      expect(state.doc).toEqualRemirrorDocument(doc(tsBlock('abc')));
    });

    it('responds to empty space input rule using the default language', () => {
      const markupBlock = codeBlock({ language: 'markup' });
      const { state } = add(doc(p('<cursor>'))).insertText('``` abc');

      expect(state.doc).toEqualRemirrorDocument(doc(markupBlock('abc')));
    });

    it('does not match invalid regex', () => {
      const { state } = add(doc(p('<cursor>'))).insertText('```123-__ ');

      expect(state.doc).toEqualRemirrorDocument(doc(p('```123-__ ')));
    });

    it('use default markup for non existent language', () => {
      const markupBlock = codeBlock({ language: 'markup' });
      const { state } = add(doc(p('<cursor>'))).insertText('```abcde abc');

      expect(state.doc).toEqualRemirrorDocument(doc(markupBlock('abc')));
    });

    it('keeps alias language name when supported', () => {
      const htmlBlock = codeBlock({ language: 'html' });
      const { state } = add(doc(p('<cursor>'))).insertText('```html abc');

      expect(state.doc).toEqualRemirrorDocument(doc(htmlBlock('abc')));
    });
  });

  describe('Tab', () => {
    it('responds to `Tab` key press', () => {
      const { state } = add(doc(tsBlock('<cursor>')))
        .press('Tab')
        .insertText('abc');

      expect(state.doc).toEqualRemirrorDocument(doc(tsBlock('\tabc')));
    });
  });

  describe('Enter', () => {
    it('responds to `Enter` key press', () => {
      const { state } = add(doc(p('<cursor>')))
        .insertText('```typescript')
        .press('Enter')
        .insertText('abc');

      expect(state.doc).toEqualRemirrorDocument(doc(tsBlock('abc')));
    });

    it('uses default language when no language provided', () => {
      const markupBlock = codeBlock({ language: 'markup' });
      const { state } = add(doc(p('<cursor>')))
        .insertText('```')
        .press('Enter')
        .insertText('abc');

      expect(state.doc).toEqualRemirrorDocument(doc(markupBlock('abc')));
    });

    it('uses default language when given an invalid language', () => {
      const markupBlock = codeBlock({ language: 'markup' });
      const { state } = add(doc(p('<cursor>')))
        .insertText('```invalidlang')
        .press('Enter')
        .insertText('abc');

      expect(state.doc).toEqualRemirrorDocument(doc(markupBlock('abc')));
    });

    it('keeps alias language name when supported', () => {
      const htmlBlock = codeBlock({ language: 'html' });
      const { state } = add(doc(p('<cursor>')))
        .insertText('```html')
        .press('Enter')
        .insertText('abc');

      expect(state.doc).toEqualRemirrorDocument(doc(htmlBlock('abc')));
    });

    it('should not coexist with `hardBreak`', () => {
      const { state } = add(doc(p('Hello', br(), '<cursor>')))
        .insertText('```')
        .press('Enter')
        .insertText('abc');

      expect(state.doc).toEqualRemirrorDocument(doc(p('Hello', br(), '```'), p('abc')));
    });
  });
});

describe('commands', () => {
  const {
    view,
    add,
    attributeNodes: { codeBlock },
    nodes: { doc, p },
    commands,
  } = create();

  const tsBlock = codeBlock({ language: 'typescript' });

  describe('updateCodeBlock', () => {
    it('updates the language', () => {
      const markupBlock = codeBlock({ language: 'markup' });
      add(doc(markupBlock(`const a = 'test';<cursor>`))).callback((content) => {
        expect(view.dom.querySelector('.language-markup code')).not.toBeNull();

        content.commands.updateCodeBlock({ language: 'javascript' });
        expect(view.dom.querySelector('.language-markup code')).toBeNull();
        expect(view.dom.querySelector('.language-javascript code')!.outerHTML).toMatchSnapshot();
      });
    });
  });

  describe('createCodeBlock', () => {
    it('creates the codeBlock', () => {
      add(doc(p(`<cursor>`)));
      commands.createCodeBlock({ language: 'typescript' });

      expect(view.state.doc).toEqualRemirrorDocument(doc(tsBlock('')));
    });

    it('creates the default codeBlock when no language is provided', () => {
      const markupBlock = codeBlock({ language: 'markup' });
      add(doc(p(`<cursor>`)));

      // @ts-expect-error
      commands.createCodeBlock();

      expect(view.state.doc).toEqualRemirrorDocument(doc(markupBlock('')));
    });
  });

  describe('toggleCodeBlock', () => {
    it('toggles the codeBlock', () => {
      add(doc(p(`<cursor>`)));

      commands.toggleCodeBlock({ language: 'typescript' });
      expect(view.state.doc).toEqualRemirrorDocument(doc(tsBlock('')));

      commands.toggleCodeBlock({ language: 'typescript' });
      expect(view.state.doc).toEqualRemirrorDocument(doc(p('')));
    });

    it('toggles the default codeBlock when no language is provided', () => {
      const markupBlock = codeBlock({ language: 'markup' });
      add(doc(p(`<cursor>`)));

      commands.toggleCodeBlock({});
      expect(view.state.doc).toEqualRemirrorDocument(doc(markupBlock('')));

      commands.toggleCodeBlock({});
      expect(view.state.doc).toEqualRemirrorDocument(doc(p('')));
    });
  });

  describe('formatCodeBlock', () => {
    function formatter({ cursorOffset, language, source }: FormatterProps) {
      if (getLanguage({ fallback: 'text', language }) === 'typescript') {
        return formatWithCursor(source, {
          cursorOffset,
          plugins: [typescriptPlugin],
          parser: 'typescript',
          singleQuote: true,
        });
      }

      return;
    }

    const {
      add,
      attributeNodes: { codeBlock },
      nodes: { doc, p },
    } = create({ formatter });
    const tsBlock = codeBlock({ language: 'typescript' });

    it('can format the codebase', () => {
      add(
        doc(tsBlock(`const a: string\n = 'test'  ;\n\n\nlog("welcome friends")<cursor>`)),
      ).callback(({ commands, view }) => {
        commands.formatCodeBlock();

        expect(view.state.doc).toEqualRemirrorDocument(
          doc(tsBlock(`const a: string = 'test';\n\nlog('welcome friends');\n`)),
        );
      });
    });

    it('maintains cursor position after formatting', () => {
      add(doc(tsBlock(`const a: string\n = 'test<cursor>'  ;\n\n\nlog("welcome friends")`)))
        .callback(({ commands }) => commands.formatCodeBlock())
        .insertText('ing')
        .callback(({ state }) => {
          expect(state.doc).toEqualRemirrorDocument(
            doc(tsBlock(`const a: string = 'testing';\n\nlog('welcome friends');\n`)),
          );
        });
    });

    it('formats text selections', () => {
      add(doc(tsBlock(`<start>const a: string\n = 'test'  ;<end>\n\n\nlog("welcome friends")`)))
        .callback(({ commands }) => {
          commands.formatCodeBlock();
        })
        .callback(({ state, start, end }) => {
          expect(state.doc).toEqualRemirrorDocument(
            doc(tsBlock(`const a: string = 'test';\n\nlog('welcome friends');\n`)),
          );
          expect([start, end]).toEqual([1, 26]);
        });
    });

    it('can format complex scenarios', () => {
      const content = p('Hello darkness, my old friend.');
      const otherCode = tsBlock(`document.addEventListener("click",  log)`);
      add(
        doc(
          content,
          content,
          tsBlock(`const a: string\n = 'test<cursor>'  ;\n\n\nlog("welcome friends")`),
          content,
          content,
          otherCode,
        ),
      )
        .callback(({ commands }) => commands.formatCodeBlock())
        .insertText('ing')
        .callback(({ state }) => {
          expect(state.doc).toEqualRemirrorDocument(
            doc(
              content,
              content,
              tsBlock(`const a: string = 'testing';\n\nlog('welcome friends');\n`),
              content,
              content,
              otherCode,
            ),
          );
        });
    });
  });
});

describe('language', () => {
  const getLang = (language: string) =>
    getLanguage({
      language,
      fallback: '',
    });

  refractor.register(yaml);
  refractor.register(graphql);

  it('yaml', () => {
    // Just here to make sure it's not undefined
    expect(yaml.name).toEqual('yaml');
    expect(yaml.aliases[0]).toEqual('yml');
    expect(getLang('yaml')).toEqual(yaml.name);
    expect(getLang('yml')).toEqual(yaml.aliases[0]);
    expect(getLang('YAML')).toEqual(yaml.name);
    expect(getLang('YML')).toEqual(yaml.aliases[0]);
  });

  it('graphql', () => {
    expect(graphql.name).toEqual('graphql');
    expect(getLang('graphql')).toEqual(graphql.name);
    expect(getLang('GraphQL')).toEqual(graphql.name);
    expect(getLang('GRAPHQL')).toEqual(graphql.name);
  });

  it('handles unknown', () => {
    expect(getLang(`this_language_does_not_exist`)).toEqual('');
  });
});

describe('plain text nodes', () => {
  [
    {},
    { plainTextClassName: undefined },
    { plainTextClassName: '' },
    { plainTextClassName: 'text' },
  ].forEach((plainTextClassNameConfiguration) => {
    it(`renders decorations on plain text based on configuration ${JSON.stringify(
      plainTextClassNameConfiguration,
    )}`, () => {
      const {
        view: { dom },
        add,
        attributeNodes: { codeBlock },
        nodes: { doc },
      } = create({ ...plainTextClassNameConfiguration });

      const tsBlock = codeBlock({ language: 'typescript' });

      add(doc(tsBlock(`const a = 'test';`)));

      expect(dom.querySelector('.language-typescript code')!.innerHTML).toMatchSnapshot();
    });
  });
});

describe('interactions with input rules', () => {
  it('can handle mark input rules', () => {
    const { add, nodes, marks } = create({});
    const { doc, p, codeBlock } = nodes;
    const { bold: b } = marks;

    add(doc(codeBlock('plain markup'), p('<cursor>')))
      .insertText('**bold**')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(
          doc(codeBlock('plain markup'), p(b('bold'))),
        );
      });
  });

  it('can handle node input rules', () => {
    const { add, nodes, marks } = create({});
    const { doc, p, blockquote } = nodes;
    const { code } = marks;

    add(doc(blockquote(p(code('a'))), p('><cursor>')))
      .insertText(' awesome')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(
          doc(blockquote(p(code('a')), p('awesome'))),
        );
      });
  });
});
