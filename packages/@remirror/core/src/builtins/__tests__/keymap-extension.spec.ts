import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { CodeExtension } from 'remirror/extensions';

import { ExtensionPriority } from '@remirror/core-constants';

import { KeymapExtension } from '../../..';

extensionValidityTest(KeymapExtension);

test('supports custom keymaps', () => {
  const mock = jest.fn();
  const {
    manager,
    add,
    nodes: { p, doc },
  } = renderEditor([]);

  manager.getExtension(KeymapExtension).addCustomHandler('keymap', { a: mock });

  add(doc(p('Start<cursor>')))
    .press('a')
    .callback(() => {
      expect(mock).toHaveBeenCalled();
    });
});

test('supports the default keymap', () => {
  const {
    add,
    nodes: { p, doc },
  } = renderEditor([]);

  add(doc(p('Start<cursor>')))
    .press('Enter')
    .callback((content) => {
      expect(content.state.doc).toEqualRemirrorDocument(doc(p('Start'), p('')));
    });
});

test('supports turning the keymap off', () => {
  const builtin = { excludeBaseKeymap: true };
  const {
    add,
    nodes: { p, doc },
  } = renderEditor([], { builtin });

  add(doc(p('Start<cursor>')))
    .press('Enter')
    .callback((content) => {
      expect(content.state.doc).toEqualRemirrorDocument(doc(p('Start')));
    });
});

test('it supports updating options at runtime', () => {
  const {
    manager,
    add,
    nodes: { p, doc },
  } = renderEditor([], { builtin: { excludeBaseKeymap: true } });

  add(doc(p('Start<cursor>')))
    .press('Enter')
    .callback((content) => {
      expect(content.state.doc).toEqualRemirrorDocument(doc(p('Start')));
      manager.getExtension(KeymapExtension).setOptions({ excludeBaseKeymap: false });
    })
    .press('Enter')
    .callback((content) => {
      expect(content.state.doc).toEqualRemirrorDocument(doc(p('Start'), p('')));
    });
});

describe('exitMark', () => {
  const editor = renderEditor([new CodeExtension()], {});
  const { p, doc } = editor.nodes;
  const { code } = editor.marks;

  // Simulate key presses for a real browser.
  editor.manager.getExtension(KeymapExtension).addCustomHandler('keymap', [
    ExtensionPriority.Lowest,
    {
      ArrowRight: ({ tr }) => {
        editor.selectText(Math.min(tr.selection.from + 1, tr.doc.nodeSize - 2));
        return true;
      },
      ArrowLeft: ({ tr }) => {
        editor.selectText(Math.max(tr.selection.from - 1, 1));
        return true;
      },
    },
  ]);

  it('can exit the node backwards', () => {
    editor
      .add(doc(p(code('<cursor>this ')), p('the end')))
      .press('ArrowLeft')
      .insertText('abc');

    expect(editor.state.doc).toEqualRemirrorDocument(doc(p('abc', code('this ')), p('the end')));
  });

  it('can exit the node forwards', () => {
    editor
      .add(doc(p(code('this<cursor>')), p('the end')))
      .press('ArrowRight')
      .insertText('abc');

    expect(editor.state.doc).toEqualRemirrorDocument(doc(p(code('this'), ' abc'), p('the end')));
  });

  it('does nothing when not at the end or start', () => {
    editor.manager.getExtension(KeymapExtension).addCustomHandler('keymap', [
      ExtensionPriority.Lowest,
      {
        ArrowRight: ({ tr }) => {
          editor.selectText(tr.selection.from + 1);
          return true;
        },
      },
    ]);
    editor
      .add(doc(p(code('this<cursor>hello'))))
      .press('ArrowRight')
      .insertText('abc');

    expect(editor.state.doc).toEqualRemirrorDocument(doc(p(code('thishabcello'))));
  });
});
