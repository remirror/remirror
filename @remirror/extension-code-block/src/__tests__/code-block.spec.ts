import { fromHTML, toHTML } from '@remirror/core';
import { createBaseTestManager } from '@test-fixtures/schema-helpers';
import { pmBuild } from 'jest-prosemirror';
import { renderEditor } from 'jest-remirror';
import typescript from 'refractor/lang/typescript';
import { CodeBlockExtension, CodeBlockExtensionOptions } from '../';

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

const create = (params: CodeBlockExtensionOptions = {}) =>
  renderEditor({
    attrNodes: [new CodeBlockExtension({ ...params, supportedLanguages: [typescript] })],
  });

describe('plugin', () => {
  let {
    view: { dom },
    add,
    attrNodes: { codeBlock },
    nodes: { doc },
  } = create();

  beforeEach(() => {
    ({
      view: { dom },
      add,
      attrNodes: { codeBlock },
      nodes: { doc },
    } = create());
  });

  it('renders the correct decorations', () => {
    const tsBlock = codeBlock({ language: 'typescript' });
    add(doc(tsBlock(`const a = 'test';`)));

    expect(dom.querySelector('.language-typescript')!.innerHTML).toMatchSnapshot();
  });

  it('can be updated', () => {
    const tsBlock = codeBlock({ language: 'typescript' });
    const plainBlock = codeBlock({});
    const adder = add(doc(tsBlock(`const a = 'test';<cursor>`), plainBlock('Nothing to see here')));

    expect(dom.querySelector('.language-typescript')!.innerHTML).toMatchSnapshot();
    adder.insertText('\n\nconsole.log(a);');
    expect(dom.querySelector('.language-typescript')!.innerHTML).toMatchSnapshot();
  });

  // TODO implement the functionality to update multiple codeBlocks at once.
  it.skip('updates when multiple changes occur', () => {
    const tsBlock = codeBlock({ language: 'typescript' });
    const { overwrite } = add(doc(tsBlock(`const a = 'test';`), tsBlock('let b;')));
    expect(dom.innerHTML).toMatchSnapshot();

    overwrite(doc(tsBlock(`const c = 'test';`), tsBlock('let d;')));
    expect(dom.innerHTML).toMatchSnapshot();
  });
});
