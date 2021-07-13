import { CellSelection } from '@remirror/pm/tables';

import { CellSelectionType, getCellSelectionType } from '../src/utils/controller';

describe('getCellSelectionType', () => {
  for (const [isRow, isCol, expected] of [
    [false, false, CellSelectionType.other],
    [true, false, CellSelectionType.row],
    [false, true, CellSelectionType.col],
    [true, true, CellSelectionType.table],
  ]) {
    it(`returns the correct values for isRow=${isRow} isCol=${isCol}`, () => {
      const selection = {
        isRowSelection: () => isRow,
        isColSelection: () => isCol,
      } as CellSelection;
      expect(getCellSelectionType(selection)).toBe(expected);
    });
  }
});
