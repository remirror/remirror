import { NodeExtension } from '../node-extension';

export class Doc extends NodeExtension {
  get name(): 'doc' {
    return 'doc';
  }

  get schema() {
    return {
      content: 'block+',
    };
  }
}
