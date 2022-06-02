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
  EntityReferenceOptions,
  EntityReferencePluginState,
  HighlightMarkMetaData,
  Range,
} from './types';
import { decorateHighlights } from './utils/decorate-highlights';
import { getDisjoinedHighlightsFromNode } from './utils/disjoined-highlights';
import { joinDisjoinedHighlights } from './utils/joined-highlights';

/**
 *  Required props to create highlight marks decorations.
 */
interface StateProps {
  extension: EntityReferenceExtension;
  state: EditorState;
}

const getHighlightMarksFromPluginState = (props: StateProps) => {
  const { extension, state } = props;
  const { highlightMarks } = extension.pluginKey.getState(state) as EntityReferencePluginState;
  return highlightMarks;
};

/**
 * Creates a decoration set from the passed through state.
 *
 * @param props - see [[`DecorationProps`]]
 */
const createDecorationSet = (props: StateProps) => {
  const { extension, state } = props;
  const highlightMarks = getHighlightMarksFromPluginState(props);
  return DecorationSet.create(state.doc, extension.options.getStyle(highlightMarks));
};

@extension<EntityReferenceOptions>({
  defaultOptions: {
    getStyle: decorateHighlights,
    blockSeparator: undefined,
    createId: uniqueId,
  },
})
export class EntityReferenceExtension extends MarkExtension<EntityReferenceOptions> {
  get name(): string {
    return 'entityReference' as const;
  }

  createMarkSpec(extra: ApplySchemaAttributes, override: MarkSpecOverride): MarkExtensionSpec {
    const idAttr = `data-highlight`;

    return {
      ...override,
      excludes: '',
      attrs: {
        ...extra.defaults(),
        id: { default: '' },
      },
      // Note that we don't implement `ParseDom`.
      // The reasoning behind this is to disable pasting (parsing) the highlight marks in the editor.
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
          const highlightMarks = this.getDisjoinedHighlights(state.doc);
          return { highlightMarks };
        },
        apply: (_tr: Transaction, _value: any, _oldState: EditorState, newState: EditorState) => {
          const highlightMarks = this.getDisjoinedHighlights(newState.doc);
          return { highlightMarks };
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
  addHighlight(id?: string): CommandFunction {
    return ({ state, tr, dispatch }) => {
      const { from, to } = state.selection;
      const newHighlight = {
        id: id ?? this.options.createId ? this.options.createId() : uniqueId(),
      };
      const newHighlightMark = this.type.create(newHighlight);
      try {
        tr = tr.addMark(from, to, newHighlightMark);
      } catch (error: any) {
        throw new Error(
          `Can't add highlight ${JSON.stringify(
            newHighlightMark,
          )} to range {from: ${from}, to: ${to}}`,
          error,
        );
      }

      dispatch?.(tr);
      return true;
    };
  }

  @command()
  removeHighlight(highlightMarkId: string, range: Range): CommandFunction {
    return ({ tr, dispatch }) => {
      const { from, to } = range;

      if (!highlightMarkId) {
        throw new Error(`Highlight can't be removed without specifying tags its ID!`);
      }

      try {
        tr = tr.removeMark(from, to, this.type.create({ id: highlightMarkId }));
      } catch (error: any) {
        throw new Error(
          `Can't remove highlight ${highlightMarkId} to range {from: ${from}, to: ${from}}`,
          error,
        );
      }
      dispatch?.(tr);
      return true;
    };
  }

  @command()
  redrawHighlights(): CommandFunction {
    return ({ tr, dispatch }) => {
      dispatch?.(
        tr.setMeta(EntityReferenceExtension.name, {
          type: ActionType.REDRAW_HIGHLIGHTS,
        }),
      );

      return true;
    };
  }

  /**
   * Get all disjoined highlight attributes from the document.
   */
  @helper()
  getDisjoinedHighlights(doc: ProsemirrorNode): Helper<HighlightMarkMetaData[][]> {
    const disjoinedHighlights: HighlightMarkMetaData[][] = [];
    doc.descendants((node: Node, pos: number) => {
      const subDisjoinedHighlights = getDisjoinedHighlightsFromNode(node, pos);

      if (subDisjoinedHighlights.length === 0) {
        return true;
      }

      disjoinedHighlights.push(subDisjoinedHighlights);
      return true;
    });
    return disjoinedHighlights;
  }

  /**
   * Disjoined highlights are analog to ProseMirror's marks. When adding a mark
   * that spans two (or more) nodes (like paragraphs), it will be stored as two
   * (or more) marks on each node separately. The same is true for disjoined
   * highlights. Therefore, a highlight that spans multiple paragraphs is
   * internally stored as multiple marks (all having the same highlight ID as
   * attribute).
   *
   * To get the actual highlights (for which each highlight ID is unique), call
   * `joinDisjoinedHighlights`.
   */
  @helper()
  getHighlights(): Helper<HighlightMarkMetaData[]> {
    const highlightMarks = getHighlightMarksFromPluginState({
      extension: this,
      state: this.store.getState(),
    }).flat();
    return joinDisjoinedHighlights(highlightMarks);
  }

  /**
   * @param pos - the position in the root document to find highlight marks.
   * @param includeEdges - whether to match highlights that start or end exactly on the given pos
   *
   * @returns all highlights at a specific position in the editor.
   *
   * In order to use this helper make sure you have the
   * [[`HighlightMarkExtension`]] added to your editor.
   */
  @helper()
  getHighlightsAt(pos?: PrimitiveSelection, includeEdges = true): Helper<HighlightMarkMetaData[]> {
    const state = this.store.getState();
    const { doc, selection } = state;
    const { from, to } = getTextSelection(pos ?? selection, doc);

    const disjointedHighlights = getHighlightMarksFromPluginState({
      extension: this,
      state,
    }).flat();
    // Find highlights for which a part is at the requested position
    const highlightIdsInPos = new Set(
      disjointedHighlights
        .filter((highlight) => {
          if (
            within(from, highlight.from, highlight.to) ||
            within(to, highlight.from, highlight.to) ||
            within(highlight.from, from, to) ||
            within(highlight.to, from, to)
          ) {
            if (includeEdges) {
              return true;
            } else if (highlight.from !== from && highlight.to !== to) {
              return true;
            }
          }

          return false;
        })
        .map((h) => h.id),
    );

    // Find the highlights belonging to the matching disjoint highlights
    return joinDisjoinedHighlights(disjointedHighlights).filter((h) => highlightIdsInPos.has(h.id));
  }
}
