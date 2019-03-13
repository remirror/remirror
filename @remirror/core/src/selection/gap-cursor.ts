import { Node as PMNode, ResolvedPos, Schema, Slice } from 'prosemirror-model';
import { Selection, SelectionBookmark } from 'prosemirror-state';
import { GAP_CURSOR_IGNORED_NODE, Side } from '../constants';
import { nodeNameMatchesList } from '../helpers/document';
import { Mapping } from '../types/aliases';
import { EditorSchema, NodeMatch } from '../types/base';

export const GAP_CURSOR_ID = 'gapCursor';

export class GapCursorSelection<GSchema extends Schema = EditorSchema> extends Selection<GSchema> {
  public readonly visible: boolean = false;

  /**
   * Construct a GapCursorSelection
   * @param {ResolvedPos} $pos resolved position
   * @param {Side} side side where the gap cursor is drawn
   */
  constructor($pos: ResolvedPos, public readonly side: Side = Side.LEFT) {
    super($pos, $pos);
  }

  private static privateIgnoredNodes: NodeMatch[] = GAP_CURSOR_IGNORED_NODE;

  static get ignoredNodes(): NodeMatch[] {
    return GapCursorSelection.privateIgnoredNodes;
  }

  public static setIgnoredNodes(matchers: NodeMatch[]) {
    GapCursorSelection.privateIgnoredNodes = matchers;
  }

  public static resetIgnoredNodes() {
    GapCursorSelection.privateIgnoredNodes = GAP_CURSOR_IGNORED_NODE;
  }

  public static isValidTargetNode(node?: PMNode | null): boolean {
    return !!node && !nodeNameMatchesList(node, GapCursorSelection.ignoredNodes);
  }

  public static valid($pos: ResolvedPos) {
    const { parent, nodeBefore, nodeAfter } = $pos;

    const targetNode = GapCursorSelection.isValidTargetNode(nodeBefore)
      ? nodeBefore
      : GapCursorSelection.isValidTargetNode(nodeAfter)
      ? nodeAfter
      : null;

    if (!targetNode || parent.isTextblock) {
      return false;
    }

    const { defaultType } = parent.contentMatchAt($pos.index());
    return Boolean(defaultType && defaultType.isTextblock);
  }

  public static findFrom<GSchema extends Schema = EditorSchema>(
    $pos: ResolvedPos<GSchema>,
    dir: number,
    mustMove = false,
  ): Selection<GSchema> | null | undefined {
    const side = dir === 1 ? Side.RIGHT : Side.LEFT;

    if (!mustMove && GapCursorSelection.valid($pos)) {
      return new GapCursorSelection($pos, side);
    }

    let pos = $pos.pos;

    let next: any = null;

    // Scan up from this position
    for (let d = $pos.depth; ; d--) {
      const parent = $pos.node(d);

      if (side === Side.RIGHT ? $pos.indexAfter(d) < parent.childCount : $pos.index(d) > 0) {
        next = parent.maybeChild(side === Side.RIGHT ? $pos.indexAfter(d) : $pos.index(d) - 1);
        break;
      } else if (d === 0) {
        return null;
      }

      pos += dir;

      const $cur = $pos.doc.resolve(pos);
      if (GapCursorSelection.valid($cur)) {
        return new GapCursorSelection($cur, side);
      }
    }

    // And then down into the next node
    for (;;) {
      next = side === Side.RIGHT ? next.firstChild : next.lastChild;

      if (next === null) {
        break;
      }

      pos += dir;

      const $cur = $pos.doc.resolve(pos);
      if (GapCursorSelection.valid($cur)) {
        return new GapCursorSelection($cur, side);
      }
    }

    return null;
  }

  public static fromJSON<GSchema extends Schema = EditorSchema>(
    doc: PMNode<GSchema>,
    json: { pos: number; type: string },
  ): Selection<GSchema> {
    return new GapCursorSelection(doc.resolve(json.pos));
  }

  public map(doc: PMNode<GSchema>, mapping: Mapping): Selection {
    const $pos = doc.resolve(mapping.map(this.head));
    return GapCursorSelection.valid($pos) ? new GapCursorSelection($pos, this.side) : Selection.near($pos);
  }

  public eq(other: Selection): boolean {
    return other instanceof GapCursorSelection && other.head === this.head;
  }

  public content() {
    return Slice.empty;
  }

  public getBookmark(): SelectionBookmark<GSchema> {
    return new GapCursorBookmark(this.anchor);
  }

  public toJSON() {
    return { pos: this.head, type: GAP_CURSOR_ID };
  }
}

Selection.jsonID(GAP_CURSOR_ID, GapCursorSelection);

export class GapCursorBookmark<GSchema extends Schema = EditorSchema> implements SelectionBookmark<GSchema> {
  constructor(private readonly pos: number) {}

  public map(mapping: Mapping): SelectionBookmark<GSchema> {
    return new GapCursorBookmark(mapping.map(this.pos));
  }

  public resolve(doc: PMNode<GSchema>): Selection<GSchema> {
    const $pos = doc.resolve(this.pos);
    return GapCursorSelection.valid($pos) ? new GapCursorSelection($pos) : Selection.near($pos);
  }
}

export const isGapCursorSelection = (selection: Selection): selection is GapCursorSelection =>
  selection instanceof GapCursorSelection;
