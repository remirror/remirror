import { NodeExtension } from '../node-extension';

export class Text extends NodeExtension {
  get name() {
    return 'text' as const;
  }

  get schema() {
    return {
      group: 'inline',
    };
  }
}
