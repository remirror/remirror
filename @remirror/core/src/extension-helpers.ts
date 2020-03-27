import { DEFAULT_EXTENSION_PRIORITY } from '@remirror/core-constants';

import { AnyExtension, isExtension } from './extension';
import { FlexibleExtension, PrioritizedExtension } from './extension-types';

/**
 * Converts an extension to an object with a priority.
 */
export const convertToPrioritizedExtension = <GExtension extends AnyExtension = any>(
  extension: FlexibleExtension<GExtension>,
): PrioritizedExtension<GExtension> => {
  return isExtension(extension)
    ? { priority: DEFAULT_EXTENSION_PRIORITY, extension }
    : { ...extension };
};
