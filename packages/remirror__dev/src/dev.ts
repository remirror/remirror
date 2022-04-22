import { applyDevTools, removeDevTools } from 'prosemirror-dev-toolkit';
import { useEffect } from 'react';
import { useRemirrorContext } from '@remirror/react-core';

/**
 * A React component that should be placed within the remirror context and will
 * automatically wrap the prosemirror view and create a lovely dev tools
 * components.
 *
 * Make sure not to use this in production as it increase the bundle size quite
 * significantly.
 *
 * Built with https://github.com/TeemuKoivisto/prosemirror-dev-toolkit
 */
export const ProsemirrorDevTools = (): null => {
  const { view } = useRemirrorContext();

  useEffect(() => {
    applyDevTools(view);

    return () => {
      removeDevTools();
    };
  }, [view]);

  return null;
};
