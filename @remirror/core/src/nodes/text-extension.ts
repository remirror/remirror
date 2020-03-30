import { ExtensionCreator } from '../extension-creator';

/**
 * The default text passed into the prosemirror schema.
 *
 * @builtin
 */
export const TextExtension = ExtensionCreator.node({
  name: 'text',
  createNodeSchema() {
    return { group: 'inline' };
  },
});
