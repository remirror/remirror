import { NodeExtension } from '../node-extension';

export class Text extends NodeExtension {
  get name(): 'text' {
    return 'text';
  }

  get schema() {
    return {
      group: 'inline',
    };
  }
}
