import { ExtensionFactory } from '../extension/extension-factory';

/**
 * The default text passed into the prosemirror schema.
 *
 * @core
 */
export const TextExtension = ExtensionFactory.node({
  name: 'text',
  createNodeSchema() {
    return { group: 'inline' };
  },
});
