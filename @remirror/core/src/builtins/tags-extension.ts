import { ExtensionTag, MarkGroup, NodeGroup } from '@remirror/core-constants';
import { isUndefined } from '@remirror/core-helpers';
import { EditorSchema } from '@remirror/core-types';

import {
  AnyExtension,
  CreateLifecycleMethod,
  ExtensionTags,
  isMarkExtension,
  isNodeExtension,
  PlainExtension,
} from '../extension';
import { AnyPreset } from '../preset';
import { GeneralExtensionTags, MarkExtensionTags, NodeExtensionTags } from '../types';

/**
 * Create the extension tags which are passed into each extensions method to
 * enable dynamically generated rules and commands.
 *
 * @builtin
 */
export class TagsExtension extends PlainExtension {
  public readonly name = 'tags' as const;

  protected createDefaultSettings() {
    return {};
  }

  protected createDefaultProperties() {
    return {};
  }

  public onCreate: CreateLifecycleMethod = (parameter) => {
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

        if (!extension.tags) {
          return;
        }

        for (const tag of extension.tags) {
          const generalTag = general[tag];
          general[tag] = isUndefined(generalTag)
            ? [extension.name]
            : [...generalTag, extension.name];
        }
      },
      afterExtensionLoop() {
        const { setStoreKey, setExtensionStore } = parameter;
        const tags = { general, mark, node };

        setStoreKey('tags', tags);
        setExtensionStore('tags', () => tags);
      },
    };
  };
}

declare global {
  namespace Remirror {
    interface ManagerStore<ExtensionUnion extends AnyExtension, PresetUnion extends AnyPreset> {
      /**
       * Store the built in and custom tags for the editor instance.
       */
      tags: Readonly<ExtensionTags<ExtensionUnion>>;
    }

    export interface ExtensionStore<Schema extends EditorSchema = EditorSchema> {
      /**
       * The tags provided by the configured extensions.
       */
      tags: () => ExtensionTags<any>;
    }
  }
}
