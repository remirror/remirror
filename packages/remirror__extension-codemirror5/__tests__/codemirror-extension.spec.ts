import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/meta';
import 'codemirror/mode/python/python';
import 'codemirror/mode/yaml/yaml';

import CodeMirror from 'codemirror';
import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { htmlToProsemirrorNode, object, prosemirrorNodeToHtml } from 'remirror';
import { createCoreManager } from 'remirror/extensions';

import { CodeMirrorExtension, CodeMirrorExtensionOptions } from '../';

extensionValidityTest(CodeMirrorExtension);

function getCodeMirrorInstance(dom: Element): CodeMirror.Editor | undefined {
  return (dom.querySelector('.CodeMirror') as any).CodeMirror;
}

function getCodeMirrorMode(dom: Element): string | null | undefined {
  return getCodeMirrorInstance(dom)?.getMode()?.name;
}

describe('schema', () => {
  const { schema } = createCoreManager([new CodeMirrorExtension({ CodeMirror })]);
  const content = 'hello world!';
  const { codeMirror, doc } = pmBuild(schema, {
    codeMirror: { nodeType: 'codeMirror' },
  });

  it('creates the correct dom node', () => {
    expect(prosemirrorNodeToHtml(codeMirror(content))).toBe(`<pre><code>${content}</code></pre>`);
  });

  it('parses the dom structure and finds itself', () => {
    const node = htmlToProsemirrorNode({
      schema,
      content: `<pre><code>${content}</code></pre>`,
    });
    const expected = doc(codeMirror(content));

    expect(node).toEqualProsemirrorNode(expected);
  });
});

function create(options: CodeMirrorExtensionOptions = object()) {
  const renderEditorReturn = renderEditor([new CodeMirrorExtension({ ...options, CodeMirror })]);

  const {
    add,
    nodes: { doc, p },
    commands,
    view,
    attributeNodes: { codeMirror },
  } = renderEditorReturn;
  const { dom } = view;
  const plainBlock = codeMirror({ codeMirrorConfig: { mode: 'text/plain' } });
  const pyBlock = codeMirror({ codeMirrorConfig: { mode: 'text/x-python' } });
  return {
    add,
    view,
    doc,
    p,
    codeMirror,
    plainBlock,
    pyBlock,
    dom,
    commands,
  };
}

describe('nodeView', () => {
  it('renders the CodeMirror editor', () => {
    const { add, doc, plainBlock, dom } = create();

    add(doc(plainBlock(`hello`)));
    expect(dom.querySelector('.CodeMirror')).not.toBeNil();
  });

  describe('syntax highlight', () => {
    it('reanders Python correctly', () => {
      const { add, doc, pyBlock, dom } = create();
      // In Python, `print` is a builtin function.
      add(doc(pyBlock(`print('hi')`)));
      expect(dom.querySelector('.cm-builtin')!.innerHTML).toMatch('print');
    });

    it('reanders plain text correctly', () => {
      const { add, doc, plainBlock, dom } = create();
      add(doc(plainBlock(`print('hi')`)));
      expect(dom.querySelector('.cm-builtin')).toBeNil();
    });
  });

  describe('load mode by language name', () => {
    for (const [inputLanguage, expectedMode] of [
      ['javascript', 'javascript'],
      ['JavaScript', 'javascript'],
      ['JS', 'javascript'],
      ['Python', 'python'],
      ['yaml', 'yaml'],
      ['yml', 'yaml'],
    ]) {
      it(`can parse "${inputLanguage}"`, () => {
        const { add, doc, codeMirror, dom } = create();

        const codeMirrorNode = codeMirror({ language: inputLanguage })('');
        add(doc(codeMirrorNode));
        expect(getCodeMirrorMode(dom)).toEqual(expectedMode);
      });
    }
  });

  it('can be updated', () => {
    const { add, plainBlock, doc, dom } = create();
    add(doc(plainBlock(`hello`)))
      .callback(() => {
        expect(dom.querySelector('.CodeMirror-line')!.innerHTML).toMatchSnapshot();
      })
      .insertText(' world')
      .callback(() => {
        expect(dom.querySelector('.CodeMirror-line')!.innerHTML).toMatchSnapshot();
      });
  });

  describe('selection', () => {
    it('can be selected around', () => {
      const { add, plainBlock, doc, p, view } = create();
      const chain = add(doc(p('1<start>2'), plainBlock(`3`), p('4<end>5')));
      expect(chain.start).toBe(2);
      expect(chain.start).toBe(view.state.selection.from);
      expect(chain.end).toBe(9);
      expect(chain.end).toBe(view.state.selection.to);
    });

    it('can be selected around and deleted', () => {
      const { add, plainBlock, doc, p } = create();

      for (const key of ['Delete', 'Backspace']) {
        const chain = add(doc(p('1<start>2'), plainBlock(`3`), p('4<end>5'))).press(key);
        expect(chain.start).toBe(2);
        expect(chain.end).toBe(2);
        expect(chain.doc).toEqualRemirrorDocument(doc(p('15')));
      }
    });

    it('can set selection inside the codemirror', async () => {
      const { add, plainBlock, doc, p } = create();

      const chain = add(doc(p('12'), plainBlock(`34567`), p('89')))
        .selectText({ from: 6, to: 9 })
        .backspace();
      expect(chain.doc).toEqualRemirrorDocument(doc(p('12'), plainBlock('37'), p('89')));
    });
  });

  // JSDom has a bad implement for keyboard events. We will need to do lots of mock
  // in order to test the keyboard interaction between CodeMirror and Prosemirror.
  // jest-playwright might be a better solution for this.
  it.todo('keymap');
});

describe('commands', () => {
  describe('createCodeMirror', () => {
    const { view, add, codeMirror, doc, p, commands } = create();
    const jsBlock = codeMirror({ language: 'javascript' });

    it('creates the codeBlock', () => {
      add(doc(p(`<cursor>`)));
      commands.createCodeMirror({ language: 'javascript' });
      expect(view.state.doc).toEqualRemirrorDocument(doc(jsBlock('')));
    });
  });

  describe('updateCodeMirror', () => {
    const { add, codeMirror, doc, dom } = create();
    const jsBlock = codeMirror({ language: 'javascript' });

    it('updates the language', () => {
      add(doc(jsBlock())).callback((content) => {
        expect(getCodeMirrorMode(dom)).toEqual('javascript');

        content.commands.updateCodeMirror({ language: 'python' });
        expect(getCodeMirrorMode(dom)).toEqual('python');
      });
    });
  });
});
