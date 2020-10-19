import { ExtensionPriority } from '@remirror/core-constants';
import type { Static } from '@remirror/core-types';
import { isNodeSelection } from '@remirror/core-utils';
import { Decoration, DecorationSet } from '@remirror/pm/view';

import { extensionDecorator } from '../decorators';
import { PlainExtension } from '../extension';
import type { CreatePluginReturn } from '../types';

export interface PersistentSelectionOptions {
  persistentSelectionClass?: Static<string>;
}

export const DEFAULT_PERSISTENT_SELECTION_CLASS = 'selection';

/**
 * This extension adds a decoration to the selected text and can be used to
 * preserve the marker for the selection when the editor loses focus.
 */
@extensionDecorator<PersistentSelectionOptions>({
  defaultOptions: {
    persistentSelectionClass: DEFAULT_PERSISTENT_SELECTION_CLASS,
  },
  defaultPriority: ExtensionPriority.Medium,
  staticKeys: ['persistentSelectionClass'],
})
export class PersistentSelectionExtension extends PlainExtension<PersistentSelectionOptions> {
  get name() {
    return 'persistentSelection' as const;
  }

  createPlugin(): CreatePluginReturn {
    return {
      props: {
        decorations: ({ doc, selection }) => {
          // Do not run the extension at all when there is no actual decoration
          // to be done.
          if (!this.options.persistentSelectionClass || selection.empty) {
            return;
          }

          const decorationAttrs = {
            class: this.options.persistentSelectionClass,
          };

          const decoration = isNodeSelection(selection)
            ? Decoration.node(selection.from, selection.to, decorationAttrs)
            : Decoration.inline(selection.from, selection.to, decorationAttrs);

          return DecorationSet.create(doc, [decoration]);
        },
      },
    };
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      persistentSelection: PersistentSelectionExtension;
    }
  }
}
