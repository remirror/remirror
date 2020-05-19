import { ExtensionTag, MarkGroup, NodeGroup } from '@remirror/core-constants';
import { isUndefined } from '@remirror/core-helpers';
import { EditorSchema } from '@remirror/core-types';

import {
  AnyExtension,
  ExtensionFactory,
  ExtensionTags,
  isMarkExtension,
  isNodeExtension,
} from '../extension';
import { AnyPreset } from '../preset';
import { GeneralExtensionTags, MarkExtensionTags, NodeExtensionTags } from '../types';

/**
 * Create the extension tags which are passed into each extensions method to
 * enable dynamically generated rules and commands.
 *
 * @builtin
 */
export const TagsExtension = ExtensionFactory.plain({
  name: 'tags',

  onCreate(parameter) {
    const general: GeneralExtensionTags = {
      [ExtensionTag.FormattingMark]: [],
      [ExtensionTag.FormattingNode]: [],
      [ExtensionTag.LastNodeCompatible]: [],
      [ExtensionTag.NodeCursor]: [],
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
          const group = extension.spec.group as NodeGroup;
          const name = extension.name;

          node[group] = isUndefined(node[group]) ? [name] : [...node[group], name];
        }

        if (isMarkExtension(extension)) {
          const group = extension.spec.group as MarkGroup;
          const name = extension.name;

          mark[group] = isUndefined(mark[group]) ? [name] : [...mark[group], name];
        }

        for (const tag of extension.tags as ExtensionTag[]) {
          general[tag] = isUndefined(general[tag])
            ? [extension.name]
            : [...general[tag], extension.name];
        }
      },
      afterExtensionLoop() {
        const { setStoreKey, setManagerMethodParameter, getStoreKey } = parameter;

        setStoreKey('extensionTags', { general, mark, node });
        setManagerMethodParameter('extensionTags', () => getStoreKey('extensionTags'));
      },
    };
  },
});

declare global {
  namespace Remirror {
    interface ManagerStore<ExtensionUnion extends AnyExtension, PresetUnion extends AnyPreset> {
      /**
       * Store the built in and custom tags for the editor instance.
       */
      extensionTags: Readonly<ExtensionTags<ExtensionUnion>>;
    }

    export interface ManagerMethodParameter<Schema extends EditorSchema = EditorSchema> {
      /**
       * The tags provided by the configured extensions.
       */
      extensionTags: () => ExtensionTags<AnyExtension>;
    }
  }
}
