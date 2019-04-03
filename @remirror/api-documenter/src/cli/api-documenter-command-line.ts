import { CommandLineParser } from '@microsoft/ts-command-line';
import { MarkdownAction } from './markdown-action';

export class ApiDocumenterCommandLine extends CommandLineParser {
  constructor() {
    super({
      toolFilename: 'api-documenter',
      toolDescription:
        'Reads *.api.json files produced by api-extractor, ' +
        ' and generates API documentation in various output formats.',
    });
    this._populateActions();
  }

  protected onDefineParameters(): void {
    // override
    // No parameters
  }

  private _populateActions(): void {
    this.addAction(new MarkdownAction(this));
  }
}
