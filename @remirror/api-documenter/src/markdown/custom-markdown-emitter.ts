import * as colors from 'colors';

import { ApiItem, ApiModel, IResolveDeclarationReferenceResult } from '@microsoft/api-extractor-model';
import { DocLinkTag, DocNode, StringBuilder } from '@microsoft/tsdoc';

import { DocEmphasisSpan } from '../nodes/doc-empasis-span';
import { CustomDocNodeKind } from '../nodes/doc-enum';
import { DocHeading } from '../nodes/doc-heading';
import { DocMetaData } from '../nodes/doc-meta-data';
import { DocNoteBox } from '../nodes/doc-note-box';
import { DocTable } from '../nodes/doc-table';
import { DocTableCell } from '../nodes/doc-table-cell';
import { IndentedWriter } from '../utils/indented-writer';
import { IMarkdownEmitterContext, IMarkdownEmitterOptions, MarkdownEmitter } from './markdown-emitter';

export interface ICustomMarkdownEmitterOptions extends IMarkdownEmitterOptions {
  contextApiItem: ApiItem | undefined;

  onGetFilenameForApiItem: (apiItem: ApiItem) => string | undefined;
}

export class CustomMarkdownEmitter extends MarkdownEmitter {
  private _apiModel: ApiModel;

  public constructor(apiModel: ApiModel) {
    super();

    this._apiModel = apiModel;
  }

  public emit(
    stringBuilder: StringBuilder,
    docNode: DocNode,
    options: ICustomMarkdownEmitterOptions,
  ): string {
    return super.emit(stringBuilder, docNode, options);
  }

  /** @override */
  protected writeNode(docNode: DocNode, context: IMarkdownEmitterContext, _docNodeSiblings: boolean): void {
    const writer: IndentedWriter = context.writer;

    switch (docNode.kind) {
      case CustomDocNodeKind.MetaData: {
        const docMetaData: DocMetaData = docNode as DocMetaData;
        writer.writeLine('---');
        const items = [
          ['name', `"${docMetaData.name}"`],
          ['route', docMetaData.route],
          ['menu', docMetaData.menu],
        ];

        for (const [key, val] of items) {
          writer.writeLine(`${key}: ${val}`);
        }
        writer.writeLine('---');
        writer.writeLine();
        break;
      }
      case CustomDocNodeKind.Heading: {
        const docHeading: DocHeading = docNode as DocHeading;
        writer.ensureSkippedLine();

        let prefix: string;
        switch (docHeading.level) {
          case 1:
            prefix = '##';
            break;
          case 2:
            prefix = '###';
            break;
          case 3:
            prefix = '###';
            break;
          default:
            prefix = '####';
        }

        writer.writeLine(prefix + ' ' + this.getEscapedText(docHeading.title));
        writer.writeLine();
        break;
      }
      case CustomDocNodeKind.NoteBox: {
        const docNoteBox: DocNoteBox = docNode as DocNoteBox;
        writer.ensureNewLine();

        writer.increaseIndent('> ');

        this.writeNode(docNoteBox.content, context, false);
        writer.ensureNewLine();

        writer.decreaseIndent();

        writer.writeLine();
        break;
      }
      case CustomDocNodeKind.Table: {
        const docTable: DocTable = docNode as DocTable;
        // GitHub's markdown renderer chokes on tables that don't have a blank line above them,
        // whereas VS Code's renderer is totally fine with it.
        writer.ensureSkippedLine();

        context.insideTable = true;

        // Markdown table rows can have inconsistent cell counts.  Size the table based on the longest row.
        let columnCount: number = 0;
        if (docTable.header) {
          columnCount = docTable.header.cells.length;
        }
        for (const row of docTable.rows) {
          if (row.cells.length > columnCount) {
            columnCount = row.cells.length;
          }
        }

        // write the table header (which is required by Markdown)
        writer.write('| ');
        for (let i: number = 0; i < columnCount; ++i) {
          writer.write(' ');
          if (docTable.header) {
            const cell: DocTableCell | undefined = docTable.header.cells[i];
            if (cell) {
              this.writeNode(cell.content, context, false);
            }
          }
          writer.write(' |');
        }
        writer.writeLine();

        // write the divider
        writer.write('| ');
        for (let i: number = 0; i < columnCount; ++i) {
          writer.write(' --- |');
        }
        writer.writeLine();

        for (const row of docTable.rows) {
          writer.write('| ');
          for (const cell of row.cells) {
            writer.write(' ');
            this.writeNode(cell.content, context, false);
            writer.write(' |');
          }
          writer.writeLine();
        }
        writer.writeLine();

        context.insideTable = false;

        break;
      }
      case CustomDocNodeKind.EmphasisSpan: {
        const docEmphasisSpan: DocEmphasisSpan = docNode as DocEmphasisSpan;
        const oldBold: boolean = context.boldRequested;
        const oldItalic: boolean = context.italicRequested;
        context.boldRequested = docEmphasisSpan.bold;
        context.italicRequested = docEmphasisSpan.italic;
        this.writeNodes(docEmphasisSpan.nodes, context);
        context.boldRequested = oldBold;
        context.italicRequested = oldItalic;
        break;
      }
      default:
        super.writeNode(docNode, context, false);
    }
  }

  /** @override */
  protected writeLinkTagWithCodeDestination(
    docLinkTag: DocLinkTag,
    context: IMarkdownEmitterContext<ICustomMarkdownEmitterOptions>,
  ): void {
    const options: ICustomMarkdownEmitterOptions = context.options;

    const result: IResolveDeclarationReferenceResult = this._apiModel.resolveDeclarationReference(
      docLinkTag.codeDestination!,
      options.contextApiItem,
    );

    if (result.resolvedApiItem) {
      const filename: string | undefined = options.onGetFilenameForApiItem(result.resolvedApiItem);

      if (filename) {
        let linkText: string = docLinkTag.linkText || '';
        if (linkText.length === 0) {
          // Generate a name such as Namespace1.Namespace2.MyClass.myMethod()
          linkText = result.resolvedApiItem.getScopedNameWithinPackage();
        }
        if (linkText.length > 0) {
          const encodedLinkText: string = this.getEscapedText(linkText.replace(/\s+/g, ' '));

          context.writer.write('[');
          context.writer.write(encodedLinkText);
          context.writer.write(`](${filename!})`);
        } else {
          console.log(colors.yellow('WARNING: Unable to determine link text'));
        }
      }
    } else if (result.errorMessage) {
      console.log(
        colors.yellow(
          `WARNING: Unable to resolve reference "${docLinkTag.codeDestination!.emitAsTsdoc()}": ` +
            result.errorMessage,
        ),
      );
    }
  }
}
