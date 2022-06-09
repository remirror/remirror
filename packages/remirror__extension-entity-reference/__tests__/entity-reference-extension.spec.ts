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

describe('EntityReference marks', () => {
  const {
    add,
    nodes: { p, doc },
  } = create();

  it('Can overlap partially with other entityReferences', () => {
    const DUMMY_TEXT = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
    const editor = add(doc(p(DUMMY_TEXT)));
    editor.selectText({ from: 1, to: 38 }).commands.addEntityReference();
    editor.selectText({ from: 35, to: 74 }).commands.addEntityReference();
    const createdEntityReferences = editor.helpers.getEntityReferences();
    expect(createdEntityReferences).toHaveLength(2);
    const createdEntityReferenceIds = createdEntityReferences.map((h) => h.id);
    expect(isArrayUnique(createdEntityReferenceIds)).toBe(true);
  });

  it('Can overlap completely with other entityReferences', () => {
    const DUMMY_TEXT = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
    const editor = add(doc(p(DUMMY_TEXT)));
    editor.selectText({ from: 1, to: 74 }).commands.addEntityReference();
    editor.selectText({ from: 20, to: 40 }).commands.addEntityReference();

    const createdEntityReferences = editor.helpers.getEntityReferences();
    expect(createdEntityReferences).toHaveLength(2);
    const createdEntityReferenceIds = createdEntityReferences.map((h) => h.id);
    expect(isArrayUnique(createdEntityReferenceIds)).toBe(true);
  });

  it('Can span over multiple nodes', () => {
    const DUMMY_TEXT = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
    const multiNodeEditor = add(doc(p(DUMMY_TEXT.slice(1, 38), DUMMY_TEXT.slice(38, 74))));
    multiNodeEditor.selectText({ from: 1, to: 74 }).commands.addEntityReference();
    const createdEntityReferences = multiNodeEditor.helpers.getEntityReferences();
    expect(createdEntityReferences).toHaveLength(1);
  });

  it('Removes entityReference', () => {
    const DUMMY_TEXT = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
    const editor = add(doc(p(DUMMY_TEXT)));
    editor.selectText({ from: 74, to: 1 }).commands.addEntityReference();
    const createdEntityReferences = editor.helpers.getEntityReferences();
    expect(createdEntityReferences).toHaveLength(1);
    const entityReferenceToRemove = createdEntityReferences[0];
    editor
      .selectText({ from: 74, to: 1 })
      .commands.removeEntityReference(entityReferenceToRemove.id);
    const updatedEntityReferences = editor.helpers.getEntityReferences();
    expect(updatedEntityReferences).toHaveLength(0);
  });

  it('Has unique IDs', () => {
    const DUMMY_TEXT = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
    const multiNodeEditor = add(doc(p(DUMMY_TEXT.slice(1, 38), DUMMY_TEXT.slice(38, 74))));
    multiNodeEditor.selectText({ from: 1, to: 74 }).commands.addEntityReference();
    const createdEntityReferences = multiNodeEditor.helpers.getEntityReferences();

    const ids = new Set(createdEntityReferences.map((h) => h.id));
    expect(createdEntityReferences).toHaveLength(ids.size);
  });

  describe('getEntityReferencesAt', () => {
    it('returns entityReferences at position', () => {
      const editor = add(doc(p('text')));
      editor.selectText({ from: 1, to: 3 }).commands.addEntityReference();
      const entityReferences = editor.helpers.getEntityReferencesAt(2);
      expect(entityReferences).toHaveLength(1);
    });

    it(`ignores entityReference that stretches over position but has no disjoint entityReference on the requested position`, () => {
      const editor = add(doc(p('abc')));
      editor.selectText({ from: 1, to: 2 }).commands.addEntityReference();
      editor.selectText({ from: 3, to: 4 }).commands.addEntityReference();
      const entityReferences = editor.helpers.getEntityReferencesAt(2, false);
      expect(entityReferences).toEqual([]);
    });
  });
});
