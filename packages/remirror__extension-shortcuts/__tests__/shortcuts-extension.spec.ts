import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { object } from '@remirror/core';

import { ShortcutsExtension, ShortcutsOptions } from '../';

extensionValidityTest(ShortcutsExtension);

function create(options: ShortcutsOptions = object()) {
  const extension = new ShortcutsExtension(options);
  const editor = renderEditor([extension]);

  return { ...editor, editor };
}

describe('inputRules', () => {
  it('replaces sequence with shortcut', () => {
    const {
      nodes: { p, doc },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .insertText('->')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('→')));
      });
  });
});
