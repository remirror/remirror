import { NodeExtension } from '../node-extension';

export class Doc extends NodeExtension {
  public readonly name = 'doc';

  get schema() {
    return {
      content: 'block+',
    };
  }
}
