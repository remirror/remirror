import { Decoration } from 'remirror';
import type { AcceptUndefined } from '@remirror/core';

export enum ActionType {
  REDRAW_HIGHLIGHTS,
}
export interface Range {
  /**
   * Document position where the range starts
   */
  from: number;
  /**
   * Document position where the range ends
   */
  to: number;
}
export interface HighlightMarkMetaData extends Range {
  /**
   * Unique identifier of the highlight mark
   */
  id: string;
  /**
   * Text content of the node
   */
  text: string;
}

export type OmitId<Type extends HighlightMarkMetaData> = Omit<Type, 'id'>;

export interface HighlightMarkOptions {
  /**
   * Method to calculate styles
   *
   * @remarks
   *
   * This can be used e.g. to assign different shades of a color depending on
   * the amount of highlight marks in a segment.
   */
  getStyle?: (highlightMarks: HighlightMarkMetaData[][]) => Decoration[];
  blockSeparator?: AcceptUndefined<string>;
  createId?: () => string;
}

export interface HighlightMarkPluginState extends Required<HighlightMarkOptions> {
  highlightMarks: HighlightMarkMetaData[][];
}
