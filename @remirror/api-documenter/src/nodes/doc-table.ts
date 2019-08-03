import { DocNode, IDocNodeParameters } from '@microsoft/tsdoc';
import { CustomDocNodeKind } from './doc-enum';
import { DocTableCell } from './doc-table-cell';
import { DocTableRow } from './doc-table-row';

/**
 * Constructor parameters for {@link DocTable}.
 */
export interface IDocTableParameters extends IDocNodeParameters {
  headerCells?: readonly DocTableCell[];
  headerTitles?: string[];
}

/**
 * Represents table, similar to an HTML `<table>` element.
 */
export class DocTable extends DocNode {
  public readonly header: DocTableRow;

  private _rows: DocTableRow[];

  public constructor(parameters: IDocTableParameters, rows?: readonly DocTableRow[]) {
    super(parameters);

    this.header = new DocTableRow({ configuration: this.configuration });
    this._rows = [];

    if (parameters) {
      if (parameters.headerTitles) {
        if (parameters.headerCells) {
          throw new Error(
            'IDocTableParameters.headerCells and IDocTableParameters.headerTitles' +
              ' cannot both be specified',
          );
        }
        for (const cellText of parameters.headerTitles) {
          this.header.addPlainTextCell(cellText);
        }
      } else if (parameters.headerCells) {
        for (const cell of parameters.headerCells) {
          this.header.addCell(cell);
        }
      }
    }

    if (rows) {
      for (const row of rows) {
        this.addRow(row);
      }
    }
  }

  /** @override */
  public get kind(): string {
    return CustomDocNodeKind.Table;
  }

  public get rows(): readonly DocTableRow[] {
    return this._rows;
  }

  public addRow(row: DocTableRow): void {
    this._rows.push(row);
  }

  public createAndAddRow(): DocTableRow {
    const row: DocTableRow = new DocTableRow({ configuration: this.configuration });
    this.addRow(row);
    return row;
  }

  /** @override */
  protected onGetChildNodes(): readonly (DocNode | undefined)[] {
    return [this.header, ...this._rows];
  }
}
