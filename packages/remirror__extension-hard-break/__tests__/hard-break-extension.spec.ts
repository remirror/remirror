import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { isTextSelection } from '@remirror/core';

import { HardBreakExtension } from '../';

extensionValidityTest(HardBreakExtension);

describe('commands', () => {
  it('insertHardBreak', () => {
    const { add, nodes, commands, view } = renderEditor([new HardBreakExtension()]);
    const { doc, hardBreak: br, p } = nodes;

    add(doc(p('This is content<cursor>')));
    commands.insertHardBreak();

    expect(view.state.doc).toEqualRemirrorDocument(doc(p('This is content', br())));
    expect(isTextSelection(view.state.selection)).toBe(true);
  });
});
