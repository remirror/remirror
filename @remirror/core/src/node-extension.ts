import { NodeType } from 'prosemirror-model';
import { Extension } from './extension';
import { nodeActive } from './helpers/document';
import {
  EditorSchema,
  ExtensionBooleanFunction,
  ExtensionManagerParams,
  ExtensionType,
  FlexibleConfig,
  NodeExtensionSpec,
} from './types';

export type ExtraAttrs = Array<string | [string, string]>;

export interface NodeExtensionOptions {
  /**
   * Inject additional attributes.
   */
  extraAttrs?: ExtraAttrs;
}

export abstract class NodeExtension<
  GOptions extends NodeExtensionOptions = NodeExtensionOptions
> extends Extension<GOptions, NodeType<EditorSchema>> {
  get type(): ExtensionType.NODE {
    return ExtensionType.NODE;
  }

  constructor(options?: GOptions) {
    super(options);
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

  public active({
    getEditorState,
    schema,
  }: ExtensionManagerParams): FlexibleConfig<ExtensionBooleanFunction> {
    return attrs => nodeActive(getEditorState(), schema.nodes.name, attrs);
  }
}

export interface NodeExtensionConstructor<
  GOptions extends NodeExtensionOptions,
  GExtension extends NodeExtension<GOptions>
> {
  // tslint:disable-next-line: callable-types
  new (options?: GOptions): GExtension;
}
