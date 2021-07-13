import { FindProsemirrorNodeResult } from '@remirror/core';

export type FindTable = () => FindProsemirrorNodeResult | undefined;
export interface CellAxis {
  row: number;
  col: number;
}
