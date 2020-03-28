import { Interpolation } from '@emotion/core';
import { InputRule } from 'prosemirror-inputrules';
import { AttributeSpec } from 'prosemirror-model';
import { PluginKey } from 'prosemirror-state';
import { Suggester } from 'prosemirror-suggest';

import {
  ErrorConstant,
  ExtensionPriority,
  ExtensionType,
  REMIRROR_IDENTIFIER_KEY,
  RemirrorIdentifier,
  Tag,
} from '@remirror/core-constants';
import { deepMerge, invariant, isArray, isObject, isString, object } from '@remirror/core-helpers';
import {
  Attrs,
  AttrsWithClass,
  BaseExtensionConfig,
  CommandTypeParams,
  CreateExtraAttrs,
  CreateSchemaParams,
  EditorSchema,
  ExtensionCommandReturn,
  ExtensionIsActiveFunction,
  ExtensionManagerMarkTypeParams,
  ExtensionManagerNodeTypeParams,
  ExtensionManagerParams,
  ExtensionManagerTypeParams,
  ExtraAttrs,
  FlipPartialAndRequired,
  GetExtraAttrs,
  IfNoRequiredProperties,
  KeyBindings,
  MarkExtensionSpec,
  MarkType,
  NodeExtensionSpec,
  NodeType,
  NodeViewMethod,
  OnTransactionParams,
  PlainObject,
  ProsemirrorPlugin,
} from '@remirror/core-types';
import { isMarkActive, isNodeActive } from '@remirror/core-utils';

/**
 * The type which is applicable to any extension instance.
 */
export type AnyExtension<Config extends BaseExtensionConfig = any> = Extension<
  any,
  any,
  Config,
  any,
  any
>;

/**
 * These are the default options merged into every extension. They can be
 * overridden.
 */
export const defaultConfig: Required<BaseExtensionConfig> = {
  priority: null,
  SSRComponent: null,
  extraAttrs: [],
  exclude: {},
};

/**
 * Determines if the passed in extension is any type of extension.
 *
 * @param extension - the extension to check
 */
export const isExtension = <Config extends BaseExtensionConfig = any>(
  extension: unknown,
): extension is AnyExtension<Config> =>
  isObject(extension) && extension[REMIRROR_IDENTIFIER_KEY] === RemirrorIdentifier.Extension;

/**
 * Checks whether the provided value is a plain extension.
 *
 * @param extension - the extension to check
 */
export const isPlainExtension = <Config extends BaseExtensionConfig = any>(
  extension: unknown,
): extension is AnyPlainExtension<Config> =>
  isExtension(extension) && extension.type === ExtensionType.Plain;

/**
 * Determines if the passed in extension is a mark extension. Useful as a type
 * guard where a particular type of extension is needed.
 *
 * @param extension - the extension to check
 */
export const isMarkExtension = <Config extends BaseExtensionConfig = any>(
  extension: unknown,
): extension is AnyMarkExtension<Config> =>
  isExtension(extension) && extension.type === ExtensionType.Mark;

/**
 * Determines if the passed in extension is a node extension. Useful as a type
 * guard where a particular type of extension is needed.
 *
 * @param extension - the extension to check
 */
export const isNodeExtension = <Config extends BaseExtensionConfig = any>(
  extension: unknown,
): extension is AnyNodeExtension<Config> =>
  isExtension(extension) && extension.type === ExtensionType.Node;

/**
 * Allows for the addition of attributes to the defined schema. These are
 * defined in the static config and directly update the schema when applied.
 * They can't be changed during the lifetime of the editor or the Schema will
 * break.
 *
 * @remarks
 *
 * This can only be used in a `NodeExtension` or `MarkExtension`. The additional
 * attributes can only be optional.
 */
const createExtraAttrsFactory = <Config extends BaseExtensionConfig>(
  extension: AnyExtension,
): CreateExtraAttrs => ({ fallback }) => {
  // Make sure this is a node or mark extension. Will throw if not.
  invariant(
    isNodeExtension<Config>(extension) || isMarkExtension<Config>(extension),
    ErrorConstant.EXTRA_ATTRS,
  );

  const extraAttrs: ExtraAttrs[] = extension.config.extraAttrs ?? [];
  const attrs: Record<string, AttributeSpec> = object();

  for (const item of extraAttrs) {
    if (isArray(item)) {
      attrs[item[0]] = { default: item[1] };
      continue;
    }

    if (isString(item)) {
      attrs[item] = { default: fallback };
      continue;
    }

    const { name, default: def } = item;
    attrs[name] = def !== undefined ? { default: def } : {};
  }

  return attrs;
};

/**
 * Runs through the extraAttrs provided and retrieves them.
 */
const getExtraAttrsFactory = <Config extends BaseExtensionConfig>(
  extension: AnyExtension,
): GetExtraAttrs => (domNode) => {
  // Make sure this is a node or mark extension. Will throw if not.
  invariant(
    isNodeExtension<Config>(extension) || isMarkExtension<Config>(extension),
    ErrorConstant.EXTRA_ATTRS,
  );

  const extraAttrs = extension.config.extraAttrs ?? [];
  const attrs: Attrs = object();

  for (const attr of extraAttrs) {
    if (isArray(attr)) {
      // Use the default
      const [name, , attributeName] = attr;
      attrs[name] = attributeName ? (domNode as Element).getAttribute(attributeName) : undefined;

      continue;
    }

    if (isString(attr)) {
      // Assume the name is the same
      attrs[attr] = (domNode as Element).getAttribute(attr);
      continue;
    }

    const { name, getAttrs, default: fallback } = attr;
    attrs[name] = getAttrs ? getAttrs(domNode) || fallback : fallback;
  }

  return attrs;
};

/**
 * Extensions are fundamental to the way that Remirror works and they handle the
 * management of similar concerns.
 *
 * @remarks
 * They allows for grouping items that affect editor functionality.
 *
 * - How the editor displays certain content, i.e. **bold**, _italic_,
 *   **underline**.
 * - Which commands should be made available e.g. `actions.bold()` to make
 *   selected text bold.
 * - Check if a command is currently active or enabled e.g.
 *   `actions.bold.isActive()`.
 * - Register Prosemirror plugins, keymaps, input rules paste rules and custom
 *   nodeViews which affect the behaviour of the editor.
 *
 * There are three types of `Extension`.
 *
 * - `NodeExtension` - For creating Prosemirror nodes in the editor. See
 *   {@link NodeExtension}
 * - `MarkExtension` - For creating Prosemirror marks in the editor. See
 *   {@link MarkExtension}
 * - `Extension` - For behaviour which doesn't need to be displayed in the dom.
 *
 * The extension is an abstract class that should not be used directly but
 * rather extended to add the intended functionality.
 *
 * ```ts
 * interface AwesomeExtOptions extends BaseExtensionOptions {
 *   isAwesome: boolean;
 * }
 *
 * class AwesomeExt extends Extension<AwesomeExtOptions> {
 *   get name() {
 *     return 'awesome' as const
 *   }
 * }
 * ```
 */
export abstract class Extension<
  Name extends string,
  Config extends BaseExtensionConfig,
  Props extends object = {},
  Commands extends ExtensionCommandReturn = {},
  ProsemirrorType = never
> {
  /**
   * An internal property which helps identify this instance as a `RemirrorExtension`.
   */
  get $$remirrorType(): RemirrorIdentifier {
    return RemirrorIdentifier.Extension;
  }

  /**
   * This defines the type of the extension.
   *
   * @remarks
   * There are three types of extension:
   *
   * - `plain` - useful for changing the runtime behaviour of the extension.
   * - `node` - see {@link NodeExtension}
   * - `mark` - see {@link MarkExtension}
   *
   * This identifier is used in the extension manager to separate marks from
   * nodes and to determine the functionality of each extension.
   */
  public abstract readonly type: ExtensionType;

  /**
   * The static configuration for this extension.
   *
   * @remarks
   *
   * Static config is passed in at instantiation and merged with the default
   * options of this extension.
   */
  public readonly config: Required<Config>;

  /**
   * The unique name of this extension.
   *
   * @remarks
   *
   * Every extension **must** have a name. The name should have a distinct type
   * to allow for better type inference for end users. By convention the name
   * should be `camelCased` and unique within your editor instance.
   *
   * ```ts
   * class SimpleExtension extends Extension {
   *   get name() {
   *     return 'simple' as const;
   *   }
   * }
   * ```
   */
  get name(): Name {
    return this.getCreatorOptions().name;
  }

  /**
   * The priority level for this instance of the extension.
   */
  get priority(): ExtensionPriority {
    return (
      this.config.priority ?? this.getCreatorOptions().defaultPriority ?? ExtensionPriority.Low
    );
  }

  /**
   * The prosemirror plugin key for this extension.
   */
  private pk?: PluginKey;

  constructor(...[config]: IfNoRequiredProperties<Config, [Config?], [Config]>) {
    this.config = deepMerge(defaultConfig, {
      ...this.defaultConfig,
      ...config,
    });
  }

  /**
   * A method that must be defined on classes that extend this.
   *
   * @remarks
   *
   * It provides all the `options` passed when this `ExtensionConstructor` was
   * created. This is for internal usage only since the `Extension` class is not
   * exported from this library.
   *
   * @internal
   */
  abstract getCreatorOptions(): Readonly<
    ExtensionCreatorOptions<Name, Config, Props, Commands, ProsemirrorType>
  >;

  /**
   * Get the default props.
   */
  get defaultProps(): Required<Props> {
    return this.getCreatorOptions().defaultProps ?? object();
  }

  /**
   * Get the default configuration
   */
  get defaultConfig(): DefaultConfigType<Config> {
    return this.getCreatorOptions().defaultConfig ?? (defaultConfig as DefaultConfigType<Config>);
  }

  /**
   * Retrieves the tags for this extension.
   */
  get tags(): Array<Tag | string> {
    return this.getCreatorOptions().tags ?? [];
  }

  /**
   * Retrieves the plugin key which is used to uniquely identify the plugin
   * created by the extension.
   */
  get pluginKey(): PluginKey {
    if (this.pk) {
      return this.pk;
    }

    this.pk = new PluginKey(this.name);

    return this.pk;
  }

  /**
   * Override the default toString method to match the native toString methods.
   */
  public toString() {
    return `${RemirrorIdentifier.Extension}[${this.name}]`;
  }
}

type DefaultConfigType<Config extends BaseExtensionConfig> = FlipPartialAndRequired<Config> &
  Partial<BaseExtensionConfig>;

export interface ExtensionCreatorOptions<
  Name extends string,
  Config extends BaseExtensionConfig,
  Props extends object = {},
  Commands extends ExtensionCommandReturn = {},
  ProsemirrorType = never
>
  extends ExtensionEventMethods,
    GlobalExtensionCreatorOptions<Name, Config, Props, Commands, ProsemirrorType> {
  /**
   * The unique name of this extension.
   *
   * @remarks
   *
   * Every extension **must** have a name. Ideally the name should have a
   * distinct type to allow for better type inference for end users. By
   * convention the name should be `camelCased` and unique within your editor
   * instance.
   */
  name: Name;

  /**
   * The config helps define the properties schema and built in behaviour of
   * this extension.
   *
   * @remarks
   *
   * Once set it can't be updated during run time. Some of the config is
   * optional and some is not. The required defaultConfig are all the none
   * required configuration options.
   */
  defaultConfig?: DefaultConfigType<Config>;

  /**
   * Props are dynamic and generated at run time. For this reason you will need
   * to provide a default value for every prop this extension uses.
   *
   * @remarks
   *
   * Props are dynamically assigned options that are injected into the editor at
   * runtime. Every single prop that the extension will use needs to have a
   * default value set.
   */
  defaultProps?: Required<Props>;

  /**
   * The default priority level for the extension to use.
   *
   * @remarks
   *
   * The priority levels help determine the order in which an extension is
   * loaded within the editor. High priority extensions are given precedence.
   *
   * @defaultValue `ExtensionPriority.Default`
   */
  defaultPriority?: ExtensionPriority;

  /**
   * Define the tags for this extension.
   *
   * @remarks
   *
   * Tags are a helpful tool for categorizing the behavior of an extension. This
   * behavior is later grouped in the `ExtensionManager` and passed as `tag` to
   * each method defined in the `ExtensionCreatorOptions`. It can be used by
   * commands that need to remove all formatting and use the tag to identify
   * which registered extensions are formatters.
   *
   * There are internally defined tags but it's also possible to define any
   * custom string as a tag. See {@link Tags}
   */
  tags?: Array<Tag | string>;

  /**
   * Allows the extension to modify the attributes for the Prosemirror editor
   * dom element.
   *
   * @remarks
   *
   * Sometimes an extension will need to make a change to the attributes of the
   * editor itself. For example a placeholder may need to do some work to make
   * the editor more accessible by setting the `aria-placeholder` value to match
   * the value of the placeholder.
   *
   * @alpha
   */
  attributes?: (params: ExtensionManagerParams) => AttrsWithClass;

  /**
   * Register commands for the extension.
   *
   * These are typically used to create menu's actions and as a direct response
   * to user actions.
   *
   * @remarks
   *
   * The commands function should return an object with each key being unique
   * within the editor. To ensure that this is the case it is recommended that
   * the keys of the command are namespaced with the name of the extension.
   *
   * e.g.
   *
   * ```ts
   * class History extends Extension {
   *   name = 'history' as const;
   *   commands() {
   *     return {
   *       undoHistory: COMMAND_FN,
   *       redoHistory: COMMAND_FN,
   *     }
   *   }
   * }
   * ```
   *
   * The actions available in this case would be `undoHistory` and
   * `redoHistory`. It is unlikely that any other extension would override these
   * commands.
   *
   * Another benefit of commands is that they are picked up by typescript and
   * can provide code completion for consumers of the extension.
   *
   * @param params - schema params with type included
   */
  commands?: (params: CommandTypeParams<ProsemirrorType>) => Commands;

  /**
   * Each extension can make extension data available which is updated on each
   * render. Think of it like the prosemirror plugins state.
   *
   * Within React this data is passed back into Remirror render prop and also
   * the Remirror context and can be retrieved with a `hook` or `HOC`
   */
  extensionData?: (params: ExtensionManagerTypeParams<ProsemirrorType>) => PlainObject;

  /**
   * Register input rules which are activated if the regex matches as a user is
   * typing.
   *
   * @param params - schema params with type included
   */
  inputRules?: (params: ExtensionManagerTypeParams<ProsemirrorType>) => InputRule[];

  /**
   * Determines whether this extension is currently active (only applies to Node
   * Extensions and Mark Extensions).
   *
   * @param params - extension manager params
   */
  isActive?: (params: ExtensionManagerParams) => ExtensionIsActiveFunction;

  /**
   * Add key bindings for this extension.
   *
   * @param params - schema params with type included
   */
  keys?: (params: ExtensionManagerTypeParams<ProsemirrorType>) => KeyBindings;

  /**
   * Registers a node view for the extension.
   *
   * This is a shorthand way of registering a nodeView without the need to
   * create a prosemirror plugin. It allows for the registration of one nodeView
   * which has the same name as the extension.
   *
   * To register more than one you would need to use a custom plugin returned
   * from the `plugin` method.
   *
   * @param params - schema params with type included
   *
   * @alpha
   */
  nodeView?: (params: ExtensionManagerTypeParams<ProsemirrorType>) => NodeViewMethod;

  /**
   * Register paste rules for this extension.
   *
   * Paste rules are activated when text is pasted into the editor.
   *
   * @param params - schema params with type included
   */
  pasteRules?: (params: ExtensionManagerTypeParams<ProsemirrorType>) => ProsemirrorPlugin[];

  /**
   * Register a plugin for the extension.
   *
   * @param params - schema params with type included
   */
  plugin?: (params: ExtensionManagerTypeParams<ProsemirrorType>) => ProsemirrorPlugin;

  /**
   * An extension can declare the extensions it requires with the default
   * options for instantiating them.
   *
   * @remarks
   *
   * When creating the extension manager the extension will be checked for
   * required extension as well as a quick check to see if the required
   * extension is already included.
   *
   * @internalremarks
   */
  readonly requiredExtensions?: string[];

  /**
   * A method for transforming the SSR JSX received by the extension. Some
   * extensions add decorations to the ProsemirrorView based on their state.
   * These decorations can touch any node or mark and it would be very difficult
   * to model this without being able to take the completed JSX render and
   * transforming it some way.
   *
   * An example use case is for placeholders which need to render a
   * `data-placeholder` and `class` attribute so that the placeholder is shown
   * by the styles. This method can be called to check if there is only one
   * child of the parent
   */
  ssrTransformer?: (element: JSX.Element, params: ExtensionManagerParams) => JSX.Element;

  /**
   * Allows extensions to register styles on the editor instance using emotion
   * for dynamic styling.
   *
   * @param params - extension manager parameters
   */
  styles?: (params: ExtensionManagerParams) => Interpolation;

  /**
   * Create suggestions which respond to character key combinations within the
   * editor instance.
   */
  suggestions?: (params: ExtensionManagerTypeParams<ProsemirrorType>) => Suggester[] | Suggester;
}

export interface ExtensionEventMethods {
  /**
   * When the ExtensionManager is first created and the schema is made
   * available.
   */
  onCreate?: () => void;

  /**
   * This happens when the store is initialized.
   */
  onInitialize?: () => void;

  /**
   * This event happens when the view is first received from the react
   * component.
   */
  onFirstRender?: () => void;

  /**
   * Called whenever a transaction successfully updates the editor state.
   *
   * Changes to the transaction at this point have no impact at all. It is
   * purely for observational reasons
   */
  onTransaction?: (params: OnTransactionParams) => void;

  /**
   * Happens after the state is first updated.
   */
  onStateUpdated?: () => void;
}

/**
 * The type covering any potential `PlainExtension`.
 */
export type AnyPlainExtension<Config extends BaseExtensionConfig = any> = Extension<
  any,
  any,
  Config,
  any
>;

/**
 * The shape of the `ExtensionConstructor` used to create instances of
 * extensions and returned from the `ExtensionCreator.plain()` method.
 */
export interface PlainExtensionConstructor<
  Name extends string,
  Config extends BaseExtensionConfig,
  Props extends object = {},
  Commands extends ExtensionCommandReturn = {},
  ProsemirrorType = never
> {
  /**
   * Create a new instance of the extension to be inserted into the editor.
   *
   * This is used to prevent the need for the `new` keyword which can lead to
   * problems.
   */
  of(
    ...config: IfNoRequiredProperties<Config, [Config?], [Config]>
  ): Extension<Name, Config, Props, Commands, ProsemirrorType>;

  /**
   * Get the name of the extensions created by this constructor.
   */
  readonly extensionName: Name;
}

/**
 * A mark extension is based on the `Mark` concept from from within prosemirror
 * {@link https://prosemirror.net/docs/guide/#schema.marks}
 *
 * @remarks
 *
 * Marks are used to add extra styling or other information to inline content.
 * Mark types are objects much like node types, used to tag mark objects and
 * provide additional information about them.
 */
export abstract class MarkExtension<
  Name extends string,
  Config extends BaseExtensionConfig,
  Props extends object = {},
  Commands extends ExtensionCommandReturn = {}
> extends Extension<Name, Config, Props, Commands, MarkType<EditorSchema>> {
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
  public readonly schema: MarkExtensionSpec;

  constructor(...params: IfNoRequiredProperties<Config, [Config?], [Config]>) {
    super(...params);

    this.schema = this.getMarkCreatorOptions().createSchema({
      config: this.config,
      createExtraAttrs: createExtraAttrsFactory(this as AnyMarkExtension),
      getExtraAttrs: getExtraAttrsFactory(this as AnyMarkExtension),
    });
  }

  /**
   * Performs a default check to see whether the mark is active at the current
   * selection.
   *
   * @param params - see
   * {@link @remirror/core-types#ExtensionManagerMarkTypeParams}
   */
  public isActive({ getState, type }: ExtensionManagerMarkTypeParams): ExtensionIsActiveFunction {
    return () => isMarkActive({ state: getState(), type });
  }

  /**
   * Get all the options passed through when creating the
   * `MarkExtensionConstructor`.
   *
   * @internal
   */
  abstract getMarkCreatorOptions(): Readonly<
    MarkExtensionCreatorOptions<Name, Config, Props, Commands>
  >;
}

/**
 * The creator options when creating a node.
 */
export interface MarkExtensionCreatorOptions<
  Name extends string,
  Config extends BaseExtensionConfig,
  Props extends object = {},
  Commands extends ExtensionCommandReturn = {}
> extends ExtensionCreatorOptions<Name, Config, Props, Commands> {
  /**
   * Provide a method for creating the schema. This is required in order to
   * create a `MarkExtension`.
   */
  createSchema(params: CreateSchemaParams<Config>): MarkExtensionSpec;
}

/**
 * The type covering any potential `MarkExtension`.
 */
export type AnyMarkExtension<Config extends BaseExtensionConfig = any> = MarkExtension<
  any,
  any,
  Config,
  any
>;

/**
 * The shape of the `MarkExtensionConstructor` used to create extensions and
 * returned from the `ExtensionCreator.mark()` method.
 */
export interface MarkExtensionConstructor<
  Name extends string,
  Config extends BaseExtensionConfig,
  Props extends object = {},
  Commands extends ExtensionCommandReturn = {}
> {
  /**
   * Create a new instance of the extension to be inserted into the editor.
   *
   * This is used to prevent the need for the `new` keyword which can lead to
   * problems.
   */
  of(
    ...config: IfNoRequiredProperties<Config, [Config?], [Config]>
  ): MarkExtension<Name, Config, Props, Commands>;

  /**
   * Get the name of the extensions created by this constructor.
   */
  readonly extensionName: Name;
}

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
  Config extends BaseExtensionConfig,
  Props extends object = {},
  Commands extends ExtensionCommandReturn = {}
> extends Extension<Name, Config, Props, Commands, NodeType<EditorSchema>> {
  /**
   * Identifies this extension as a **NODE** type from the prosemirror
   * terminology.
   */
  get type(): ExtensionType.Node {
    return ExtensionType.Node;
  }

  /**
   * The prosemirror specification which sets up the node in the schema.
   *
   * The main difference between this and Prosemirror `NodeSpec` is that that
   * the `toDOM` method doesn't allow dom manipulation. You can only return an
   * array or string.
   *
   * For more advanced configurations, where dom manipulation is required, it is
   * advisable to set up a nodeView.
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
   * Get all the options passed through when creating the
   * `NodeExtensionConstructor`.
   *
   * @internal
   */
  abstract getNodeCreatorOptions(): Readonly<
    NodeExtensionCreatorOptions<Name, Config, Props, Commands>
  >;
}

/**
 * The creator options when creating a node.
 */
export interface NodeExtensionCreatorOptions<
  Name extends string,
  Config extends BaseExtensionConfig,
  Props extends object = {},
  Commands extends ExtensionCommandReturn = {}
> extends ExtensionCreatorOptions<Name, Config, Props, Commands> {
  /**
   * Provide a method for creating the schema. This is required in order to
   * create a `NodeExtension`.
   */
  createSchema(params: CreateSchemaParams<Config>): NodeExtensionSpec;
}

/**
 * The type covering any potential NodeExtension.
 */
export type AnyNodeExtension<Config extends BaseExtensionConfig = any> = NodeExtension<
  any,
  any,
  Config,
  any
>;

/**
 * The shape of the `NodeExtensionConstructor` used to create extensions and
 * returned from the `ExtensionCreator.node()` method.
 */
export interface NodeExtensionConstructor<
  Name extends string,
  Config extends BaseExtensionConfig,
  Props extends object = {},
  Commands extends ExtensionCommandReturn = {}
> {
  /**
   * Create a new instance of the extension to be inserted into the editor.
   *
   * This is used to prevent the need for the `new` keyword which can lead to
   * problems.
   */
  of(
    ...config: IfNoRequiredProperties<Config, [Config?], [Config]>
  ): NodeExtension<Name, Config, Props, Commands>;

  /**
   * Get the name of the extensions created by this constructor.
   */
  readonly extensionName: Name;
}

declare global {
  /**
   * This type should overridden to add extra options to the options that can be
   * passed into the `ExtensionCreator.plain()`.
   */
  interface GlobalExtensionCreatorOptions<
    Name extends string,
    Config extends BaseExtensionConfig,
    Props extends object,
    Commands extends ExtensionCommandReturn,
    ProsemirrorType = never
  > {}

  /**
   * This type should overridden to add extra options to the options that can be
   * passed into the `ExtensionCreator.node()`.
   */
  interface GlobalNodeExtensionCreatorOptions<
    Name extends string,
    Config extends BaseExtensionConfig,
    Props extends object = {},
    Commands extends ExtensionCommandReturn = {}
  > {}

  /**
   * This type should overridden to add extra options to the options that can be
   * passed into the `ExtensionCreator.mark()`.
   */
  interface GlobalMarkExtensionCreatorOptions<
    Name extends string,
    Config extends BaseExtensionConfig,
    Props extends object = {},
    Commands extends ExtensionCommandReturn = {}
  > {}
}
