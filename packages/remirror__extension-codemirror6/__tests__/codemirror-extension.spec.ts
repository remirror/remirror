import { renderEditor } from 'jest-remirror';

import { CodeMirrorExtension } from '../';

function create() {
  const renderEditorReturn = renderEditor<CodeMirrorExtension>([new CodeMirrorExtension()]);

  const {
    add,
    nodes: { doc, p },
    commands,
    view,
    attributeNodes: { codeMirror },
  } = renderEditorReturn;
  const { dom } = view;
  const plainBlock = codeMirror();
  const pyBlock = codeMirror({ language: 'python' });
  const jsBlock = codeMirror({ language: 'javascript' });
  return {
    add,
    view,
    doc,
    p,
    codeMirror,
    plainBlock,
    pyBlock,
    jsBlock,
    dom,
    commands,
  };
}

describe('commands', () => {
  describe('createCodeMirror', () => {
    const { view, add, jsBlock, doc, p, commands } = create();

    it('creates the codeBlock', () => {
      add(doc(p(`<cursor>`)));
      commands.createCodeMirror({ language: 'javascript' });
      expect(view.state).toEqualRemirrorState(doc(jsBlock('<cursor>')));
    });
  });

  describe('updateCodeMirror', () => {
    const { add, view, doc, jsBlock, pyBlock, commands } = create();

    it('updates the language', () => {
      add(doc(pyBlock('aaa'), pyBlock('bb<cursor>b'), pyBlock('ccc')));
      commands.updateCodeMirror({ language: 'javascript' });
      expect(view.state).toEqualRemirrorState(
        doc(pyBlock('aaa'), jsBlock('bb<cursor>b'), pyBlock('ccc')),
      );
    });
  });
});
