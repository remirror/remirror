import { extensionValidityTest, renderEditor } from 'jest-remirror';
import {
  BlockquoteExtension,
  HeadingExtension,
  TrailingNodeExtension,
  TrailingNodeOptions,
} from 'remirror/extensions';

extensionValidityTest(TrailingNodeExtension);

function create(params?: Partial<TrailingNodeOptions>) {
  const {
    add,
    nodes: { doc, p, heading, blockquote },
  } = renderEditor(() => [
    new TrailingNodeExtension(params),
    new HeadingExtension(),
    new BlockquoteExtension(),
  ]);

  return { add, doc, p, h: heading, b: blockquote };
}

describe('plugin', () => {
  const { add, doc, p, h } = create();

  it('adds a new paragraph by default', () => {
    const { state } = add(doc(h('Yo')));

    expect(state.doc).toEqualRemirrorDocument(doc(h('Yo'), p()));
  });

  it('does not add multiple paragraphs', () => {
    const { state } = add(doc(p('Yo')));

    expect(state.doc).toEqualRemirrorDocument(doc(p('Yo')));
  });

  it('dynamically appends paragraphs', () => {
    const { state } = add(doc(p('Yo'), p('<cursor>'))).insertText('# Greatness');

    expect(state.doc).toEqualRemirrorDocument(doc(p('Yo'), h('Greatness'), p()));
  });

  it('appends the node specified', () => {
    const { add, doc, p, h, b } = create({ nodeName: 'heading' });

    const { state } = add(doc(p('Yo'), p('<cursor>'))).insertText('> Epic quote');

    expect(state.doc).toEqualRemirrorDocument(doc(p('Yo'), b(p('Epic quote')), h()));
  });
});
