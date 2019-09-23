import { ExtensionMap } from '@remirror/test-fixtures';
import { renderEditor } from 'jest-remirror';
import { TrailingNodeExtension, TrailingNodeExtensionOptions } from '../trailing-node-extension';

const { heading: headingNode, blockquote: blockquoteNode } = ExtensionMap.nodes;
const create = (params: Partial<TrailingNodeExtensionOptions> = {}) =>
  renderEditor({
    plainNodes: [headingNode, blockquoteNode],
    others: [new TrailingNodeExtension(params)],
  });
describe('plugin', () => {
  let {
    add,
    nodes: { doc, p, heading: h, blockquote },
  } = create();

  beforeEach(() => {
    ({
      add,
      nodes: { doc, p, heading: h },
    } = create());
  });

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
    ({
      add,
      nodes: { doc, p, heading: h, blockquote },
    } = create({ nodeName: 'heading' }));

    const { state } = add(doc(p('Yo'), p('<cursor>'))).insertText('> Epic quote');
    expect(state.doc).toEqualRemirrorDocument(doc(p('Yo'), blockquote(p('Epic quote')), h()));
  });
});
