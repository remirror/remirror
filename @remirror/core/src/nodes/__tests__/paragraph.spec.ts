import { createBaseTestManager, ExtensionMap } from '@test-fixtures/schema-helpers';
import { pmBuild } from 'jest-prosemirror';
import { renderEditor } from 'jest-remirror';
import { fromHTML } from '../../helpers';
import { ParagraphExtension, ParagraphExtensionOptions } from '../paragraph';

describe('schema', () => {
  let { schema } = createBaseTestManager([{ extension: new ParagraphExtension(), priority: 1 }]);
  let { doc, p } = pmBuild(schema, {});

  beforeEach(() => {
    ({ schema } = createBaseTestManager([{ extension: new ParagraphExtension(), priority: 1 }]));
    ({ doc, p } = pmBuild(schema, {}));
  });

  it('it can parse content', () => {
    const node = fromHTML({
      content: `<p>hello</p>`,
      schema,
    });
    const expected = doc(p('hello'));
    expect(node).toEqualPMNode(expected);
  });
});

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
