import { ApiModel } from '@microsoft/api-extractor-model';
import { CommandLineParser } from '@microsoft/ts-command-line';
import { MarkdownDocumenter } from '../documenters/markdown-documenter';
import { BaseAction } from './base-action';

export class MarkdownAction extends BaseAction {
  constructor(_: CommandLineParser) {
    super({
      actionName: 'markdown',
      summary: 'Generate documentation as Markdown files (*.md)',
      documentation:
        'Generates API documentation as a collection of files in' +
        ' Markdown format, suitable for example for publishing on a GitHub site.',
    });
  }

  protected onExecute(): Promise<void> {
    // override
    const apiModel: ApiModel = this.buildApiModel();
    const markdownDocumenter: MarkdownDocumenter = new MarkdownDocumenter(apiModel);
    markdownDocumenter.generateFiles(this.outputFolder);
    return Promise.resolve();
  }
}
