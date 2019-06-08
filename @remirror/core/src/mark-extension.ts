import { MarkType } from 'prosemirror-model';
import { Extension } from './extension';
import { markActive } from './helpers/document';
import {
  EditorSchema,
  ExtensionBooleanFunction,
  ExtensionManagerParams,
  ExtensionType,
  FlexibleConfig,
  MarkExtensionOptions,
  MarkExtensionSpec,
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

  public active({
    getEditorState,
    schema,
  }: ExtensionManagerParams): FlexibleConfig<ExtensionBooleanFunction> {
    return () => markActive(getEditorState(), schema.marks[this.name]);
  }
}
