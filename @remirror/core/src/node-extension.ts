import { NodeType } from 'prosemirror-model';
import { nodeActive } from './document-helpers';
import { Extension } from './extension';
import {
  EditorSchema,
  ExtensionBooleanFunction,
  ExtensionType,
  FlexibleConfig,
  NodeExtensionSpec,
  SchemaWithStateParams,
} from './types';

export type ExtraAttrs = Array<string | [string, string]>;

export abstract class NodeExtension<
  GOptions extends { extraAttrs?: ExtraAttrs } = { extraAttrs?: ExtraAttrs }
> extends Extension<GOptions, NodeType<EditorSchema>> {
  get type() {
    return ExtensionType.NODE;
  }

  /**
   * Allows for the
   */
  protected extraAttrs() {
    const extraAttrs = this.options.extraAttrs!;
    const attrs: Record<string, { default?: unknown }> = {};
    if (!extraAttrs) {
      return attrs;
    }

    for (const item of extraAttrs) {
      if (Array.isArray(item)) {
        attrs[item[0]] = { default: attrs[1] };
      } else {
        attrs[item] = {};
      }
    }
    return attrs;
  }

  public abstract readonly schema: NodeExtensionSpec;

  public active({ getEditorState, schema }: SchemaWithStateParams): FlexibleConfig<ExtensionBooleanFunction> {
    return attrs => nodeActive(getEditorState(), schema.nodes.name, attrs);
  }
}
