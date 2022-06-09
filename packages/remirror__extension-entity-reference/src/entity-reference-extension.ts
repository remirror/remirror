import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  CreateExtensionPlugin,
  EditorState,
  extension,
  getTextSelection,
  Helper,
  helper,
  Mark,
  MarkExtension,
  MarkExtensionSpec,
  MarkSpecOverride,
  PrimitiveSelection,
  ProsemirrorNode,
  Transaction,
  uniqueId,
  within,
} from '@remirror/core';
import { Node } from '@remirror/pm/model';
import { DecorationSet } from '@remirror/pm/view';

import {
  ActionType,
  EntityReferenceMetaData,
  EntityReferenceOptions,
  EntityReferencePluginState,
} from './types';
import { decorateEntityReferences } from './utils/decorate-entity-references';
import { getDisjoinedEntityReferencesFromNode } from './utils/disjoined-entity-references';
import { joinDisjoinedEntityReferences } from './utils/joined-entity-references';

/**
 *  Required props to create entityReference marks decorations.
 */
interface StateProps {
  extension: EntityReferenceExtension;
  state: EditorState;
}

const getEntityReferencesFromPluginState = (props: StateProps) => {
  const { extension, state } = props;
  const { entityReferences } = extension.pluginKey.getState(state) as EntityReferencePluginState;
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
    createId: uniqueId,
  },
})
export class EntityReferenceExtension extends MarkExtension<EntityReferenceOptions> {
  get name(): string {
    return 'entity-reference' as const;
  }

  createMarkSpec(extra: ApplySchemaAttributes, override: MarkSpecOverride): MarkExtensionSpec {
    const idAttr = `data-entityReference`;

    return {
      ...override,
      excludes: '',
      attrs: {
        ...extra.defaults(),
        id: { default: '' },
      },
      // Note that we don't implement `ParseDom`.
      // The reasoning behind this is to disable pasting (parsing) the entityReference marks in the editor.
      toDOM: (mark: Mark) => [
        'span',
        {
          [idAttr]: mark.attrs.id,
        },
        0,
      ],
    };
  }

  /**
   * Create the extension plugin for inserting decorations into the editor.
   */
  createPlugin(): CreateExtensionPlugin {
    return {
      state: {
        init: (_: { [key: string]: any }, state: EditorState) => {
          const entityReferences = this.getDisjoinedEntityReferences(state.doc);
          return { entityReferences };
        },
        apply: (_tr: Transaction, _value: any, _oldState: EditorState, newState: EditorState) => {
          const entityReferences = this.getDisjoinedEntityReferences(newState.doc);
          return { entityReferences };
        },
      },
      props: {
        decorations: (state: EditorState) => {
          return createDecorationSet({ state, extension: this });
        },
      },
    };
  }

  @command()
  addEntityReference(id?: string): CommandFunction {
    return ({ state, tr, dispatch }) => {
      const { from, to } = state.selection;
      const newId = id ?? (this.options.createId ? this.options.createId() : uniqueId());
      const newMark = this.type.create({
        id: newId,
      });
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
      if (!entityReferenceId) {
        throw new Error(`EntityReference can't be removed without specifying tags its ID!`);
      }

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

  @command()
  redrawEntityReferences(): CommandFunction {
    return ({ tr, dispatch }) => {
      dispatch?.(
        tr.setMeta(EntityReferenceExtension.name, {
          type: ActionType.REDRAW_ENTITY_REFERENCES,
        }),
      );

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
  getEntityReferences(): Helper<EntityReferenceMetaData[]> {
    const entityReferences = getEntityReferencesFromPluginState({
      extension: this,
      state: this.store.getState(),
    }).flat();
    return joinDisjoinedEntityReferences(entityReferences);
  }

  /**
   * @param pos - the position in the root document to find entityReference marks.
   * @param includeEdges - whether to match entityReferences that start or end exactly on the given pos
   *
   * @returns all entityReferences at a specific position in the editor.
   *
   * In order to use this helper make sure you have the
   * [[`EntityReferenceExtension`]] added to your editor.
   */
  @helper()
  getEntityReferencesAt(
    pos?: PrimitiveSelection,
    includeEdges = true,
  ): Helper<EntityReferenceMetaData[]> {
    const state = this.store.getState();
    const { doc, selection } = state;
    const { from, to } = getTextSelection(pos ?? selection, doc);

    const disjointedEntityReferences = getEntityReferencesFromPluginState({
      extension: this,
      state,
    }).flat();
    // Find entityReferences for which a part is at the requested position
    const entityReferenceIdsInPos = new Set(
      disjointedEntityReferences
        .filter((entityReference) => {
          if (
            within(from, entityReference.from, entityReference.to) ||
            within(to, entityReference.from, entityReference.to) ||
            within(entityReference.from, from, to) ||
            within(entityReference.to, from, to)
          ) {
            if (includeEdges) {
              return true;
            } else if (entityReference.from !== from && entityReference.to !== to) {
              return true;
            }
          }

          return false;
        })
        .map((h) => h.id),
    );

    // Find the entityReferences belonging to the matching disjoint entityReferences
    return joinDisjoinedEntityReferences(disjointedEntityReferences).filter((h) =>
      entityReferenceIdsInPos.has(h.id),
    );
  }
}
