import { jest } from '@jest/globals';
import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { createCoreManager } from 'remirror/extensions';
import { BaseExtensionOptions, prosemirrorNodeToHtml, uniqueArray } from '@remirror/core';

import { EntityReferenceExtension } from '../';
import { EntityReferenceOptions } from '../src/types';

extensionValidityTest(EntityReferenceExtension);

const DUMMY_TEXT = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';

interface Options extends EntityReferenceOptions, BaseExtensionOptions {}

function create(options: Options = {}) {
  const { onClick, ...rest } = options;

  const entityReferenceExtension = new EntityReferenceExtension(rest);

  if (onClick) {
    entityReferenceExtension.addHandler('onClick', onClick);
  }

  return renderEditor([entityReferenceExtension]);
}

let editor = create();
let {
  add,
  nodes: { doc, p },
  selectText,
  insertText,
  commands,
  helpers,
  view,
} = editor;

beforeEach(() => {
  editor = create();
  ({
    add,
    nodes: { doc, p },
    selectText,
    insertText,
    helpers,
    commands,
    view,
  } = editor);
});

describe('schema', () => {
  const entityReferenceTester = () => {
    const attributes = { id: 'testId' };
    const { schema } = createCoreManager([new EntityReferenceExtension()]);
    const { entityReference, doc, p } = pmBuild(schema, {
      entityReference: {
        markType: 'entity-reference',
        ...attributes,
      },
    });
    return { schema, entityReference, doc, p };
  };

  it('creates the correct dom node', () => {
    const { p, entityReference } = entityReferenceTester();
    expect(
      prosemirrorNodeToHtml(
        p(
          entityReference('Lorem'),
          'Ipsum is simply dummy text of the printing and typesetting industry.',
        ),
      ),
    ).toMatchInlineSnapshot(`
      <p>
        <span data-entity-reference="testId">
          Lorem
        </span>
        Ipsum is simply dummy text of the printing and typesetting industry.
      </p>
    `);
  });
});

describe('EntityReference marks', () => {
  it('Can overlap partially with other entityReferences', () => {
    add(doc(p(DUMMY_TEXT)));

    selectText({ from: 1, to: 38 });
    commands.addEntityReference();

    selectText({ from: 35, to: 74 });
    commands.addEntityReference();

    const createdEntityReferences = helpers.getEntityReferences();
    expect(createdEntityReferences).toHaveLength(2);
    expect(createdEntityReferences[0]).toMatchInlineSnapshot(
      {
        id: expect.any(String),
      },
      `
      Object {
        "from": 1,
        "id": Any<String>,
        "text": "Lorem Ipsum is simply dummy text of t",
        "to": 38,
      }
    `,
    );
    expect(createdEntityReferences[0]).toMatchInlineSnapshot(
      {
        id: expect.any(String),
      },
      `
      Object {
        "from": 1,
        "id": Any<String>,
        "text": "Lorem Ipsum is simply dummy text of t",
        "to": 38,
      }
    `,
    );

    expect(createdEntityReferences).toEqual(uniqueArray(createdEntityReferences));
  });

  it('Can overlap completely with other entityReferences', () => {
    add(doc(p(DUMMY_TEXT)));

    selectText({ from: 1, to: 74 });
    commands.addEntityReference();

    selectText({ from: 20, to: 40 });
    commands.addEntityReference();

    const createdEntityReferences = helpers.getEntityReferences();
    expect(createdEntityReferences).toHaveLength(2);
    expect(createdEntityReferences[0]).toMatchInlineSnapshot(
      {
        id: expect.any(String),
      },
      `
      Object {
        "from": 20,
        "id": Any<String>,
        "text": "ly dummy text of the",
        "to": 40,
      }
    `,
    );
    expect(createdEntityReferences[1]).toMatchInlineSnapshot(
      {
        id: expect.any(String),
      },
      `
      Object {
        "from": 1,
        "id": Any<String>,
        "text": "Lorem Ipsum is simply dummy text of the printing and typesetting industry",
        "to": 74,
      }
    `,
    );
    expect(createdEntityReferences).toEqual(uniqueArray(createdEntityReferences));
  });

  it('Can span over multiple nodes', () => {
    add(doc(p(DUMMY_TEXT.slice(1, 38), DUMMY_TEXT.slice(38, 74))));

    selectText({ from: 1, to: 74 });
    commands.addEntityReference();

    const createdEntityReferences = helpers.getEntityReferences();
    expect(createdEntityReferences).toHaveLength(1);
    expect(createdEntityReferences[0]).toMatchInlineSnapshot(
      {
        id: expect.any(String),
      },
      `
      Object {
        "from": 1,
        "id": Any<String>,
        "text": "orem Ipsum is simply dummy text of the printing and typesetting industry.",
        "to": 74,
      }
    `,
    );
  });

  it('Removes entityReference', () => {
    add(doc(p(DUMMY_TEXT)));

    selectText({ from: 74, to: 1 });
    commands.addEntityReference();

    const createdEntityReferences = helpers.getEntityReferences();
    expect(createdEntityReferences).toHaveLength(1);

    const entityReferenceToRemove = createdEntityReferences[0];
    commands.removeEntityReference(entityReferenceToRemove.id);

    const updatedEntityReferences = helpers.getEntityReferences();
    expect(updatedEntityReferences).toHaveLength(0);
  });

  it('Has unique IDs', () => {
    add(doc(p(DUMMY_TEXT.slice(1, 38), DUMMY_TEXT.slice(38, 74))));

    selectText({ from: 1, to: 74 });
    commands.addEntityReference();
    const createdEntityReferences = helpers.getEntityReferences();

    const ids = new Set(createdEntityReferences.map((h) => h.id));
    expect(createdEntityReferences).toHaveLength(ids.size);
  });

  describe('getEntityReferencesAt', () => {
    it('returns entityReferences at position', () => {
      add(doc(p('text')));

      selectText({ from: 1, to: 3 });
      commands.addEntityReference();
      selectText({ from: 2, to: 4 });
      commands.addEntityReference();
      selectText({ from: 3, to: 4 });
      commands.addEntityReference();

      const entityReferences = helpers.getEntityReferencesAt(2);
      expect(entityReferences).toHaveLength(2);
    });

    it('returns entityReferences for the given state', () => {
      add(doc(p('Some text')));

      selectText({ from: 3, to: 5 });
      commands.addEntityReference();
      selectText({ from: 3, to: 10 });
      commands.addEntityReference();

      const prevState = editor.state;

      selectText(1);
      insertText('Inserted ');

      const currentEntityReferences = helpers.getEntityReferencesAt(3);
      expect(currentEntityReferences).toHaveLength(0);

      const prevEntityReferences = helpers.getEntityReferencesAt(3, prevState);
      expect(prevEntityReferences).toHaveLength(2);
    });
  });

  describe('getEntityReferenceId', () => {
    it('Returns entityReference by Id', () => {
      add(doc(p('testing text')));
      const entityReference = {
        id: 'testId',
        from: 1,
        to: 8,
        text: 'testing',
      };
      selectText({ from: entityReference.from, to: entityReference.to });
      commands.addEntityReference(entityReference.id);
      const entityReferenceFromDoc = helpers.getEntityReferenceById(entityReference.id);

      expect(entityReferenceFromDoc).toEqual(entityReference);
    });

    it('returns entityReference by Id for the given state', () => {
      add(doc(p('testing text')));
      const entityReference = {
        id: 'testId',
        from: 9,
        to: 13,
        text: 'text',
      };
      selectText({ from: entityReference.from, to: entityReference.to });
      commands.addEntityReference(entityReference.id);

      const prevState = editor.state;

      commands.removeEntityReference(entityReference.id);

      const entityReferenceFromDoc = helpers.getEntityReferenceById(entityReference.id);
      expect(entityReferenceFromDoc).toBeUndefined();

      const prevEntityReferenceFromDoc = helpers.getEntityReferenceById(
        entityReference.id,
        prevState,
      );
      expect(prevEntityReferenceFromDoc).toEqual(entityReference);
    });
  });

  describe('scrollIntoEntityReference', () => {
    it('returns correct range when the selection is not empty', () => {
      const editor = add(doc(p(DUMMY_TEXT)));
      const entityReference = {
        id: 'testId',
        from: 3,
        to: 8,
        text: 'testing',
      };
      commands.selectText({ from: entityReference.from, to: entityReference.to });
      commands.addEntityReference(entityReference.id);

      // Fire an update to remove the current range selection and select all the document instead.
      editor.commands.selectAll();

      expect(editor.state.selection.from).not.toBe(entityReference.from);
      expect(editor.state.selection.to).not.toBe(entityReference.to);

      const selected = commands.scrollToEntityReference(entityReference.id);

      expect(selected).toBeTrue();
      expect(editor.state.selection.from).toBe(entityReference.from);
      expect(editor.state.selection.to).toBe(entityReference.to);
    });
  });

  describe('onClickMark', () => {
    const onClickMark: any = jest.fn(() => false);

    beforeEach(() => {
      ({
        add,
        nodes: { doc, p },
        selectText,
        helpers,
        commands,
        view,
      } = create({ onClickMark }));
    });

    it('responds to mark clicks and passes mark id if click is a mark', () => {
      const node = doc(p('testing text'));
      add(node);
      const entityReference = {
        id: 'testId',
        from: 1,
        to: 8,
        text: 'testing',
      };

      selectText({ from: entityReference.from, to: entityReference.to });
      commands.addEntityReference(entityReference.id);

      view.someProp('handleClickOn', (fn) => fn(view, 2, node, 1, {} as MouseEvent, false));
      expect(onClickMark).toHaveBeenCalledTimes(1);
      expect(onClickMark).toHaveBeenCalledWith([entityReference]);
    });

    it('responds to clicks and passes no argument if click is not a mark', () => {
      const node = doc(p('testing text'));
      add(node);
      const entityReference = {
        id: 'testId',
        from: 1,
        to: 8,
        text: 'testing',
      };

      selectText({ from: entityReference.from, to: entityReference.to });
      commands.addEntityReference(entityReference.id);

      view.someProp('handleClickOn', (fn) => fn(view, 9, node, 1, {} as MouseEvent, false));
      expect(onClickMark).toHaveBeenCalledTimes(1);
      expect(onClickMark).toHaveBeenCalledWith();
    });
  });

  describe('onClick', () => {
    const onClick = jest.fn(() => false);

    beforeEach(() => {
      ({
        add,
        nodes: { doc, p },
        selectText,
        helpers,
        commands,
        view,
      } = create({ onClick }));
    });

    afterEach(() => {
      onClick.mockReset();
    });

    it('responds to mark clicks and passes mark id if click is a mark', () => {
      const node = doc(p('testing text'));
      add(node);
      const entityReference = {
        id: 'testId',
        from: 1,
        to: 8,
        text: 'testing',
      };

      selectText({ from: entityReference.from, to: entityReference.to });
      commands.addEntityReference(entityReference.id);

      view.someProp('handleClickOn', (fn) => fn(view, 2, node, 1, {} as MouseEvent, false));
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith(entityReference);
    });

    it('is not called if click is not an entity reference mark', () => {
      const node = doc(p('testing text'));
      add(node);
      const entityReference = {
        id: 'testId',
        from: 1,
        to: 8,
        text: 'testing',
      };

      selectText({ from: entityReference.from, to: entityReference.to });
      commands.addEntityReference(entityReference.id);

      view.someProp('handleClickOn', (fn) => fn(view, 9, node, 1, {} as MouseEvent, false));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('is called with the shortest mark if there are overlapping entity reference marks', () => {
      const node = doc(p('testing text'));
      add(node);
      const entityReference1 = {
        id: 'testId1',
        from: 1,
        to: 8,
        text: 'testing',
      };

      selectText({ from: entityReference1.from, to: entityReference1.to });
      commands.addEntityReference(entityReference1.id);

      const entityReference2 = {
        id: 'testId2',
        from: 4,
        to: 8,
        text: 'ting',
      };

      selectText({ from: entityReference2.from, to: entityReference2.to });
      commands.addEntityReference(entityReference2.id);

      view.someProp('handleClickOn', (fn) => fn(view, 5, node, 1, {} as MouseEvent, false));
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith(entityReference2);
    });
  });

  describe('extra attributes', () => {
    beforeEach(() => {
      ({
        add,
        nodes: { doc, p },
        selectText,
        helpers,
        commands,
        view,
      } = create({
        extraAttributes: {
          entityType: {
            default: null,
            parseDOM: (dom: any) => dom.getAttribute('data-entity-type'),
            toDOM: (attrs: any) => ['data-entity-type', attrs.entityType],
          },
        },
      }));
    });

    it('can add and return extra attributes', () => {
      add(doc(p('testing text')));
      const entityReference = {
        id: 'testId',
        from: 1,
        to: 8,
        text: 'testing',
        attrs: {
          entityType: 'comment',
        },
      };
      selectText({ from: entityReference.from, to: entityReference.to });
      commands.addEntityReference(entityReference.id, entityReference.attrs);
      const entityReferenceFromDoc = helpers.getEntityReferenceById(entityReference.id);

      expect(entityReferenceFromDoc).toEqual(entityReference);
    });
  });
});
