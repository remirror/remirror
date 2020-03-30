import { BaseExtensionSettings } from '@remirror/core-types';

import { ExtensionCreator } from '../extension-creator';

export interface DocumentExtensionOptions extends BaseExtensionSettings {
  /**
   * Adjust the content allowed in this prosemirror document.
   *
   * This will alter the schema if changed after initialization and can cause
   * errors. It should only be set **once** per editor.
   *
   * @schema
   */
  content?: string;
}

/**
 * This is the default parent node. It is required in the Prosemirror Schema and
 * a representation of the `doc` is required as the top level node in all
 * editors.
 *
 * @required
 * @builtin
 */
export const DocumentExtension = ExtensionCreator.typed<DocumentExtensionOptions>().node({
  name: 'doc',
  defaultSettings: {
    content: 'block+',
  },
  createNodeSchema(parameters) {
    return {
      content: parameters.config.content,
    };
  },
});
