import { Decoration } from 'remirror';
import type { AcceptUndefined } from '@remirror/core';

export enum ActionType {
  REDRAW_HIGHLIGHTS,
}

export interface HighlightAttrs {
  /**
   * Document position where the highlight mark starts
   */
  from: number;
  /**
   * Document position where the highlight mark ends
   */
  to: number;
  /**
   * Unique identifier of the highlight mark
   */
  id: string;
  /**
   * Tag Ids of the highlight mark
   */
  tags: string[];
  /**
   * Text content of the node
   */
  text: string;
}

export type OmitId<Type extends HighlightAttrs> = Omit<Type, 'id'>;

export interface HighlightOptions {
  /**
   * Method to calculate styles
   *
   * @remarks
   *
   * This can be used e.g. to assign different shades of a color depending on
   * the amount of highlight marks in a segment.
   */
  getStyle?: (highlights: HighlightAttrs[][]) => Decoration[];
  blockSeparator?: AcceptUndefined<string>;
}

export interface HighlightPluginState extends Required<HighlightOptions> {
  disjointHighlights: HighlightAttrs[][];
}
