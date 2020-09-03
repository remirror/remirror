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
          if (!this.options.persistentSelectionClass) {
            return;
          }

          if (selection.empty) {
            return;
          }

          const decorationAttrs = {
            class: this.options.persistentSelectionClass,
          };
          let decoration: Decoration;

          if (isNodeSelection(selection)) {
            decoration = Decoration.node(selection.from, selection.to, decorationAttrs);
          } else {
            decoration = Decoration.inline(selection.from, selection.to, decorationAttrs);
          }

          return DecorationSet.create(doc, [decoration]);
        },
      },
    };
  }
}
