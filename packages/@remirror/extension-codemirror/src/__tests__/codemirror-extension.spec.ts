import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/yaml/yaml';

import type CodeMirror from 'codemirror';
import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { fromHtml, object, toHtml } from '@remirror/core';
import { createCoreManager } from '@remirror/testing';

import { CodeMirrorExtension, CodeMirrorExtensionOptions } from '..';

extensionValidityTest(CodeMirrorExtension);

function getCodeMirrorMode(dom: Element) {
  // get the CodeMirror instance from the dom
  const cm: CodeMirror.Editor = (dom.querySelector('.CodeMirror') as any).CodeMirror;
  return cm?.getMode()?.name;
}

describe('schema', () => {
  const { schema } = createCoreManager([new CodeMirrorExtension()]);
  const content = 'hello world!';
  const { codeMirror, doc } = pmBuild(schema, {
    codeMirror: { nodeType: 'codeMirror' },
  });

  it('creates the correct dom node', () => {
    expect(toHtml({ node: codeMirror(content), schema })).toBe(
      `<pre><code>${content}</code></pre>`,
    );
  });

  it('parses the dom structure and finds itself', () => {
    const node = fromHtml({
      schema,
      content: `<pre><code>${content}</code></pre>`,
    });
    const expected = doc(codeMirror(content));

    expect(node).toEqualProsemirrorNode(expected);
  });
});

const create = (options: CodeMirrorExtensionOptions = object()) => {
  const renderEditorReturn = renderEditor([new CodeMirrorExtension(options)]);

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
};

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
