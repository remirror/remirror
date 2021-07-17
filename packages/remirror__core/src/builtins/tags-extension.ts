import {
  ErrorConstant,
  ExtensionPriority,
  ExtensionTag,
  ExtensionTagType,
} from '@remirror/core-constants';
import { includes, invariant, object, values } from '@remirror/core-helpers';
import type { UseDefault } from '@remirror/core-types';

import {
  AnyExtension,
  extension,
  GetMarkNameUnion,
  GetNameUnion,
  GetNodeNameUnion,
  GetPlainNameUnion,
  isMarkExtension,
  isNodeExtension,
  isPlainExtension,
  PlainExtension,
} from '../extension';

/**
 * Create the extension tags which are passed into each extensions method to
 * enable dynamically generated rules and commands.
 *
 * Tags on nodes and marks are automatically added to the schema as groups.
 *
 * @category Builtin Extension
 */
@extension({ defaultPriority: ExtensionPriority.Highest })
export class TagsExtension extends PlainExtension {
  get name() {
    return 'tags' as const;
  }

  /**
   * Track the tags which have been applied to the extensions in this editor.
   */
  private allTags: CombinedTags = object();

  /**
   * The tags for plain extensions.
   */
  private plainTags: CombinedTags = object();

  /**
   * The tags for mark extensions.
   */
  private markTags: CombinedTags = object();

  /**
   * The tags for node extensions.
   */
  private nodeTags: CombinedTags = object();

  /**
   * Create the tags which are used to identify extension with particular
   * behavioral traits.
   */
  onCreate(): void {
    this.resetTags();

    for (const extension of this.store.extensions) {
      this.updateTagForExtension(extension);
    }

    this.store.setStoreKey('tags', this.allTags);
    this.store.setExtensionStore('tags', this.allTags);
    this.store.setStoreKey('plainTags', this.plainTags);
    this.store.setExtensionStore('plainTags', this.plainTags);
    this.store.setStoreKey('markTags', this.markTags);
    this.store.setExtensionStore('markTags', this.markTags);
    this.store.setStoreKey('nodeTags', this.nodeTags);
    this.store.setExtensionStore('nodeTags', this.nodeTags);
  }

  /**
   * Reset the tags to the empty object with empty arrays.
   */
  private resetTags() {
    const allTags: CombinedTags = object();
    const plainTags: CombinedTags = object();
    const markTags: CombinedTags = object();
    const nodeTags: CombinedTags = object();

    for (const tagName of values(ExtensionTag)) {
      allTags[tagName] = [];
      plainTags[tagName] = [];
      markTags[tagName] = [];
      nodeTags[tagName] = [];
    }

    this.allTags = allTags;
    this.plainTags = plainTags;
    this.markTags = markTags;
    this.nodeTags = nodeTags;
  }

  /**
   * Update the tags object for each extension.
   */
  private updateTagForExtension(extension: AnyExtension) {
    const allTags = new Set([
      // TODO remove `extension.tags` once all tags have been moved over to `createTags`
      ...(extension.tags ?? []),
      ...(extension.createTags?.() ?? []),
      ...(extension.options.extraTags ?? []),
      ...(this.store.managerSettings.extraTags?.[extension.name] ?? []),
    ]);

    for (const tag of allTags) {
      invariant(isExtensionTag(tag), {
        code: ErrorConstant.EXTENSION,
        message: `The tag provided by the extension: ${extension.constructorName} is not supported by the editor. To add custom tags you can use the 'mutateTag' method.`,
      });

      // Add tags to the combined tags stored here.
      this.allTags[tag].push(extension.name);

      if (isPlainExtension(extension)) {
        this.plainTags[tag].push(extension.name);
      }

      if (isMarkExtension(extension)) {
        this.markTags[tag].push(extension.name);
      }

      if (isNodeExtension(extension)) {
        this.nodeTags[tag].push(extension.name);
      }
    }

    // All tags available.
    extension.tags = [...allTags];
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
    interface ManagerSettings {
      /**
       * Add extra tags to the extensions by name. This can be used to add
       * behavior traits to certain extensions.
       *
       * Please note this will change the schema since the tags are added to the
       * node and mark groups.
       *
       * ```ts
       * RemirrorManager.create(
       *   [],
       *   { extraTags: { bold: [ExtensionTag.Awesome] } }
       * );
       * ```
       */
      extraTags?: Record<string, ExtensionTagType[]>;
    }

    interface BaseExtension {
      /**
       * The generated tags for this extension are added here. Do not add this
       * property to your extensions as it will be overridden.
       */
      tags: ExtensionTagType[];

      /**
       * Dynamically create tags for the extension.
       *
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
       * custom string as a tag. See [[`ExtensionTag`]].
       */
      createTags?(): ExtensionTagType[];
    }
    type A = UseDefault<never, string>;

    interface ManagerStore<Extension extends AnyExtension> {
      /**
       * All the tags provided by the configured extensions.
       */
      tags: Readonly<
        CombinedTags<GetNameUnion<Extension> extends never ? string : GetNameUnion<Extension>>
      >;

      /**
       * All the plain extension tags provided for the editor.
       */
      plainTags: Readonly<
        CombinedTags<
          GetPlainNameUnion<Extension> extends never ? string : GetPlainNameUnion<Extension>
        >
      >;

      /**
       * All the node extension tags provided for the editor.
       */
      nodeTags: Readonly<
        CombinedTags<
          GetNodeNameUnion<Extension> extends never ? string : GetNodeNameUnion<Extension>
        >
      >;

      /**
       * All the mark extension tags provided for the editor.
       */
      markTags: Readonly<
        CombinedTags<
          GetMarkNameUnion<Extension> extends never ? string : GetMarkNameUnion<Extension>
        >
      >;
    }

    interface ExtensionStore {
      /**
       * All the tags provided by the configured extensions.
       */
      tags: CombinedTags;

      /**
       * All the plain extension tags provided for the editor.
       */
      plainTags: CombinedTags;

      /**
       * All the node extension tags provided for the editor.
       */
      nodeTags: CombinedTags;

      /**
       * All the mark extension tags provided for the editor.
       */
      markTags: CombinedTags;
    }

    interface BaseExtensionOptions {
      /**
       * Add extra tags to the extension.
       *
       * Tags can be used to unlock certain behavioural traits for nodes and
       * marks.
       *
       * Please note this will change the schema since the tags are added to the
       * node and mark groups.
       */
      extraTags?: ExtensionTagType[];
    }

    interface AllExtensions {
      tags: TagsExtension;
    }
  }
}
