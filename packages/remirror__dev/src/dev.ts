import applyDevTools from 'prosemirror-dev-tools';
import { useEffect } from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { useRemirrorContext } from '@remirror/react';

/**
 * A component that should be placed within the remirror context and will
 * automatically wrap the prosemirror view and create a lovely dev tools
 * components.
 *
 * Make sure not to use this in production as it increase the bundle size quite
 * significantly.
 *
 * Built with https://github.com/d4rkr00t/prosemirror-dev-tools
 */
export const ProsemirrorDevTools = (): null => {
  const { view } = useRemirrorContext();

  useEffect(() => {
    applyDevTools(view);

    return () => {
      const node = document.querySelector('.__prosemirror-dev-tools__');

      if (!node) {
        return;
      }

      unmountComponentAtNode(node);

      if (node.parentNode) {
        node.remove();
      }
    };
  }, [view]);

  return null;
};
