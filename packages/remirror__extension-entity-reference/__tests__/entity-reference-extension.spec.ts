import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { EntityReferenceExtension } from '../';

extensionValidityTest(EntityReferenceExtension);

function create() {
  return renderEditor([new EntityReferenceExtension()]);
}

/**
 * @returns True if the array contains only unique values
 */
const isArrayUnique = (arr: string | Iterable<any> | null | undefined) =>
  Array.isArray(arr) && new Set(arr).size === arr.length;

describe('Highlight marks', () => {
  const {
    add,
    nodes: { p, doc },
  } = create();

  it('Can overlap partially with other highlights', () => {
    const DUMMY_TEXT = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
    const editor = add(doc(p(DUMMY_TEXT)));
    editor.selectText({ from: 1, to: 38 }).commands.addHighlight();
    editor.selectText({ from: 35, to: 74 }).commands.addHighlight();
    const createdHighlights = editor.helpers.getHighlights();
    expect(createdHighlights).toHaveLength(2);
    const createdHighlightIds = createdHighlights.map((h) => h.id);
    expect(isArrayUnique(createdHighlightIds)).toBe(true);
  });

  it('Can overlap completely with other highlights', () => {
    const DUMMY_TEXT = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
    const editor = add(doc(p(DUMMY_TEXT)));
    editor.selectText({ from: 1, to: 74 }).commands.addHighlight();
    editor.selectText({ from: 20, to: 40 }).commands.addHighlight();

    const createdHighlights = editor.helpers.getHighlights();
    expect(createdHighlights).toHaveLength(2);
    const createdHighlightIds = createdHighlights.map((h) => h.id);
    expect(isArrayUnique(createdHighlightIds)).toBe(true);
  });

  it('Can span over multiple nodes', () => {
    const DUMMY_TEXT = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
    const multiNodeEditor = add(doc(p(DUMMY_TEXT.slice(1, 38), DUMMY_TEXT.slice(38, 74))));
    multiNodeEditor.selectText({ from: 1, to: 74 }).commands.addHighlight();
    const createdHighlights = multiNodeEditor.helpers.getHighlights();
    expect(createdHighlights).toHaveLength(1);
  });

  it('Removes highlight', () => {
    const DUMMY_TEXT = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
    const editor = add(doc(p(DUMMY_TEXT)));
    editor.selectText({ from: 74, to: 1 }).commands.addHighlight();
    const createdHighlights = editor.helpers.getHighlights();
    expect(createdHighlights).toHaveLength(1);
    const highlightToRemove = createdHighlights[0];
    editor.selectText({ from: 74, to: 1 }).commands.removeHighlight(highlightToRemove.id, {
      from: highlightToRemove.from,
      to: highlightToRemove.to,
    });
    const updatedHighlights = editor.helpers.getHighlights();
    expect(updatedHighlights).toHaveLength(0);
  });

  it('Has unique IDs', () => {
    const DUMMY_TEXT = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
    const multiNodeEditor = add(doc(p(DUMMY_TEXT.slice(1, 38), DUMMY_TEXT.slice(38, 74))));
    multiNodeEditor.selectText({ from: 1, to: 74 }).commands.addHighlight();
    const createdHighlights = multiNodeEditor.helpers.getHighlights();

    const ids = new Set(createdHighlights.map((h) => h.id));
    expect(createdHighlights).toHaveLength(ids.size);
  });

  describe('getHighlightsAt', () => {
    it('returns highlights at position', () => {
      const editor = add(doc(p('text')));
      editor.selectText({ from: 1, to: 3 }).commands.addHighlight();
      const highlights = editor.helpers.getHighlightsAt(2);
      expect(highlights).toHaveLength(1);
    });

    it(`ignores highlight that stretches over position but has no disjoint highlight on the requested position`, () => {
      const editor = add(doc(p('abc')));
      editor.selectText({ from: 1, to: 2 }).commands.addHighlight();
      editor.selectText({ from: 3, to: 4 }).commands.addHighlight();
      const highlights = editor.helpers.getHighlightsAt(2, false);
      expect(highlights).toEqual([]);
    });
  });
});
