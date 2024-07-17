import {
  ApplySchemaAttributes,
  assert,
  command,
  CommandFunction,
  CreateExtensionPlugin,
  EditorState,
  extension,
  getTextSelection,
  Helper,
  helper,
  isElementDomNode,
  Mark,
  MarkExtension,
  MarkExtensionSpec,
  MarkSpecOverride,
  PrimitiveSelection,
  ProsemirrorAttributes,
  ProsemirrorNode,
  Transaction,
  uniqueId,
  within,
} from '@remirror/core';
import type { CreateEventHandlers } from '@remirror/extension-events';
import { Node, TagParseRule } from '@remirror/pm/model';
import { EditorStateConfig, TextSelection } from '@remirror/pm/state';
import { DecorationSet } from '@remirror/pm/view';

import {
  EntityReferenceMetaData,
  EntityReferenceOptions,
  EntityReferencePluginState,
} from './types';
import { decorateEntityReferences } from './utils/decorate-entity-references';
import { getDisjoinedEntityReferencesFromNode } from './utils/disjoined-entity-references';
import { joinDisjoinedEntityReferences } from './utils/joined-entity-references';
import { getShortestEntityReference } from './utils/shortest-entity-reference';

/**
 *  Required props to create entityReference marks decorations.
 */
interface StateProps {
  extension: EntityReferenceExtension;
  state: EditorState;
}

interface EntityReferenceState {
  entityReferences: { [key: string]: any };
}

const getEntityReferencesFromPluginState = (props: StateProps): EntityReferenceMetaData[][] => {
  const { extension, state } = props;
  const { entityReferences } = extension.getPluginState<EntityReferencePluginState>(state);
  return entityReferences;
};

/**
 * Creates a decoration set from the passed through state.
 *
 * @param props - see [[`DecorationProps`]]
 */
const createDecorationSet = (props: StateProps) => {
  const { extension, state } = props;
  const entityReferences = getEntityReferencesFromPluginState(props);
  return DecorationSet.create(state.doc, extension.options.getStyle(entityReferences));
};

@extension<EntityReferenceOptions>({
  defaultOptions: {
    getStyle: decorateEntityReferences,
    blockSeparator: undefined,
    onClickMark: () => {},
  },
  handlerKeys: ['onClick'],
})
export class EntityReferenceExtension extends MarkExtension<EntityReferenceOptions> {
  get name(): string {
    // TODO: rename this to entityReference for consistency
    return 'entity-reference' as const;
  }

  createMarkSpec(extra: ApplySchemaAttributes, override: MarkSpecOverride): MarkExtensionSpec {
    const idAttr = `data-entity-reference`;
    return {
      ...override,
      excludes: '',
      attrs: {
        ...extra.defaults(),
        id: { default: '' },
      },
      toDOM: (mark: Mark) => [
        'span',
        {
          ...extra.dom(mark),
          [idAttr]: mark.attrs.id,
        },
        0,
      ],
      parseDOM: [
        {
          tag: `span[${idAttr}]`,
          getAttrs: (node) => {
            if (!isElementDomNode(node)) {
              return false;
            }

            const id = node.getAttribute(idAttr);
            return { ...extra.parse(node), id };
          },
        } satisfies TagParseRule,
        ...(override.parseDOM ?? []),
      ],
    };
  }

  /**
   * Track click events passed through to the editor.
   */
  createEventHandlers(): CreateEventHandlers {
    return {
      /**
       * listens to click events and call the "onClickMark" handler with any of:
       * 1. no argument if the text clicked is not an entity reference
       * 2. the id of the clicked entity reference
       * 3. id of the shortest entity reference in case of overlapping entities
       */
      click: (_event, clickState) => {
        const entityReferences = this.getEntityReferencesAt(clickState.pos);

        if (entityReferences.length === 0) {
          return this.options.onClickMark();
        }

        const shortest = getShortestEntityReference(entityReferences);

        if (shortest) {
          this.options.onClick(shortest);
        }

        return this.options.onClickMark(entityReferences);
      },
    };
  }

  /**
   * Create the extension plugin for inserting decorations into the editor.
   */
  createPlugin(): CreateExtensionPlugin<EntityReferenceState> {
    return {
      state: {
        init: (_: EditorStateConfig, state: EditorState): EntityReferenceState => {
          const entityReferences = this.getDisjoinedEntityReferences(state.doc);
          return { entityReferences };
        },
        apply: (
          _tr: Transaction,
          _value: EntityReferenceState,
          _oldState: EditorState,
          newState: EditorState,
        ): EntityReferenceState => {
          const entityReferences = this.getDisjoinedEntityReferences(newState.doc);
          return { entityReferences };
        },
      },
      props: {
        decorations: (state: EditorState) => createDecorationSet({ state, extension: this }),
      },
    };
  }

  @command()
  addEntityReference(id?: string, attrs: ProsemirrorAttributes = {}): CommandFunction {
    return ({ state, tr, dispatch }) => {
      const { from, to } = state.selection;
      const newMark = this.type.create({ ...attrs, id: id ?? uniqueId() });
      try {
        tr = tr.addMark(from, to, newMark);
      } catch (error: any) {
        throw new Error(
          `Can't add entityReference ${JSON.stringify(
            newMark,
          )} to range {from: ${from}, to: ${to}}: ${error.message}`,
        );
      }

      dispatch?.(tr);
      return true;
    };
  }

  @command()
  removeEntityReference(entityReferenceId: string): CommandFunction {
    return ({ tr, dispatch }) => {
      assert(entityReferenceId, `EntityReference can't be removed without specifying tags its ID!`);

      const singleMark = this.type.create({ id: entityReferenceId });
      try {
        // Remove all entityReference marks with id=entityReferenceId in all the document
        // Getting the last position https://discuss.prosemirror.net/t/getting-the-last-node-and-its-pos-in-the-document/3091
        tr = tr.removeMark(1, tr.doc.content.size, singleMark);
      } catch (error: any) {
        throw new Error(`Can't remove entityReference ${entityReferenceId}: ${error.message}`);
      }
      dispatch?.(tr);
      return true;
    };
  }

  /**
   * Dispatch a transaction that selects the range of the entity reference then scrolls to it.
   *
   * @param entityReferenceId - The entity's reference Id.
   *
   * @returns True if the scrolling was applied, else it returns false
   *
   */
  @command()
  scrollToEntityReference(entityReferenceId: string): CommandFunction {
    return ({ tr, dispatch }) => {
      const entityReference = this.getEntityReferenceById(entityReferenceId);

      if (!entityReference) {
        return false;
      }

      const { doc } = tr;
      const resolvedFrom = doc.resolve(entityReference.from);
      const resolvedTo = doc.resolve(entityReference.to);
      const entityReferenceSelection = TextSelection.between(resolvedFrom, resolvedTo);
      // Select range and scroll into it
      dispatch?.(tr.setSelection(entityReferenceSelection).scrollIntoView());
      return true;
    };
  }

  /**
   * Get all disjoined entityReference attributes from the document.
   */
  @helper()
  getDisjoinedEntityReferences(doc: ProsemirrorNode): Helper<EntityReferenceMetaData[][]> {
    const disjoinedEntityReferences: EntityReferenceMetaData[][] = [];
    doc.descendants((node: Node, pos: number) => {
      const subDisjoinedEntityReferences = getDisjoinedEntityReferencesFromNode(
        node,
        pos,
        this.name,
      );

      if (subDisjoinedEntityReferences.length === 0) {
        return true;
      }

      disjoinedEntityReferences.push(subDisjoinedEntityReferences);
      return true;
    });
    return disjoinedEntityReferences;
  }

  /**
   * Disjoined entityReferences are analog to ProseMirror's marks. When adding a mark
   * that spans two (or more) nodes (like paragraphs), it will be stored as two
   * (or more) marks on each node separately. The same is true for disjoined
   * entityReferences. Therefore, a entityReference that spans multiple paragraphs is
   * internally stored as multiple marks (all having the same entityReference ID as
   * attribute).
   *
   * To get the actual entityReferences (for which each entityReference ID is unique), call
   * `joinDisjoinedEntityReferences`.
   */
  @helper()
  getEntityReferences(
    state: EditorState = this.store.getState(),
  ): Helper<EntityReferenceMetaData[]> {
    const entityReferences = getEntityReferencesFromPluginState({
      extension: this,
      state,
    }).flat();
    return joinDisjoinedEntityReferences(entityReferences);
  }

  /**
   * @param entityReferenceId - The entity's reference Id.
   *
   * @returns EntityReference attributes from the editor's content, undefined if it doesn't exist.
   *
   */
  @helper()
  getEntityReferenceById(
    entityReferenceId: string,
    state: EditorState = this.store.getState(),
  ): Helper<EntityReferenceMetaData | undefined> {
    const entityReferences = getEntityReferencesFromPluginState({
      extension: this,
      state,
    }).flat();
    return joinDisjoinedEntityReferences(entityReferences).find(
      (entityReference) => entityReference.id === entityReferenceId,
    );
  }

  /**
   * @param pos - the position in the root document to find entityReference marks.
   *
   * @returns all entityReferences at a specific position in the editor.
   *
   */
  @helper()
  getEntityReferencesAt(
    pos?: PrimitiveSelection,
    state: EditorState = this.store.getState(),
  ): Helper<EntityReferenceMetaData[]> {
    const { doc, selection } = state;
    const { from, to } = getTextSelection(pos ?? selection, doc);

    const disjointedEntityReferences = getEntityReferencesFromPluginState({
      extension: this,
      state,
    }).flat();
    // Find entityReferences for which a part is at the requested position
    const entityReferenceIdsInPos = new Set(
      disjointedEntityReferences
        .filter(
          (entityReference) =>
            within(from, entityReference.from, entityReference.to) ||
            within(to, entityReference.from, entityReference.to) ||
            within(entityReference.from, from, to) ||
            within(entityReference.to, from, to),
        )
        .map((h) => h.id),
    );
    // Find the entityReferences belonging to the matching disjoint entityReferences
    return joinDisjoinedEntityReferences(disjointedEntityReferences).filter((h) =>
      entityReferenceIdsInPos.has(h.id),
    );
  }
}
