import { ExtensionType } from '@remirror/core-constants';
import {
  BaseExtensionConfig,
  CreateExtraAttrs,
  EditorSchema,
  ExtensionCommandReturn,
  ExtensionIsActiveFunction,
  ExtensionManagerNodeTypeParams,
  GetExtraAttrs,
  IfNoRequiredProperties,
  NodeExtensionSpec,
  NodeType,
} from '@remirror/core-types';
import { isNodeActive } from '@remirror/core-utils';

import { AnyNodeExtension, Extension, ExtensionCreatorOptions } from './extension';
import { createExtraAttrsFactory, getExtraAttrsFactory } from './extra-attrs';

/**
 * Defines the abstract class for extensions which can place nodes into the
 * prosemirror state.
 *
 * @remarks
 *
 * For more information see {@link https://prosemirror.net/docs/ref/#model.Node}
 */
export abstract class NodeExtension<
  Name extends string,
  Commands extends ExtensionCommandReturn,
  Config extends BaseExtensionConfig,
  Props extends object
> extends Extension<Name, Commands, Config, Props, NodeType<EditorSchema>> {
  /**
   * Identifies this extension as a **NODE** type from the prosemirror terminology.
   */
  get type(): ExtensionType.Node {
    return ExtensionType.Node;
  }

  /**
   * The prosemirror specification which sets up the node in the schema.
   *
   * The main difference between this and Prosemirror `NodeSpec` is that that the `toDOM` method doesn't
   * allow dom manipulation. You can only return an array or string.
   *
   * For more advanced configurations, where dom manipulation is required, it is advisable to set up a nodeView.
   */
  public readonly schema: NodeExtensionSpec;

  constructor(...params: IfNoRequiredProperties<Config, [Config?], [Config]>) {
    super(...params);

    this.schema = this.getNodeCreatorOptions().createSchema({
      config: this.config,
      createExtraAttrs: createExtraAttrsFactory(this as AnyNodeExtension),
      getExtraAttrs: getExtraAttrsFactory(this as AnyNodeExtension),
    });
  }

  public isActive({ getState, type }: ExtensionManagerNodeTypeParams): ExtensionIsActiveFunction {
    return ({ attrs }) => {
      return isNodeActive({ state: getState(), type, attrs });
    };
  }

  /**
   * Get all the options passed through when creating the `ExtensionConstructor`.
   *
   * @internal
   */
  abstract getNodeCreatorOptions(): Readonly<
    NodeExtensionCreatorOptions<Name, Commands, Config, Props>
  >;
}

export interface CreateSchemaParams<Config extends BaseExtensionConfig> {
  /**
   * All the static config options that have been passed into the extension when
   * being created (instantiated).
   */
  config: Readonly<Config>;

  /**
   * A method that creates the `AttributeSpec` for prosemirror that can be added
   * to a node or mark extension to provide extra functionality and store more
   * information within the DOM and prosemirror state..
   *
   * @remarks
   *
   * ```ts
   * const schema = {
   *   attrs: {
   *      ...createExtraAttrs({ fallback: null }),
   *      href: {
   *       default: null,
   *     },
   *   },
   * }
   */
  createExtraAttrs: CreateExtraAttrs;

  /**
   * Pull all extra attrs from the dom node provided.
   */
  getExtraAttrs: GetExtraAttrs;
}

/**
 * The creator options when creating a node.
 */
export interface NodeExtensionCreatorOptions<
  Name extends string,
  Commands extends ExtensionCommandReturn,
  Config extends BaseExtensionConfig,
  Props extends object
> extends ExtensionCreatorOptions<Name, Commands, Config, Props> {
  /**
   * Provide a method for creating the schema. This is required in order to
   * create a `NodeExtension`.
   */
  createSchema(params: CreateSchemaParams<Config>): NodeExtensionSpec;
}
