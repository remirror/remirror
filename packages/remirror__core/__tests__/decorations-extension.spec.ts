import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { DecorationsExtension } from '../';

extensionValidityTest(DecorationsExtension);

describe('options', () => {
  describe('persistentSelectionClass', () => {
    it.each([
      {},
      { persistentSelectionClass: undefined },
      { persistentSelectionClass: '' },
      { persistentSelectionClass: 'selection' },
    ])('uses provided configuration (%j)', (configuration) => {
      const {
        add,
        dom,
        selectText,
        nodes: { p, doc },
      } = renderEditor([], { builtin: configuration });

      add(doc(p('Some text')));
      selectText({ from: 4, to: 9 });

      expect(dom.outerHTML).toMatchSnapshot();
    });

    it('retains selection and decoration', () => {
      const builtin = { persistentSelectionClass: 'selection' };
      const editor = renderEditor([], { builtin });
      const {
        add,
        dom,
        selectText,
        nodes: { p, doc },
      } = editor;

      add(doc(p('Some text')));
      const range = { from: 4, to: 9 };
      selectText(range);

      // Verify that the selection has been applied
      expect(editor.state.selection.from).toBe(range.from);
      expect(editor.state.selection.to).toBe(range.to);

      (editor.view.dom as HTMLElement).blur();

      expect(dom.outerHTML).toMatchSnapshot();
      expect(editor.state.selection.from).toBe(range.from);
      expect(editor.state.selection.to).toBe(range.to);
    });
  });
});
