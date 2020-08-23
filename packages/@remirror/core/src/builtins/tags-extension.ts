import {
  ErrorConstant,
  ExtensionPriority,
  ExtensionTag,
  ExtensionTagType,
} from '@remirror/core-constants';
import { includes, invariant, object, values } from '@remirror/core-helpers';

import { extensionDecorator } from '../decorators';
import { AnyExtension, PlainExtension } from '../extension';
import type { AnyCombinedUnion } from '../preset';
import type { GetNameUnion } from '../types';

/**
 * Create the extension tags which are passed into each extensions method to
 * enable dynamically generated rules and commands.
 *
 * Tags on nodes and marks are automatically added to the schema as groups.
 *
 * @builtin
 */
@extensionDecorator({ defaultPriority: ExtensionPriority.Highest })
export class TagsExtension extends PlainExtension {
  get name() {
    return 'tags' as const;
  }

  /**
   * Track the tags which have been applied to the extensions in this editor.
   */
  #combinedTags: CombinedTags = object();

  /**
   * Create the tags which are used to identify extension with particular
   * behavioral traits.
   */
  onCreate(): void {
    this.resetTags();

    for (const extension of this.store.extensions) {
      this.updateTagForExtension(extension);
    }

    this.store.setStoreKey('tags', this.#combinedTags);
    this.store.setExtensionStore('tags', this.#combinedTags);
  }

  /**
   * Reset the tags to the empty object with empty arrays.
   */
  private resetTags() {
    const combinedTags: CombinedTags = object();

    for (const tagName of values(ExtensionTag)) {
      combinedTags[tagName] = [];
    }

    this.#combinedTags = combinedTags;
  }

  /**
   * Update the tags object for each extension.
   */
  private updateTagForExtension(extension: AnyExtension) {
    if (
      !extension.tags ||
      this.store.managerSettings.exclude?.tags ||
      extension.options.exclude?.tags
    ) {
      // Exit early when the editor configuration requires it.
      return;
    }

    for (const tag of extension.tags) {
      invariant(isExtensionTag(tag), {
        code: ErrorConstant.EXTENSION,
        message: `The tag provided by the extension: ${extension.constructor.name} is not supported by the editor. To add new tags you can use the 'mutateTag' method.`,
      });
      // Add tags to the combined tags stored here.
      this.#combinedTags[tag].push(extension.name);
    }
  }
}

/**
 * Check if the provided string is an extension tag.
 */
export function isExtensionTag(value: string): value is ExtensionTagType {
  return includes(values(ExtensionTag), value);
}

/**
 * The shape of the tag data stored by the extension manager.
 *
 * This data can be used by other extensions to dynamically determine which
 * nodes should affected by commands / plugins / keys etc...
 */
export type CombinedTags<Name extends string = string> = Record<ExtensionTagType, Name[]>;

declare global {
  namespace Remirror {
    interface BaseExtension {
      /**
       * Tags are a helpful tool for categorizing the behavior of an extension.
       * This behavior is later grouped in the `Manager` and passed to the
       * `extensionStore`. Tags can be used by commands that need to remove all
       * formatting and use the tag to identify which registered extensions are
       * formatters.
       *
       * @remarks
       *
       * Tags are also automatically added to the node and mark extensions as a
       * group when they are found there.
       *
       * There are internally defined tags but it's also possible to define any
       * custom string as a tag. See {@link ExtensionTag}
       */
      tags?: ExtensionTagType[];
    }

    interface ManagerStore<Combined extends AnyCombinedUnion> {
      /**
       * Store the built in and custom tags for the editor instance.
       */
      tags: Readonly<CombinedTags<GetNameUnion<Combined>>>;
    }

    interface ExcludeOptions {
      /**
       * Whether to exclude the tags plugin for this extension.
       *
       * @defaultValue `undefined`
       */
      tags?: boolean;
    }

    export interface ExtensionStore {
      /**
       * The tags provided by the configured extensions.
       */
      tags: CombinedTags;
    }
  }
}
