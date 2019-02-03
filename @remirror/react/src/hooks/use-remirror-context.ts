import { useContext } from 'react';
import { RemirrorContext } from '../provider';

/**
 * This provides access to the Remirror Editor context using the latest hooks API.
 *
 * TODO First class hooks support is being added and will probably result in a rewrite of several parts of the library.
 */
export const useRemirrorContext = () => {
  return useContext(RemirrorContext);
};
