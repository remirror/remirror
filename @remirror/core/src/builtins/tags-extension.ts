import { ExtensionPriority, ExtensionTag, MarkGroup, NodeGroup } from '@remirror/core-constants';
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
  public static readonly defaultPriority = ExtensionPriority.High;

  get name() {
    return 'tags' as const;
  }

  public onCreate: CreateLifecycleMethod = (extensions) => {
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

    for (const extension of extensions) {
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
        general[tag] = isUndefined(generalTag) ? [extension.name] : [...generalTag, extension.name];
      }
    }

    const tags = { general, mark, node };

    this.store.setStoreKey('tags', tags);
    this.store.setExtensionStore('tags', tags);
  };
}

declare global {
  namespace Remirror {
    interface BaseExtension {
      /**
       * Define the tags for this extension.
       *
       * @remarks
       *
       * Tags are a helpful tool for categorizing the behavior of an extension. This
       * behavior is later grouped in the `Manager` and passed to the
       * `extensionStore`. Tags can be used by
       * commands that need to remove all formatting and use the tag to identify
       * which registered extensions are formatters.
       *
       * There are internally defined tags but it's also possible to define any
       * custom string as a tag. See {@link ExtensionTag}
       */
      tags?: Array<ExtensionTag | string>;
    }

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
      tags: ExtensionTags<any>;
    }
  }
}
