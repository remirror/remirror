import { useContext } from 'react';
import { RemirrorContext } from '../provider';

/**
 * This provides access to the Remirror Editor context using the latest hooks API.
 */
export const useRemirrorContext = () => {
  return useContext(RemirrorContext);
};
