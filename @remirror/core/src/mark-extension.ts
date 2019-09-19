import { ExtensionType } from '@remirror/core-constants';
import {
  CommandStatusCheck,
  EditorSchema,
  ExtensionManagerMarkTypeParams,
  MarkExtensionOptions,
  MarkExtensionSpec,
  MarkType,
} from '@remirror/core-types';
import { isMarkActive } from '@remirror/core-utils';
import { Extension } from './extension';

/**
 * All mark extensions should be created from here.
 *
 * @remarks
 * A mark extension is based on the `Mark` concept from from within prosemirror
 * {@link https://prosemirror.net/docs/guide/#schema.marks}
 *
 * Marks are used to add extra styling or other information to inline content.
 * Mark types are objects much like node types, used to tag mark objects and
 * provide additional information about them.
 */
export abstract class MarkExtension<
  GOptions extends MarkExtensionOptions = MarkExtensionOptions
> extends Extension<GOptions, MarkType<EditorSchema>> {
  /**
   * Set's the type of this extension to be a `Mark`.
   *
   * @remarks
   *
   * This value is used by the predicates to check whether this is a mark / node
   * or plain extension.
   */
  get type(): ExtensionType.Mark {
    return ExtensionType.Mark;
  }

  /**
   * The prosemirror specification which sets up the mark in the schema.
   *
   * @remarks
   *
   * The main difference between this and Prosemirror `MarkSpec` is that that
   * the `toDOM` method doesn't allow dom manipulation. You can only return an
   * array or string.
   *
   * For more advanced requirements, it may be possible to create a nodeView to
   * manage the dom interactions.
   */
  public abstract readonly schema: MarkExtensionSpec;

  /**
   * Performs a default check to see whether the mark is active at the current
   * selection.
   *
   * @param params - see {@link @remirror/core-types#ExtensionManagerMarkTypeParams}
   */
  public isActive({ getState, type }: ExtensionManagerMarkTypeParams): CommandStatusCheck {
    return () => isMarkActive({ state: getState(), type });
  }

  /**
   * By default all marks extensions are set to be enabled. In your extension
   * this can be overridden and set to false based on the context.
   *
   * @param _ - see see {@link @remirror/core-types#ExtensionManagerMarkTypeParams}
   */
  public isEnabled(_: ExtensionManagerMarkTypeParams): CommandStatusCheck {
    return () => true;
  }
}
