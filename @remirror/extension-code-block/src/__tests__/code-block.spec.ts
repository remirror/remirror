import { fromHTML, toHTML } from '@remirror/core';
import { createBaseTestManager } from '@test-fixtures/schema-helpers';
import { pmBuild } from 'jest-prosemirror';
import { renderEditor } from 'jest-remirror';
import javascript from 'refractor/lang/javascript';
import markdown from 'refractor/lang/markdown';
import typescript from 'refractor/lang/typescript';
import { CodeBlockExtension, CodeBlockExtensionOptions } from '../';
import { getLanguageNamesAndAliases, getSupportedLanguages } from '../code-block-utils';

describe('schema', () => {
  const { schema } = createBaseTestManager([{ extension: new CodeBlockExtension(), priority: 1 }]);
  const attrs = { language: 'typescript' };
  const content = 'unchanged without decorations';

  const { codeBlock, doc } = pmBuild(schema, {
    codeBlock: { nodeType: 'codeBlock', ...attrs },
  });

  it('creates the correct dom node', () => {
    expect(toHTML({ node: codeBlock(content), schema })).toBe(
      `<pre><code class="language-${attrs.language}" data-code-block-language="${attrs.language}">${content}</code></pre>`,
    );
  });

  it('parses the dom structure and finds itself', () => {
    const node = fromHTML({
      schema,
      content: `<pre><code class="language-${attrs.language}" data-code-block-language="${attrs.language}">${content}</code></pre>`,
    });
    const expected = doc(codeBlock(content));
    expect(node).toEqualPMNode(expected);
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

const supportedLanguages = [typescript, javascript, markdown];

const create = (params: CodeBlockExtensionOptions = {}) =>
  renderEditor({
    plainNodes: [],
    attrNodes: [new CodeBlockExtension({ ...params, supportedLanguages })],
  });

describe('plugin', () => {
  let {
    view: { dom },
    add,
    attrNodes: { codeBlock },
    nodes: { doc, p },
  } = create();

  let tsBlock = codeBlock({ language: 'typescript' });

  beforeEach(() => {
    ({
      view: { dom },
      add,
      attrNodes: { codeBlock },
      nodes: { doc, p },
    } = create());
    tsBlock = codeBlock({ language: 'typescript' });
  });

  it('renders the correct decorations', () => {
    add(doc(tsBlock(`const a = 'test';`)));

    expect(dom.querySelector('.language-typescript')!.innerHTML).toMatchSnapshot();
  });

  it('can be updated', () => {
    const plainBlock = codeBlock({});
    const adder = add(doc(tsBlock(`const a = 'test';<cursor>`), plainBlock('Nothing to see here')));

    expect(dom.querySelector('.language-typescript')!.innerHTML).toMatchSnapshot();
    adder.insertText('\n\nconsole.log(a);');
    expect(dom.querySelector('.language-typescript')!.innerHTML).toMatchSnapshot();
  });

  it('updates when multiple changes occur', () => {
    const { overwrite } = add(doc(tsBlock(`const a = 'test';`), tsBlock(`let b;`)));
    expect(dom.innerHTML).toMatchSnapshot();

    overwrite(doc(tsBlock(`const c = 'test';`), tsBlock(`let d;`)));
    expect(dom.innerHTML).toMatchSnapshot();
  });

  it('responds to space input rule', () => {
    const { state } = add(doc(p('<cursor>'))).insertText('```typescript ');
    expect(state).toContainRemirrorDocument(tsBlock());
  });

  it('responds to empty space input rule using the default language', () => {
    const markupBlock = codeBlock({ language: 'markup' });
    const { state } = add(doc(p('<cursor>'))).insertText('``` ');
    expect(state).toContainRemirrorDocument(markupBlock());
  });

  it.only('responds to enter key press', () => {
    const { state } = add(doc(p('<cursor>'))).insertText('```typescript\n');
    expect(state).toContainRemirrorDocument(tsBlock());
  });
});

describe('commands', () => {
  let {
    view,
    add,
    attrNodes: { codeBlock },
    nodes: { doc },
  } = create();

  beforeEach(() => {
    ({
      view,
      add,
      attrNodes: { codeBlock },
      nodes: { doc },
    } = create());
  });

  describe('updateAttrs ', () => {
    it('updates the language', () => {
      const tsBlock = codeBlock({ language: 'typescript' });
      const { actions } = add(doc(tsBlock(`const a = 'test';<cursor>`)));
      expect(view.dom.querySelector('.language-typescript')).toBeTruthy();
      actions.codeBlockUpdateAttrs.command({ language: 'javascript' });
      expect(view.dom.querySelector('.language-typescript')).toBeFalsy();
      expect(view.dom.querySelector('.language-javascript')!.outerHTML).toMatchSnapshot();
    });
  });
});
