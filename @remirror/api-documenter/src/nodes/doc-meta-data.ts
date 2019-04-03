import { DocNode, IDocNodeParameters } from '@microsoft/tsdoc';
import { CustomDocNodeKind } from './doc-enum';

/**
 * Constructor parameters for {@link DocMetaData}.
 */
export interface IDocMetaDataParameters extends IDocNodeParameters {
  name: string;
  route: string;
  menu: string;
}

/**
 * Represents a section with yaml section meta data. Usually rendered at the top of a file.
 */
export class DocMetaData extends DocNode {
  public readonly name: string;
  public readonly route: string;
  public readonly menu: string;

  /**
   * Don't call this directly.  Instead use {@link TSDocParser}
   * @internal
   */
  public constructor(parameters: IDocMetaDataParameters) {
    super(parameters);
    this.name = parameters.name;
    this.route = parameters.route;
    this.menu = parameters.menu;
  }

  /** @override */
  public get kind(): string {
    return CustomDocNodeKind.MetaData;
  }
}
