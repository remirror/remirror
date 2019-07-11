import { MarkType } from 'prosemirror-model';
import { Extension, isExtension } from './extension';
import { isMarkActive } from './helpers/document';
import {
  EditorSchema,
  ExtensionType,
  MarkExtensionOptions,
  MarkExtensionSpec,
  SchemaMarkTypeParams,
} from './types';

/**
 * All mark extensions should be created from here.
 *
 * @remarks
 * A mark extension is based on the `Mark` concept from from within prosemirror {@link https://prosemirror.net/docs/guide/#schema.marks}
 *
 * Marks are used to add extra styling or other information to inline content.
 * Mark types are objects much like node types, used to tag mark objects and provide additional information about them.
 */
export abstract class MarkExtension<
  GOptions extends MarkExtensionOptions = MarkExtensionOptions
> extends Extension<GOptions, MarkType<EditorSchema>> {
  /**
   * Set's the type of this extension to beDo not override.
   *
   */
  get type(): ExtensionType.MARK {
    return ExtensionType.MARK;
  }

  public abstract readonly schema: MarkExtensionSpec;

  public active({ getState, type }: SchemaMarkTypeParams): BooleanFlexibleConfig {
    return () => isMarkActive({ state: getState(), type });
  }
}

/**
 * Determines if the passed in extension is a mark extension. Useful as a type guard where a particular type of extension is needed.
 *
 * @param extension - the extension to check
 */
export const isMarkExtension = (extension: unknown): extension is MarkExtension<any> =>
  isExtension(extension) && extension.type === ExtensionType.MARK;
