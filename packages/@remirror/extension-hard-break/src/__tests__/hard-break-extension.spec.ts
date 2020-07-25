import { renderEditor } from 'jest-remirror';

import { isTextSelection } from '@remirror/core';
import { isExtensionValid } from '@remirror/testing';

import { HardBreakExtension } from '..';

test('`HardBreakExtension`: is valid', () => {
  expect(isExtensionValid(HardBreakExtension)).toBeTrue();
});

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
