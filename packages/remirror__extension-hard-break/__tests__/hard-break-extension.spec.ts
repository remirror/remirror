import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { isTextSelection } from '@remirror/core';

import { HardBreakExtension } from '../';

extensionValidityTest(HardBreakExtension);

describe('schema', () => {
  it('should return the correct textContent', () => {
    const { add, nodes, view } = renderEditor<HardBreakExtension>([new HardBreakExtension()]);
    const { doc, hardBreak: br, p } = nodes;

    const firstParagraph = p('First line', br(), 'Second line');

    expect(firstParagraph.textContent).toBe('First line\nSecond line');

    add(doc(firstParagraph, p('Second paragraph')));

    expect(view.state.doc.textBetween(0, view.state.doc.content.size, '\n\n')).toBe(
      'First line\nSecond line\n\nSecond paragraph',
    );
  });
});

describe('commands', () => {
  it('insertHardBreak', () => {
    const { add, nodes, commands, view } = renderEditor<HardBreakExtension>([
      new HardBreakExtension(),
    ]);
    const { doc, hardBreak: br, p } = nodes;

    add(doc(p('This is content<cursor>')));
    commands.insertHardBreak();

    expect(view.state.doc).toEqualRemirrorDocument(doc(p('This is content', br())));
    expect(isTextSelection(view.state.selection)).toBe(true);
  });
});
