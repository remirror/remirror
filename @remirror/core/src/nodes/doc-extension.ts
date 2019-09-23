import { NodeExtensionOptions, NodeExtensionSpec } from '@remirror/core-types';
import { NodeExtension } from '../node-extension';

export interface DocExtensionOptions extends NodeExtensionOptions {
  /**
   * Adjust the content allowed in this prosemirror document.
   *
   * This will alter the schema if changed after initialization and can cause errors.
   * It should only be set **once** per editor.
   *
   * @schema
   */
  content?: string;
}

/**
 * The parent node in a Prosemirror Schema. A representation of the doc is required in all
 * editors
 *
 * @required
 * @builtin
 */
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
