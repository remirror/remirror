import { NodeExtension } from '../node-extension';

export class Doc extends NodeExtension {
  get name() {
    return 'doc';
  }

  get schema() {
    return {
      content: 'block+',
    };
  }
}
