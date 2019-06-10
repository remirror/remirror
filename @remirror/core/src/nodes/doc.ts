import { NodeExtension } from '../node-extension';
import { NodeExtensionOptions, NodeExtensionSpec } from '../types';

export interface DocExtensionOptions extends NodeExtensionOptions {
  content?: string;
}

export class DocExtension extends NodeExtension<DocExtensionOptions> {
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
