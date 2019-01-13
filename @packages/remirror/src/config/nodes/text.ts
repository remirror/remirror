import { NodeExtension } from '../utils/node-extension';

export class Text extends NodeExtension {
  get name() {
    return 'text';
  }

  get schema() {
    return {
      group: 'inline',
    };
  }
}
