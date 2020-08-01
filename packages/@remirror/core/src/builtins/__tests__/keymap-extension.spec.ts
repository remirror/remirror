import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { BuiltinPreset } from '@remirror/testing';

import { KeymapExtension } from '..';

extensionValidityTest(KeymapExtension);

test('supports custom keymaps', () => {
  const mock = jest.fn();
  const {
    manager,
    add,
    nodes: { p, doc },
  } = renderEditor([]);

  manager.getPreset(BuiltinPreset).addCustomHandler('keymap', { a: mock });

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
      manager.getPreset(BuiltinPreset).setOptions({ excludeBaseKeymap: false });
    })
    .press('Enter')
    .callback((content) => {
      expect(content.state.doc).toEqualRemirrorDocument(doc(p('Start'), p('')));
    });
});
