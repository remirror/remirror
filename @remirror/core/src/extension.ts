/* eslint-disable @typescript-eslint/explicit-member-accessibility */

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
import {
  capitalize,
  deepMerge,
  invariant,
  isArray,
  isIdentifierOfType,
  isRemirrorType,
  isString,
  object,
} from '@remirror/core-helpers';
import {
  Attributes,
  AttributesWithClass,
  BaseExtensionSettings,
  CommandTypeParameter,
  CreateExtraAttributes,
  CreateSchemaParameter,
  EditorSchema,
  ExtensionCommandReturn,
  ExtensionHelperReturn,
  ExtensionIsActiveFunction,
  ExtensionManagerMarkTypeParameter,
  ExtensionManagerNodeTypeParameter,
  ExtensionManagerParameter,
  ExtensionManagerTypeParameter,
  ExtraAttributes,
  FlipPartialAndRequired,
  GetExtraAttributes,
  IfNoRequiredProperties,
  KeyBindings,
  MarkExtensionSpec,
  MarkType,
  NodeExtensionSpec,
  NodeType,
  NodeViewMethod,
  OnTransactionParameter,
  PlainObject,
  ProsemirrorPlugin,
} from '@remirror/core-types';
import { isMarkActive, isNodeActive } from '@remirror/core-utils';

/**
 * The type which is applicable to any extension instance.
 */
export type AnyExtension<Config extends BaseExtensionSettings = any> = Extension<
  any,
  any,
  Config,
  any,
  any,
  any
>;

/**
 * These are the default options merged into every extension. They can be
 * overridden.
 */
export const defaultSettings: Required<BaseExtensionSettings> = {
  priority: null,
  SSRComponent: null,
  extraAttributes: [],
  exclude: {},
};

/**
 * Determines if the passed in extension is any type of extension.
 *
 * @param value - the extension to check
 */
export const isExtension = <Config extends BaseExtensionSettings = any>(
  value: unknown,
): value is AnyExtension<Config> =>
  isRemirrorType(value) && isIdentifierOfType(value, RemirrorIdentifier.Extension);

/**
 * Checks whether the provided value is a plain extension.
 *
 * @param value - the extension to check
 */
export const isPlainExtension = <Config extends BaseExtensionSettings = any>(
  value: unknown,
): value is AnyPlainExtension<Config> => isExtension(value) && value.type === ExtensionType.Plain;

/**
 * Determines if the passed in extension is a mark extension. Useful as a type
 * guard where a particular type of extension is needed.
 *
 * @param value - the extension to check
 */
export const isMarkExtension = <Config extends BaseExtensionSettings = any>(
  value: unknown,
): value is AnyMarkExtension<Config> => isExtension(value) && value.type === ExtensionType.Mark;

/**
 * Determines if the passed in extension is a node extension. Useful as a type
 * guard where a particular type of extension is needed.
 *
 * @param value - the extension to check
 */
export const isNodeExtension = <Config extends BaseExtensionSettings = any>(
  value: unknown,
): value is AnyNodeExtension<Config> => isExtension(value) && value.type === ExtensionType.Node;

/**
 * Allows for the addition of attributes to the defined schema. These are
 * defined in the static settings and directly update the schema when applied.
 * They can't be changed during the lifetime of the editor or the Schema will
 * break.
 *
 * @remarks
 *
 * This can only be used in a `NodeExtension` or `MarkExtension`. The additional
 * attributes can only be optional.
 */
const createExtraAttributesFactory = <Config extends BaseExtensionSettings>(
  extension: AnyExtension,
): CreateExtraAttributes => ({ fallback }) => {
  // Make sure this is a node or mark extension. Will throw if not.
  invariant(
    isNodeExtension<Config>(extension) || isMarkExtension<Config>(extension),
    ErrorConstant.EXTRA_ATTRS,
  );

  const extraAttributes: ExtraAttributes[] = extension.settings.extraAttributes ?? [];
  const attributes: Record<string, AttributeSpec> = object();

  for (const item of extraAttributes) {
    if (isArray(item)) {
      attributes[item[0]] = { default: item[1] };
      continue;
    }

    if (isString(item)) {
      attributes[item] = { default: fallback };
      continue;
    }

    const { name, default: def } = item;
    attributes[name] = def !== undefined ? { default: def } : {};
  }

  return attributes;
};

/**
 * Runs through the extraAttributes provided and retrieves them.
 */
const getExtraAttributesFactory = <Config extends BaseExtensionSettings>(
  extension: AnyExtension,
): GetExtraAttributes => (domNode) => {
  // Make sure this is a node or mark extension. Will throw if not.
  invariant(
    isNodeExtension<Config>(extension) || isMarkExtension<Config>(extension),
    ErrorConstant.EXTRA_ATTRS,
  );

  const extraAttributes = extension.settings.extraAttributes ?? [];
  const attributes: Attributes = object();

  for (const attribute of extraAttributes) {
    if (isArray(attribute)) {
      // Use the default
      const [name, , attributeName] = attribute;
      attributes[name] = attributeName
        ? (domNode as Element).getAttribute(attributeName)
        : undefined;

      continue;
    }

    if (isString(attribute)) {
      // Assume the name is the same
      attributes[attribute] = (domNode as Element).getAttribute(attribute);
      continue;
    }

    const { name, getAttributes, default: fallback } = attribute;
    attributes[name] = getAttributes ? getAttributes(domNode) || fallback : fallback;
  }

  return attributes;
};

/**
 * Extensions are fundamental to the way that Remirror works and they handle the
 * management of similar concerns.
 *
 * @remarks
 *
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
  Settings extends BaseExtensionSettings,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {},
  ProsemirrorType = never
> {
  /**
   * An internal property which helps identify this instance as a
   * `RemirrorExtension`.
   */
  get [REMIRROR_IDENTIFIER_KEY]() {
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
   * The prosemirror plugin key for this extension.
   */
  #pk?: PluginKey;

  /**
   * Private instance of the static settings.
   */
  #settings: Required<Settings>;

  /**
   * Private instance of the dynamic properties for this extension.
   */
  #properties: Required<Properties>;

  /**
   * The static settings for this extension.
   *
   * @remarks
   *
   * The static settings are automatically merged with the default
   * options of this extension when it is created.
   */
  get settings() {
    return this.#settings;
  }

  /**
   * The dynamic properties for this extension. Callback handlers and
   * behavioral properties should be placed here.
   */
  get properties() {
    return this.#properties;
  }

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
      this.#settings.priority ?? this.getCreatorOptions().defaultPriority ?? ExtensionPriority.Low
    );
  }

  /**
   * Get the default properties for this extension.
   */
  get defaultProperties(): Required<Properties> {
    return this.getCreatorOptions().defaultProperties ?? object();
  }

  /**
   * Get the default settings for this extension.
   */
  get defaultSettings(): DefaultSettingsType<Settings> {
    return (
      this.getCreatorOptions().defaultSettings ?? (defaultSettings as DefaultSettingsType<Settings>)
    );
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
    if (this.#pk) {
      return this.#pk;
    }

    this.#pk = new PluginKey(this.name);

    return this.#pk;
  }

  constructor(...[settings]: IfNoRequiredProperties<Settings, [Settings?], [Settings]>) {
    this.#settings = deepMerge(defaultSettings, {
      ...this.defaultSettings,
      ...settings,
    });

    this.#properties = { ...this.defaultProperties };
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
    ExtensionCreatorOptions<Name, Settings, Properties, Commands, Helpers, ProsemirrorType>
  >;

  /**
   * Update the properties with the provided value when something changes.
   */
  public setProperties(properties: Partial<Properties>) {
    this.#properties = { ...this.#properties, ...properties };
  }

  /**
   * Override the default toString method to match the native toString methods.
   */
  public toString() {
    return `[${RemirrorIdentifier.Extension} ${capitalize(this.name)}]`;
  }
}

/**
 * Get the expected type signature for the `defaultSettings`. Requires that every
 * non-required property (not from the BaseExtension) has a value assigned.
 */
export type DefaultSettingsType<Config extends BaseExtensionSettings> = Omit<
  FlipPartialAndRequired<Config>,
  keyof BaseExtensionSettings
> &
  Partial<BaseExtensionSettings>;

export interface ExtensionCreatorOptions<
  Name extends string,
  Config extends BaseExtensionSettings,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {},
  ProsemirrorType = never
>
  extends ExtensionEventMethods,
    GlobalExtensionCreatorOptions<Name, Config, Properties, Commands, Helpers, ProsemirrorType> {
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
   * The settings helps define the properties schema and built in behaviour of
   * this extension.
   *
   * @remarks
   *
   * Once set it can't be updated during run time. Some of the settings is
   * optional and some is not. The required `defaultSettings` are all the none
   * required settingsuration options.
   */
  defaultSettings?: DefaultSettingsType<Config>;

  /**
   * Properties are dynamic and generated at run time. For this reason you will need
   * to provide a default value for every prop this extension uses.
   *
   * @remarks
   *
   * Properties are dynamically assigned options that are injected into the editor at
   * runtime. Every single prop that the extension will use needs to have a
   * default value set.
   */
  defaultProperties?: Required<Properties>;

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
  attributes?: (params: ExtensionManagerParameter) => AttributesWithClass;

  /**
   * Create and register commands for that can be called within the editor.
   *
   * These are typically used to create menu's actions and as a direct response
   * to user actions.
   *
   * @remarks
   *
   * The `createCommands` method should return an object with each key being
   * unique within the editor. To ensure that this is the case it is recommended
   * that the keys of the command are namespaced with the name of the extension.
   *
   * e.g.
   *
   * ```ts
   * class History extends Extension {
   *   name = 'history' as const;
   *
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
  createCommands?: (params: CommandTypeParameter<ProsemirrorType>) => Commands;

  /**
   * Each extension can make extension data available which is updated on each
   * render. Think of it like the prosemirror plugins state.
   *
   * Within React this data is passed back into Remirror render prop and also
   * the Remirror context and can be retrieved with a `hook` or `HOC`
   */
  extensionData?: (params: ExtensionManagerTypeParameter<ProsemirrorType>) => PlainObject;

  /**
   * Register input rules which are activated if the regex matches as a user is
   * typing.
   *
   * @param params - schema params with type included
   */
  inputRules?: (params: ExtensionManagerTypeParameter<ProsemirrorType>) => InputRule[];

  /**
   * Determines whether this extension is currently active (only applies to Node
   * Extensions and Mark Extensions).
   *
   * @param params - extension manager params
   */
  isActive?: (params: ExtensionManagerParameter) => ExtensionIsActiveFunction;

  /**
   * Add key bindings for this extension.
   *
   * @param params - schema params with type included
   */
  keys?: (params: ExtensionManagerTypeParameter<ProsemirrorType>) => KeyBindings;

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
  nodeView?: (params: ExtensionManagerTypeParameter<ProsemirrorType>) => NodeViewMethod;

  /**
   * Register paste rules for this extension.
   *
   * Paste rules are activated when text is pasted into the editor.
   *
   * @param params - schema params with type included
   */
  pasteRules?: (params: ExtensionManagerTypeParameter<ProsemirrorType>) => ProsemirrorPlugin[];

  /**
   * Register a plugin for the extension.
   *
   * @param params - schema params with type included
   */
  plugin?: (params: ExtensionManagerTypeParameter<ProsemirrorType>) => ProsemirrorPlugin;

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
  ssrTransformer?: (element: JSX.Element, params: ExtensionManagerParameter) => JSX.Element;

  /**
   * Allows extensions to register styles on the editor instance using emotion
   * for dynamic styling.
   *
   * @param params - extension manager parameters
   */
  styles?: (params: ExtensionManagerParameter) => Interpolation;

  /**
   * Create suggestions which respond to character key combinations within the
   * editor instance.
   */
  suggestions?: (params: ExtensionManagerTypeParameter<ProsemirrorType>) => Suggester[] | Suggester;
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
  onTransaction?: (params: OnTransactionParameter) => void;

  /**
   * Happens after the state is first updated.
   */
  onStateUpdated?: () => void;
}

/**
 * The type covering any potential `PlainExtension`.
 */
export type AnyPlainExtension<Config extends BaseExtensionSettings = any> = Extension<
  any,
  any,
  Config,
  any,
  any
>;

/**
 * The shape of the `ExtensionConstructor` used to create instances of
 * extensions and returned from the `ExtensionCreator.plain()` method.
 */
export interface PlainExtensionConstructor<
  Name extends string,
  Settings extends BaseExtensionSettings,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {},
  ProsemirrorType = never
> {
  /**
   * Create a new instance of the extension to be inserted into the editor.
   *
   * This is used to prevent the need for the `new` keyword which can lead to
   * problems.
   */
  of(
    ...settings: IfNoRequiredProperties<Settings, [Settings?], [Settings]>
  ): Extension<Name, Settings, Properties, Commands, Helpers, ProsemirrorType>;

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
  Config extends BaseExtensionSettings,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> extends Extension<Name, Config, Properties, Commands, Helpers, MarkType<EditorSchema>> {
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

  constructor(...parameters: IfNoRequiredProperties<Config, [Config?], [Config]>) {
    super(...parameters);

    this.schema = this.getMarkCreatorOptions().createMarkSchema({
      settings: this.settings,
      createExtraAttributes: createExtraAttributesFactory(this as AnyMarkExtension),
      getExtraAttributes: getExtraAttributesFactory(this as AnyMarkExtension),
    });
  }

  /**
   * Performs a default check to see whether the mark is active at the current
   * selection.
   *
   * @param params - see
   * {@link @remirror/core-types#ExtensionManagerMarkTypeParameter}
   */
  public isActive({
    getState,
    type,
  }: ExtensionManagerMarkTypeParameter): ExtensionIsActiveFunction {
    return () => isMarkActive({ state: getState(), type });
  }

  /**
   * Get all the options passed through when creating the
   * `MarkExtensionConstructor`.
   *
   * @internal
   */
  abstract getMarkCreatorOptions(): Readonly<
    MarkExtensionCreatorOptions<Name, Config, Properties, Commands, Helpers>
  >;
}

/**
 * The creator options when creating a node.
 */
export interface MarkExtensionCreatorOptions<
  Name extends string,
  Config extends BaseExtensionSettings,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> extends ExtensionCreatorOptions<Name, Config, Properties, Commands, Helpers> {
  /**
   * Provide a method for creating the schema. This is required in order to
   * create a `MarkExtension`.
   */
  createMarkSchema(params: CreateSchemaParameter<Config>): MarkExtensionSpec;
}

/**
 * The type covering any potential `MarkExtension`.
 */
export type AnyMarkExtension<Config extends BaseExtensionSettings = any> = MarkExtension<
  any,
  any,
  Config,
  any,
  any
>;

/**
 * The shape of the `MarkExtensionConstructor` used to create extensions and
 * returned from the `ExtensionCreator.mark()` method.
 */
export interface MarkExtensionConstructor<
  Name extends string,
  Config extends BaseExtensionSettings,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> {
  /**
   * Create a new instance of the extension to be inserted into the editor.
   *
   * This is used to prevent the need for the `new` keyword which can lead to
   * problems.
   */
  of(
    ...settings: IfNoRequiredProperties<Config, [Config?], [Config]>
  ): MarkExtension<Name, Config, Properties, Commands, Helpers>;

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
  Config extends BaseExtensionSettings,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> extends Extension<Name, Config, Properties, Commands, Helpers, NodeType<EditorSchema>> {
  /**
   * Identifies this extension as a **NODE** type from the prosemirror
   * terminology.
   */
  get type(): ExtensionType.Node {
    return ExtensionType.Node;
  }

  get schema(): Readonly<NodeExtensionSpec> {
    return this.#schema;
  }

  /**
   * The prosemirror specification which sets up the node in the schema.
   *
   * The main difference between this and Prosemirror `NodeSpec` is that that
   * the `toDOM` method doesn't allow dom manipulation. You can only return an
   * array or string.
   *
   * For more advanced settingsurations, where dom manipulation is required, it is
   * advisable to set up a nodeView.
   */
  readonly #schema: NodeExtensionSpec;

  constructor(...parameters: IfNoRequiredProperties<Config, [Config?], [Config]>) {
    super(...parameters);

    this.#schema = this.getNodeCreatorOptions().createNodeSchema({
      settings: this.settings,
      createExtraAttributes: createExtraAttributesFactory(this as AnyNodeExtension),
      getExtraAttributes: getExtraAttributesFactory(this as AnyNodeExtension),
    });
  }

  public isActive({
    getState,
    type,
  }: ExtensionManagerNodeTypeParameter): ExtensionIsActiveFunction {
    return ({ attrs }) => {
      return isNodeActive({ state: getState(), type, attrs: attrs });
    };
  }

  /**
   * Get all the options passed through when creating the
   * `NodeExtensionConstructor`.
   *
   * @internal
   */
  abstract getNodeCreatorOptions(): Readonly<
    NodeExtensionCreatorOptions<Name, Config, Properties, Commands, Helpers>
  >;
}

/**
 * The creator options when creating a node.
 */
export interface NodeExtensionCreatorOptions<
  Name extends string,
  Config extends BaseExtensionSettings,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> extends ExtensionCreatorOptions<Name, Config, Properties, Commands, Helpers> {
  /**
   * Provide a method for creating the schema. This is required in order to
   * create a `NodeExtension`.
   *
   * @remarks
   *
   * A node schema defines the behaviour of the content within the editor. This
   * is very tied to the prosemirror implementation and the best place to learn
   * more about it is in the
   * {@link https://prosemirror.net/docs/guide/#schema docs}.
   */
  createNodeSchema(params: CreateSchemaParameter<Config>): NodeExtensionSpec;
}

/**
 * The type covering any potential NodeExtension.
 */
export type AnyNodeExtension<Config extends BaseExtensionSettings = any> = NodeExtension<
  any,
  any,
  Config,
  any,
  any
>;

/**
 * The shape of the `NodeExtensionConstructor` used to create extensions and
 * returned from the `ExtensionCreator.node()` method.
 */
export interface NodeExtensionConstructor<
  Name extends string,
  Config extends BaseExtensionSettings,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> {
  /**
   * Create a new instance of the extension to be inserted into the editor.
   *
   * This is used to prevent the need for the `new` keyword which can lead to
   * problems.
   */
  of(
    ...settings: IfNoRequiredProperties<Config, [Config?], [Config]>
  ): NodeExtension<Name, Config, Properties, Commands, Helpers>;

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
    Config extends BaseExtensionSettings,
    Properties extends object,
    Commands extends ExtensionCommandReturn,
    Helpers extends ExtensionHelperReturn,
    ProsemirrorType = never
  > {}

  /**
   * This type should overridden to add extra options to the options that can be
   * passed into the `ExtensionCreator.node()`.
   */
  interface GlobalNodeExtensionCreatorOptions<
    Name extends string,
    Config extends BaseExtensionSettings,
    Properties extends object = {},
    Commands extends ExtensionCommandReturn = {},
    Helpers extends ExtensionHelperReturn = {}
  > {}

  /**
   * This type should overridden to add extra options to the options that can be
   * passed into the `ExtensionCreator.mark()`.
   */
  interface GlobalMarkExtensionCreatorOptions<
    Name extends string,
    Config extends BaseExtensionSettings,
    Properties extends object = {},
    Commands extends ExtensionCommandReturn = {},
    Helpers extends ExtensionHelperReturn = {}
  > {}
}

/* eslint-enable @typescript-eslint/explicit-member-accessibility */
