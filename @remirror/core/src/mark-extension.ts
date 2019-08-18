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
  get type(): ExtensionType.Mark {
    return ExtensionType.Mark;
  }

  /**
   * The prosemirror specification which sets up the mark in the schema.
   *
   * The main difference between this and Prosemirror `MarkSpec` is that that the `toDOM` method doesn't
   * allow dom manipulation. You can only return an array or string.
   *
   * For more advanced configurations, it is advisable to set up a nodeView.
   */
  public abstract readonly schema: MarkExtensionSpec;

  public isActive({ getState, type }: ExtensionManagerMarkTypeParams): CommandStatusCheck {
    return () => isMarkActive({ state: getState(), type });
  }

  public isEnabled(_: ExtensionManagerMarkTypeParams): CommandStatusCheck {
    return () => true;
  }
}
