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
  AttributesWithClass,
  CreateExtraAttributes,
  EditorSchema,
  ExtraAttributes,
  FlipPartialAndRequired,
  GetExtraAttributes,
  IfEmpty,
  IfMatches,
  IfNoRequiredProperties,
  KeyBindings,
  MarkExtensionSpec,
  MarkType,
  NodeExtensionSpec,
  NodeType,
  NodeViewMethod,
  PlainObject,
  ProsemirrorAttributes,
  ProsemirrorPlugin,
} from '@remirror/core-types';
import { isMarkActive, isNodeActive } from '@remirror/core-utils';

import {
  BaseExtensionSettings,
  CreateCommandsParameter,
  CreateHelpersParameter,
  CreateSchemaParameter,
  ExtensionCommandReturn,
  ExtensionHelperReturn,
  ExtensionIsActiveFunction,
  GeneralExtensionTags,
  GetName,
  ManagerMarkTypeParameter,
  ManagerNodeTypeParameter,
  ManagerParameter,
  ManagerTypeParameter,
  MarkExtensionTags,
  NodeExtensionTags,
  OnTransactionParameter,
  PropertiesShape,
} from '../types';

/**
 * The type which is applicable to any extension instance.
 *
 * TODO Figure out how to improve the formatting of this.
 */
type AnyExtension<Settings extends object = {}> = Extension<string, Settings, any, any, any, any>;

/**
 * Matches any of the three `ExtensionConstructor`s.
 */
interface AnyExtensionConstructor<Settings extends object = {}> {
  /**
   * The name of the extension that will be created. Also available on the
   * instance as `name`.
   */
  readonly extensionName: string;

  /**
   * Creates a new instance of the extension. Used when adding the extension to
   * the editor.
   */
  of(
    ...settings: IfNoRequiredProperties<Settings, [Settings?], [Settings]>
  ): AnyExtension<Settings>;
}

/**
 * Infer the type of factory parameter that's being used.
 */
type InferFactoryParameter<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {},
  ProsemirrorType = never
> = ProsemirrorType extends NodeType
  ? NodeExtensionFactoryParameter<Name, Settings, Properties, Commands, Helpers>
  : ProsemirrorType extends MarkType
  ? MarkExtensionFactoryParameter<Name, Settings, Properties, Commands, Helpers>
  : ExtensionFactoryParameter<Name, Settings, Properties, Commands, Helpers>;

/**
 * Infer the `constructor` for the extension.
 */
type InferExtensionConstructor<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {},
  ProsemirrorType = never
> = ProsemirrorType extends NodeType
  ? NodeExtensionConstructor<Name, Settings, Properties, Commands, Helpers>
  : ProsemirrorType extends MarkType
  ? MarkExtensionConstructor<Name, Settings, Properties, Commands, Helpers>
  : PlainExtensionConstructor<Name, Settings, Properties, Commands, Helpers>;

/**
 * These are the default options merged into every extension. They can be
 * overridden.
 */
const defaultSettings: Required<BaseExtensionSettings> = {
  priority: null,
  extraAttributes: [],
  exclude: {},
};

/**
 * Determines if the passed value is an extension.
 *
 * @param value - the value to test
 */
const isExtension = <Settings extends object = {}>(
  value: unknown,
): value is AnyExtension<Settings> =>
  isRemirrorType(value) && isIdentifierOfType(value, RemirrorIdentifier.Extension);

/**
 * Checks whether the provided value is a plain extension.
 *
 * @param value - the extension to check
 */
const isPlainExtension = <Settings extends object = {}>(
  value: unknown,
): value is AnyPlainExtension<Settings> => isExtension(value) && value.type === ExtensionType.Plain;

/**
 * Determines if the passed in extension is a mark extension. Useful as a type
 * guard where a particular type of extension is needed.
 *
 * @param value - the extension to check
 */
const isMarkExtension = <Settings extends object = {}>(
  value: unknown,
): value is AnyMarkExtension<Settings> => isExtension(value) && value.type === ExtensionType.Mark;

/**
 * Determines if the passed in extension is a node extension. Useful as a type
 * guard where a particular type of extension is needed.
 *
 * @param value - the extension to check
 */
const isNodeExtension = <Settings extends object = {}>(
  value: unknown,
): value is AnyNodeExtension<Settings> => isExtension(value) && value.type === ExtensionType.Node;

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
const createExtraAttributesFactory = <Settings extends object>(
  extension: AnyExtension,
): CreateExtraAttributes => ({ fallback }) => {
  // Make sure this is a node or mark extension. Will throw if not.
  invariant(isNodeExtension<Settings>(extension) || isMarkExtension<Settings>(extension), {
    code: ErrorConstant.EXTRA_ATTRS,
  });

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
const getExtraAttributesFactory = <Settings extends object>(
  extension: AnyExtension,
): GetExtraAttributes => (domNode) => {
  // Make sure this is a node or mark extension. Will throw if not.
  invariant(isNodeExtension<Settings>(extension) || isMarkExtension<Settings>(extension), {
    code: ErrorConstant.EXTRA_ATTRS,
  });

  const extraAttributes = extension.settings.extraAttributes ?? [];
  const attributes: ProsemirrorAttributes = object();

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
 *   nodeViews which affect the behavior of the editor.
 *
 * There are three types of `Extension`.
 *
 * - `NodeExtension` - For creating Prosemirror nodes in the editor. See
 *   {@link NodeExtension}
 * - `MarkExtension` - For creating Prosemirror marks in the editor. See
 *   {@link MarkExtension}
 * - `Extension` - For behavior which doesn't need to be displayed in the dom.
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
abstract class Extension<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {},
  ProsemirrorType = never
> implements PropertiesShape<Properties> {
  /**
   * Not for public usage. This is purely for types to make it easier to infer
   * the type of `Commands` on an extension instance.
   */
  public readonly ['~C']!: Commands;

  /**
   * Not for public usage. This is purely for types to make it easier to infer
   * the type of `Helpers` on an extension instance.
   */
  public readonly ['~H']!: Helpers;

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
   * - `plain` - useful for changing the runtime behavior of the extension.
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
  #settings: Required<Settings & BaseExtensionSettings>;

  /**
   * Private instance of the dynamic properties for this extension.
   */
  #properties: Required<Properties>;

  /**
   * The parameter that was passed when creating the constructor for this instance.
   * TODO [2020-04-06] - Consider renaming this.
   */
  get parameter() {
    return this.getFactoryParameter();
  }

  /**
   * The static settings for this extension.
   *
   * @remarks
   *
   * The static settings are automatically merged with the default
   * options of this extension when it is created.
   */
  get settings(): Readonly<Required<Settings & BaseExtensionSettings>> {
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
    return this.parameter.name;
  }

  /**
   * The priority level for this instance of the extension.
   */
  get priority(): ExtensionPriority {
    return this.#settings.priority ?? this.parameter.defaultPriority ?? ExtensionPriority.Low;
  }

  /**
   * Get the default properties for this extension.
   */
  get defaultProperties(): Required<Properties> {
    return this.parameter.defaultProperties ?? object();
  }

  /**
   * Get the default settings for this extension.
   */
  get defaultSettings(): DefaultSettingsType<Settings> {
    return this.parameter.defaultSettings ?? (defaultSettings as DefaultSettingsType<Settings>);
  }

  /**
   * Retrieves the tags for this extension.
   */
  get tags(): Array<Tag | string> {
    return this.parameter.tags ?? [];
  }

  /**
   * Get the required extensions for this extension.
   */
  get requiredExtensions() {
    return this.parameter.requiredExtensions ?? [];
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
  protected abstract getFactoryParameter(): Readonly<
    InferFactoryParameter<Name, Settings, Properties, Commands, Helpers, ProsemirrorType>
  >;

  /**
   * Update the properties with the provided value when something changes.
   */
  public setProperties(properties: Partial<Properties>) {
    this.#properties = { ...this.#properties, ...properties };
  }

  /**
   * Reset the properties to their initial state.
   */
  public resetProperties() {
    this.#properties = { ...this.defaultProperties };
  }

  /**
   * Called when the extension is removed by the manager during it's `onDestroy`
   * phase.
   */
  public destroy() {
    this.parameter.onDestroy?.();
  }

  /**
   * Override the default toString method to match the native toString methods.
   */
  public toString() {
    return `[${RemirrorIdentifier.Extension} ${capitalize(this.name)}]`;
  }
}

/**
 * Declaration merging since the constructor property can't be defined on the
 * actual class.
 */
interface Extension<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {},
  ProsemirrorType = never
> {
  /**
   * Forcefully give the extensions the `AnyExtensionConstructor` as it's constructor.
   */
  constructor: InferExtensionConstructor<
    Name,
    Settings,
    Properties,
    Commands,
    Helpers,
    ProsemirrorType
  >;
}

/**
 * Get the expected type signature for the `defaultSettings`. Requires that every
 * non-required property (not from the BaseExtension) has a value assigned.
 */
type DefaultSettingsType<Settings extends object> = Omit<
  FlipPartialAndRequired<Settings>,
  keyof BaseExtensionSettings
> &
  Partial<BaseExtensionSettings>;

interface DefaultPropertiesParameter<Properties extends object = {}> {
  /**
   * Properties are dynamic and generated at run time. For this reason you will
   * need to provide a default value for every prop this extension uses.
   *
   * @remarks
   *
   * Properties are dynamically assigned options that are injected into the
   * editor at runtime. Every single property that the extension will use needs
   * to have a default value set.
   *
   * This must be set when creating the extension, even if just to the empty
   * object when no properties are used at runtime.
   */
  defaultProperties: Required<Properties>;
}

interface DefaultSettingsParameter<Settings extends object> {
  /**
   * The settings helps define the properties schema and built in behavior of
   * this extension.
   *
   * @remarks
   *
   * Once set it can't be updated during run time. Some of the settings is
   * optional and some is not. The required `defaultSettings` are all the none
   * required settings.
   *
   * This must be set when creating the extension, even if just to the empty
   * object when no properties are used at runtime.
   */
  defaultSettings: DefaultSettingsType<Settings>;
}

/**
 * The configuration parameter which is passed into an `ExtensionFactory` to
 * create the `ExtensionConstructor`.
 */
interface BaseExtensionFactoryParameter<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {},
  ProsemirrorType = never
>
  extends ExtensionEventMethods,
    Remirror.ExtensionFactoryParameter<
      Name,
      Settings,
      Properties,
      Commands,
      Helpers,
      ProsemirrorType
    > {
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
   * Every extension requires compatible string with the version number of the extension. This
   * is required
   */
  version: string;

  /**
   * The default priority level for the extension to use.
   *
   * @remarks
   *
   * The priority levels help determine the order in which an extension is
   * loaded within the editor. High priority extensions are given precedence.
   *
   * @defaultValue `ExtensionPriority.Low`
   */
  defaultPriority?: ExtensionPriority;

  /**
   * Define the tags for this extension.
   *
   * @remarks
   *
   * Tags are a helpful tool for categorizing the behavior of an extension. This
   * behavior is later grouped in the `Manager` and passed as `tag` to
   * each method defined in the `ExtensionFactoryParameter`. It can be used by
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
  createAttributes?: (parameter: ManagerParameter) => AttributesWithClass;

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
   * @param parameter - schema parameter with type included
   */
  createCommands?: (parameter: CreateCommandsParameter<ProsemirrorType>) => Commands;

  /**
   * A helper method is a function that takes in arguments and returns
   * a value depicting the state of the editor specific to this extension.
   *
   * @remarks
   *
   * Unlike commands they can return anything and they do not effect the
   * behavior of the editor.
   *
   * Nodes and Marks provide the default `isActive` helper by default.
   *
   * Below is an example which should provide some idea on how to add helpers to the app.
   *
   * ```tsx
   * // extension.ts
   * import { ExtensionFactory } from '@remirror/core';
   *
   * const MyBeautifulExtension = ExtensionFactory.plain({
   *   name: 'beautiful',
   *   createHelpers: () => ({
   *     checkBeautyLevel: () => 100
   *   }),
   * })
   * ```
   *
   * ```
   * // app.tsx
   * import { useRemirror } from '@remirror/react';
   *
   * const MyEditor = () => {
   *   const { helpers } = useRemirror();
   *
   *   return helpers.beautiful.checkBeautyLevel() > 50
   *     ? (<span>😍</span>)
   *     : (<span>😢</span>);
   * };
   * ```
   */
  createHelpers?: (parameter: CreateHelpersParameter<ProsemirrorType>) => Helpers;

  /**
   * Register input rules which are activated if the regex matches as a user is
   * typing.
   *
   * @param parameter - schema parameter with type included
   */
  createInputRules?: (parameter: ManagerTypeParameter<ProsemirrorType>) => InputRule[];

  /**
   * Add key bindings for this extension.
   *
   * @param parameter - schema parameter with type included
   */
  createKeys?: (parameter: ManagerTypeParameter<ProsemirrorType>) => KeyBindings;

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
   * @param parameter - schema parameter with type included
   *
   * @alpha
   */
  createNodeView?: (parameter: ManagerTypeParameter<ProsemirrorType>) => NodeViewMethod;

  /**
   * Register paste rules for this extension.
   *
   * Paste rules are activated when text is pasted into the editor.
   *
   * @param parameter - schema parameter with type included
   */
  createPasteRules?: (parameter: ManagerTypeParameter<ProsemirrorType>) => ProsemirrorPlugin[];

  /**
   * Register a plugin for the extension.
   *
   * @param parameter - schema parameter with type included
   */
  createPlugin?: (parameter: ManagerTypeParameter<ProsemirrorType>) => ProsemirrorPlugin;

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
  ssrTransformer?: (element: JSX.Element, parameter: ManagerParameter) => JSX.Element;

  /**
   * Create suggestions which respond to character key combinations within the
   * editor instance.
   *
   * @remarks
   *
   * Suggestions are a very powerful way of building up the editors
   * functionality. They can support `@` mentions, `#` tagging, `/` special
   * command keys which trigger an actions menu and much more.
   */
  createSuggestions?: (parameter: ManagerTypeParameter<ProsemirrorType>) => Suggester[] | Suggester;
}

interface ExtensionEventMethods {
  /**
   * When the Manager is first created and the schema is made
   * available.
   */
  onCreate?: () => void;

  /**
   * This happens when the store is initialized.
   */
  onInitialize?: <ExtensionUnion extends AnyExtension>(
    parameter: InitializeEventMethodParameter<ExtensionUnion>,
  ) => InitializeEventMethodReturn<ExtensionUnion>;

  /**
   * This event happens when the view is first received from the view layer
   * (e.g. React).
   */
  onView?: () => void;

  /**
   * Called whenever a transaction successfully updates the editor state.
   *
   * Changes to the transaction at this point have no impact at all. It is
   * purely for observational reasons
   */
  onTransaction?: (parameter: OnTransactionParameter) => void;

  /**
   * Happens after the state is first updated.
   */
  onStateUpdated?: () => void;

  /**
   * Called when the extension is being destroyed.
   */
  onDestroy?: () => void;
}

type ExtensionFactoryParameter<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {},
  ProsemirrorType = never
> = BaseExtensionFactoryParameter<Name, Settings, Properties, Commands, Helpers, ProsemirrorType> &
  IfEmpty<
    Properties,
    Partial<DefaultPropertiesParameter<Properties>>,
    DefaultPropertiesParameter<Properties>
  > &
  IfMatches<
    Settings,
    BaseExtensionSettings,
    Partial<DefaultSettingsParameter<Settings>>,
    DefaultSettingsParameter<Settings>
  >;

/**
 * The type covering any potential `PlainExtension`.
 */
type AnyPlainExtension<Settings extends object = {}> = Extension<string, Settings, any, any, any>;

/**
 * The shape of the `ExtensionConstructor` used to create instances of
 * extensions and returned from the `ExtensionFactory.plain()` method.
 */
interface PlainExtensionConstructor<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {},
  ProsemirrorType = never
> {
  /**
   * Get the name of the extensions created by this constructor.
   */
  readonly extensionName: Name;

  /**
   * Create a new instance of the extension to be inserted into the editor.
   *
   * This is used to prevent the need for the `new` keyword which can lead to
   * problems.
   */
  of(
    ...settings: IfNoRequiredProperties<Settings, [Settings?], [Settings]>
  ): Extension<Name, Settings, Properties, Commands, Helpers, ProsemirrorType>;
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
abstract class MarkExtension<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> extends Extension<Name, Settings, Properties, Commands, Helpers, MarkType<EditorSchema>> {
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

  constructor(...parameters: IfNoRequiredProperties<Settings, [Settings?], [Settings]>) {
    super(...parameters);

    this.schema = this.parameter.createMarkSchema({
      settings: this.settings,
      createExtraAttributes: createExtraAttributesFactory(this as AnyMarkExtension),
      getExtraAttributes: getExtraAttributesFactory(this as AnyMarkExtension),
    });
  }

  /**
   * Performs a default check to see whether the mark is active at the current
   * selection.
   *
   * @param parameter - see
   * {@link @remirror/core-types#ManagerMarkTypeParameter}
   */
  public isActive({ getState, type }: ManagerMarkTypeParameter): ExtensionIsActiveFunction {
    return () => isMarkActive({ state: getState(), type });
  }
}

/**
 * The creator options when creating a node.
 */
type MarkExtensionFactoryParameter<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> = ExtensionFactoryParameter<
  Name,
  Settings,
  Properties,
  Commands,
  Helpers,
  MarkType<EditorSchema>
> & {
  /**
   * Provide a method for creating the schema. This is required in order to
   * create a `MarkExtension`.
   */
  createMarkSchema(parameter: CreateSchemaParameter<Settings>): MarkExtensionSpec;
};

/**
 * The type covering any potential `MarkExtension`.
 */
type AnyMarkExtension<Settings extends object = {}> = MarkExtension<
  string,
  Settings,
  any,
  any,
  any
>;

/**
 * The shape of the `MarkExtensionConstructor` used to create extensions and
 * returned from the `ExtensionFactory.mark()` method.
 */
interface MarkExtensionConstructor<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> {
  /**
   * Get the name of the extensions created by this constructor.
   */
  readonly extensionName: Name;

  /**
   * Create a new instance of the extension to be inserted into the editor.
   *
   * This is used to prevent the need for the `new` keyword which can lead to
   * problems.
   */
  of(
    ...settings: IfNoRequiredProperties<Settings, [Settings?], [Settings]>
  ): MarkExtension<Name, Settings, Properties, Commands, Helpers>;
}

/**
 * Defines the abstract class for extensions which can place nodes into the
 * prosemirror state.
 *
 * @remarks
 *
 * For more information see {@link https://prosemirror.net/docs/ref/#model.Node}
 */
abstract class NodeExtension<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> extends Extension<Name, Settings, Properties, Commands, Helpers, NodeType<EditorSchema>> {
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
   * @remarks
   *
   * The main difference between this and Prosemirror `NodeSpec` is that that
   * the `toDOM` method doesn't allow dom manipulation. You can only return an
   * array or string.
   *
   * For more advanced settings, where dom manipulation is required, it is
   * advisable to set up a nodeView.
   */
  readonly #schema: NodeExtensionSpec;

  constructor(...parameters: IfNoRequiredProperties<Settings, [Settings?], [Settings]>) {
    super(...parameters);

    this.#schema = this.parameter.createNodeSchema({
      settings: this.settings,
      createExtraAttributes: createExtraAttributesFactory(this as AnyNodeExtension),
      getExtraAttributes: getExtraAttributesFactory(this as AnyNodeExtension),
    });
  }

  public isActive({ getState, type }: ManagerNodeTypeParameter): ExtensionIsActiveFunction {
    return ({ attrs }) => {
      return isNodeActive({ state: getState(), type, attrs: attrs });
    };
  }
}

/**
 * The creator options when creating a node.
 */
type NodeExtensionFactoryParameter<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> = ExtensionFactoryParameter<
  Name,
  Settings,
  Properties,
  Commands,
  Helpers,
  NodeType<EditorSchema>
> & {
  /**
   * Provide a method for creating the schema. This is required in order to
   * create a `NodeExtension`.
   *
   * @remarks
   *
   * A node schema defines the behavior of the content within the editor. This
   * is very tied to the prosemirror implementation and the best place to learn
   * more about it is in the
   * {@link https://prosemirror.net/docs/guide/#schema docs}.
   */
  createNodeSchema(parameter: CreateSchemaParameter<Settings>): NodeExtensionSpec;
};

/**
 * The type covering any potential NodeExtension.
 */
type AnyNodeExtension<Settings extends object = {}> = NodeExtension<
  string,
  Settings,
  any,
  any,
  any
>;

/**
 * The shape of the `NodeExtensionConstructor` used to create extensions and
 * returned from the `ExtensionFactory.node()` method.
 */
interface NodeExtensionConstructor<
  Name extends string,
  Settings extends object,
  Properties extends object = {},
  Commands extends ExtensionCommandReturn = {},
  Helpers extends ExtensionHelperReturn = {}
> {
  /**
   * Get the name of the extensions created by this constructor.
   */
  readonly extensionName: Name;

  /**
   * Create a new instance of the extension to be inserted into the editor.
   *
   * This is used to prevent the need for the `new` keyword which can lead to
   * problems.
   */
  of(
    ...settings: IfNoRequiredProperties<Settings, [Settings?], [Settings]>
  ): NodeExtension<Name, Settings, Properties, Commands, Helpers>;
}

/* eslint-enable @typescript-eslint/explicit-member-accessibility */

/**
 * The shape of the tag data stored by the extension manager.
 *
 * This data can be used by other extensions to dynamically determine which
 * nodes should affected by commands / plugins / keys etc...
 */
interface ExtensionTags<ExtensionUnion extends AnyExtension> {
  /**
   * All the node extension tags.
   */
  node: NodeExtensionTags<GetNodeNames<ExtensionUnion>>;

  /**
   * All the mar extension tags.
   */
  mark: MarkExtensionTags<GetMarkNames<ExtensionUnion>>;

  /**
   * All the general extension tags.
   */
  general: GeneralExtensionTags<GetName<ExtensionUnion>>;
}

/**
 * A utility type for retrieving the name of an extension only when it's a plain
 * extension.
 */
type GetPlainNames<Type> = Type extends AnyPlainExtension ? GetName<Type> : never;

/**
 * A utility type for retrieving the name of an extension only when it's a mark
 * extension.
 */
type GetMarkNames<ExtensionUnion extends AnyExtension> = ExtensionUnion extends AnyMarkExtension
  ? ExtensionUnion['name']
  : never;

/**
 * A utility type for retrieving the name of an extension only when it's a node
 * extension.
 */
type GetNodeNames<ExtensionUnion extends AnyExtension> = ExtensionUnion extends AnyNodeExtension
  ? ExtensionUnion['name']
  : never;

/**
 * Gets the editor schema from an extension union.
 */
type SchemaFromExtension<ExtensionUnion extends AnyExtension> = EditorSchema<
  GetNodeNames<ExtensionUnion>,
  GetMarkNames<ExtensionUnion>
>;

interface InitializeEventMethodParameter<ExtensionUnion extends AnyExtension> {
  /**
   * The parameter passed into most of the extension creator methods.
   */
  getParameter: <Type = never>(extension: ExtensionUnion) => ManagerTypeParameter<Type>;

  /**
   * The readonly store.
   */
  getStore: () => Readonly<Remirror.ManagerStore>;

  /**
   * Allows for updating the store.
   */
  setStoreKey: <Key extends keyof Remirror.ManagerStore>(
    key: Key,
    value: Remirror.ManagerStore[Key],
  ) => void;
}

interface InitializeEventMethodReturn<ExtensionUnion extends AnyExtension> {
  /**
   * Called before the extension loop is run.
   */
  beforeExtensionLoop?: () => void;
  /**
   * Called for each extension in order of their priority.
   */
  forEachExtension?: (extension: ExtensionUnion) => void;

  /**
   * Run after the extensions have been looped through. Useful for adding data
   * to the store and doing any cleanup for the RemirrorMethod.
   */
  afterExtensionLoop?: () => void;
}

declare global {
  namespace Remirror {
    /**
     * This type should overridden to add extra options to the options that can be
     * passed into the `ExtensionFactory.plain()`.
     */
    export interface ExtensionFactoryParameter<
      Name extends string,
      Settings extends object,
      Properties extends object,
      Commands extends ExtensionCommandReturn,
      Helpers extends ExtensionHelperReturn,
      ProsemirrorType = never
    > {}

    /**
     * This type should overridden to add extra options to the options that can be
     * passed into the `ExtensionFactory.node()`.
     */
    export interface NodeExtensionFactoryParameter<
      Name extends string,
      Settings extends object,
      Properties extends object = {},
      Commands extends ExtensionCommandReturn = {},
      Helpers extends ExtensionHelperReturn = {}
    > {}

    /**
     * This type should overridden to add extra options to the options that can be
     * passed into the `ExtensionFactory.mark()`.
     */
    export interface MarkExtensionFactoryParameter<
      Name extends string,
      Settings extends object,
      Properties extends object = {},
      Commands extends ExtensionCommandReturn = {},
      Helpers extends ExtensionHelperReturn = {}
    > {}

    /**
     * An interface with a `tags` parameter useful as a builder for parameter
     * objects.
     */
    export interface ExtensionTagParameter<ExtensionUnion extends AnyExtension = any> {
      /**
       * The tags provided by the configured extensions.
       */
      tags: ExtensionTags<ExtensionUnion>;
    }
  }
}

export type {
  AnyExtension,
  DefaultSettingsType,
  ExtensionFactoryParameter,
  AnyPlainExtension,
  MarkExtensionFactoryParameter,
  AnyMarkExtension,
  NodeExtensionFactoryParameter,
  AnyNodeExtension,
  GetPlainNames,
  GetMarkNames,
  GetNodeNames,
  SchemaFromExtension,
  AnyExtensionConstructor,
  BaseExtensionFactoryParameter,
  ExtensionEventMethods,
  PlainExtensionConstructor,
  MarkExtensionConstructor,
  NodeExtensionConstructor,
  ExtensionTags,
  InitializeEventMethodReturn,
  InitializeEventMethodParameter,
};

export {
  defaultSettings,
  isExtension,
  isPlainExtension,
  isMarkExtension,
  isNodeExtension,
  Extension,
  MarkExtension,
  NodeExtension,
};
