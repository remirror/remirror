import { Extension } from './extension';

interface CreatePlainExtensionParams<Name extends string> {}

const createPlainExtension = () => {
  return class extends Extension {};
};

/**
 * A utility for creating extensions. The created extensions are instantiated
 * and placed into the editor to provide different kinds of functionality.
 */
export const ExtensionCreator = {};
