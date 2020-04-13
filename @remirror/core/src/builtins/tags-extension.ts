import { MarkGroup, NodeGroup, Tag } from '@remirror/core-constants';
import { isUndefined } from '@remirror/core-helpers';

import {
  AnyExtension,
  ExtensionFactory,
  ExtensionTags,
  isMarkExtension,
  isNodeExtension,
} from '../extension';
import { GeneralExtensionTags, MarkExtensionTags, NodeExtensionTags } from '../types';

/**
 * Create the extension tags which are passed into each extensions method to
 * enable dynamically generated rules and commands.
 */
export const CommandsExtension = ExtensionFactory.plain({
  name: 'tags',

  onCreate(parameter) {
    const general: GeneralExtensionTags = {
      [Tag.FormattingMark]: [],
      [Tag.FormattingNode]: [],
      [Tag.LastNodeCompatible]: [],
      [Tag.NodeCursor]: [],
    };

    const mark: MarkExtensionTags = {
      [MarkGroup.Alignment]: [],
      [MarkGroup.Behavior]: [],
      [MarkGroup.Color]: [],
      [MarkGroup.FontStyle]: [],
      [MarkGroup.Indentation]: [],
      [MarkGroup.Link]: [],
      [MarkGroup.Code]: [],
    };

    const node: NodeExtensionTags = {
      [NodeGroup.Block]: [],
      [NodeGroup.Inline]: [],
    };

    return {
      forEachExtension(extension) {
        if (isNodeExtension(extension)) {
          const group = extension.schema.group as NodeGroup;
          const name = extension.name;

          node[group] = isUndefined(node[group]) ? [name] : [...node[group], name];
        }

        if (isMarkExtension(extension)) {
          const group = extension.schema.group as MarkGroup;
          const name = extension.name;

          mark[group] = isUndefined(mark[group]) ? [name] : [...mark[group], name];
        }

        for (const tag of extension.tags as Tag[]) {
          general[tag] = isUndefined(general[tag])
            ? [extension.name]
            : [...general[tag], extension.name];
        }
      },
      afterExtensionLoop() {
        const { setStoreKey } = parameter;

        setStoreKey('tags', { general, mark, node });
      },
    };
  },
});

declare global {
  namespace Remirror {
    interface ManagerStore<ExtensionUnion extends AnyExtension = any> {
      /**
       * Store the built in and custom tags for the editor instance.
       */
      tags: Readonly<ExtensionTags<ExtensionUnion>>;
    }
  }
}
