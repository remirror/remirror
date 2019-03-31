import { NodeExtension } from '../node-extension';

export class Doc extends NodeExtension {
  get name() {
    return 'doc' as const;
  }

  get schema() {
    return {
      content: 'block+',
    };
  }
}
