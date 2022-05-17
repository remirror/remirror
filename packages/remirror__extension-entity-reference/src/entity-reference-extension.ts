import { uniqueId } from 'remirror';
import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  CreateExtensionPlugin,
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
  ProsemirrorNode,
  within,
} from '@remirror/core';
import { EditorState } from '@remirror/pm/state';
import { DecorationSet } from '@remirror/pm/view';

import {
  ActionType,
  HighlightAttrs,
  HighlightOptions as EntityReferenceOptions,
  HighlightPluginState,
} from './types';
import { decorateHighlights } from './utils/decorate-highlights';
import { getDisjoinedHighlightsFromNode } from './utils/disjoined-highlights';
import { joinDisjoinedHighlights } from './utils/joined-highlights';

export type { HighlightAttrs } from './types';

/**
 *  Required props to create highlight marks decorations.
 */
interface DecorationProps {
  extension: EntityReferenceExtension;
  state: EditorState;
}

/**
 * Creates a decoration set from the passed through state.
 *
 * @param props - see [[`DecorationProps`]]
 */
const createDecorationSet = (props: DecorationProps) => {
  const { extension, state } = props;
  const { disjointHighlights } = extension.pluginKey.getState(state) as HighlightPluginState;
  return DecorationSet.create(state.doc, extension.options.getStyle(disjointHighlights));
};
@extension<EntityReferenceOptions>({
  defaultOptions: {
    getStyle: decorateHighlights,
    blockSeparator: undefined,
  },
})
export class EntityReferenceExtension extends MarkExtension<EntityReferenceOptions> {
  get name(): string {
    return 'entityReference' as const;
  }

  createMarkSpec(extra: ApplySchemaAttributes, override: MarkSpecOverride): MarkExtensionSpec {
    const idAttr = `id`;
    const tagsAttr = `tags`;

    return {
      ...override,
      excludes: '',
      inclusive: false,
      attrs: {
        ...extra.defaults(),
        id: { default: '' },
        tags: { default: [] },
      },
      parseDOM: [
        {
          tag: `span[${idAttr}]`,
          getAttrs: (dom) => {
            if (!isElementDomNode(dom)) {
              return;
            }

            const tagsStr = dom.getAttribute(tagsAttr);
            return {
              id: dom.getAttribute(idAttr),
              tags: tagsStr ? JSON.parse(tagsStr) : tagsStr,
            };
          },
        },
      ],
      toDOM: (mark: Mark) => [
        'span',
        {
          [idAttr]: mark.attrs.id,
          [tagsAttr]: JSON.stringify(mark.attrs.tags),
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
        init: (_, state) => {
          const disjointHighlights = this.getDisjoinedHighlights(state.doc);
          return { disjointHighlights };
        },
        apply: (_tr, _prevState, _oldState, newState) => {
          const disjointHighlights = this.getDisjoinedHighlights(newState.doc);
          const highlights = this.getHighlights();
          return { disjointHighlights, highlights };
        },
      },
      props: {
        decorations: (state) => {
          return createDecorationSet({ state, extension: this });
        },
      },
    };
  }

  @command()
  addHighlight(
    tags: string[],
    /** VisibleForTesting */
    createId = uniqueId,
  ): CommandFunction {
    return ({ state, tr, dispatch }) => {
      if (tags.length === 0) {
        // Highlights can't be added without specifying tags`);
        return false;
      }

      const { from, to } = state.selection;
      const newHighlight = {
        id: createId(),
        tags,
      };
      const newDisjointHighlight = this.type.create(newHighlight);
      try {
        tr = tr.addMark(from, to, newDisjointHighlight);
      } catch (error) {
        throw new Error(
          `Can't add highlight ${JSON.stringify(
            newDisjointHighlight,
          )} to range {from: ${from}, to: ${to}}`,
          error,
        );
        return false;
      }

      dispatch?.(tr);
      return true;
    };
  }
  // https://discuss.prosemirror.net/t/updating-mark-attributes/776/4

  @command()
  updateHighlight(disjointHighlight: HighlightAttrs, tags: string[]): CommandFunction {
    return (props) => {
      let { tr } = props;
      const { dispatch } = props;
      const { from, to } = disjointHighlight;

      const updatedHighlight = {
        ...disjointHighlight,
        tags,
      };
      const highlightToRemove = this.type.create(disjointHighlight);
      const highlightToAdd = this.type.create(updatedHighlight);
      try {
        tr = tr.removeMark(from, to, highlightToRemove);
        tr = tr.addMark(from, to, highlightToAdd);
      } catch (error) {
        throw new Error(
          `Can't update highlight ${JSON.stringify(
            disjointHighlight,
          )} to range {from: ${from}, to: ${to}}`,
          error,
        );
        return false;
      }

      dispatch?.(tr);
      return true;
    };
  }

  @command()
  removeHighlight(disjointHighlight: HighlightAttrs): CommandFunction {
    return ({ tr, dispatch }) => {
      const { id, from, to } = disjointHighlight;

      if (!id) {
        throw new Error(`Highlight can't be removed without specifying tags its ID!`);
      }

      try {
        tr = tr.removeMark(from, to, this.type.create(disjointHighlight));
      } catch (error) {
        throw new Error(
          `Can't remove highlight ${JSON.stringify(
            disjointHighlight,
          )} to range {from: ${from}, to: ${from}}`,
          error,
        );
        return false;
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
  getDisjoinedHighlights(doc: ProsemirrorNode): Helper<HighlightAttrs[][]> {
    const disjoinedHighlights: HighlightAttrs[][] = [];
    doc.descendants((node, pos) => {
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
  getHighlights(): Helper<HighlightAttrs[]> {
    const doc = this.store.getState().doc;
    const highlightsToJoin = this.getDisjoinedHighlights(doc).flat();
    return joinDisjoinedHighlights(highlightsToJoin);
  }

  /**
   * @param pos - the position in the root document to find highlight marks.
   * @param includeEdges - whether to match highlights that start or end exactly on the given pos
   *
   * @returns all highlights at a specific position in the editor.
   *
   * In order to use this helper make sure you have the
   * [[`HighlightExtension`]] added to your editor.
   */
  @helper()
  getHighlightsAt(pos?: PrimitiveSelection, includeEdges = true): Helper<HighlightAttrs[]> {
    const state = this.store.getState();
    const { doc, selection } = state;
    const { from, to } = getTextSelection(pos ?? selection, doc);
    const disjointedHighlights = this.getDisjoinedHighlights(doc).flat();

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
    return this.getHighlights().filter((h) => highlightIdsInPos.has(h.id));
  }
}
