import { NodeExtension } from '../node-extension';
import { NodeExtensionOptions, NodeExtensionSpec } from '../types';

export interface DocOptions extends NodeExtensionOptions {
  content?: string;
}

export class Doc extends NodeExtension<DocOptions> {
  get name() {
    return 'doc' as const;
  }

  get defaultOptions() {
    return {
      content: 'block+',
    };
  }

  get schema(): NodeExtensionSpec {
    return {
      content: this.options.content,
    };
  }
}
