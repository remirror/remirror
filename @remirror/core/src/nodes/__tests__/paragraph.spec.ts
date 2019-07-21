import { ExtensionMap } from '@test-fixtures/schema-helpers';
import { renderEditor } from 'jest-remirror';
import { ParagraphExtension, ParagraphExtensionOptions } from '../paragraph';

const { heading } = ExtensionMap.nodes;
const create = (params: ParagraphExtensionOptions = { ensureTrailingParagraph: true }) =>
  renderEditor({
    plainNodes: [new ParagraphExtension({ ...params }), heading],
  });

describe('plugin', () => {
  let {
    add,
    nodes: { doc, p, heading: h },
  } = create();

  beforeEach(() => {
    ({
      add,
      nodes: { doc, p, heading: h },
    } = create());
  });

  it('adds a new paragraph when needed', () => {
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

  it('does nothing when `ensureTrailingParagraph` is false', () => {
    ({
      add,
      nodes: { doc, p, heading: h },
    } = create({ ensureTrailingParagraph: false }));

    const { state } = add(doc(p('Yo'), p('<cursor>'))).insertText('# Greatness');
    expect(state.doc).toEqualRemirrorDocument(doc(p('Yo'), h('Greatness')));
  });
});
