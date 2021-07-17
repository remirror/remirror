import { blockquote as b, createEditor, doc, heading as h, p } from 'jest-prosemirror';

import { trailingNode } from '../';

describe('trailingNode', () => {
  it('adds a new paragraph by default', () => {
    const { state } = createEditor(doc(h('Yo<cursor>')), { plugins: [trailingNode()] }).insertText(
      ' Friend!',
    );

    expect(state.doc).toEqualProsemirrorNode(doc(h('Yo Friend!'), p()));
  });

  it('does not add multiple paragraphs', () => {
    const { state } = createEditor(doc(p('Yo')), { plugins: [trailingNode()] });

    expect(state.doc).toEqualProsemirrorNode(doc(p('Yo')));
  });

  it('dynamically appends paragraphs', () => {
    const { state } = createEditor(doc(p('Yo'), p('<cursor>')), {
      plugins: [trailingNode()],
    }).remirrorCommand(({ tr, dispatch }) => {
      tr.insert(tr.selection.to, h('Greatness'));
      dispatch?.(tr);
      return true;
    });

    expect(state.doc).toEqualProsemirrorNode(doc(p('Yo'), p(), h('Greatness'), p()));
  });

  it('appends the node specified', () => {
    const { state } = createEditor(doc(p('Yo'), p('<cursor>')), {
      plugins: [trailingNode({ nodeName: 'heading' })],
    }).remirrorCommand(({ tr, dispatch }) => {
      tr.insert(tr.selection.to, b('Epic quote'));
      dispatch?.(tr);
      return true;
    });

    expect(state.doc).toEqualProsemirrorNode(doc(p('Yo'), p(), b('Epic quote'), h()));
  });
});
