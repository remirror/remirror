import { Interpolation } from '@emotion/core';
import { InputRule } from 'prosemirror-inputrules';
import { PluginKey } from 'prosemirror-state';
import { Suggester } from 'prosemirror-suggest';

import { ExtensionType, RemirrorClassName, Tags } from '@remirror/core-constants';
import { deepMerge, object } from '@remirror/core-helpers';
import {
  AttrsWithClass,
  BaseExtensionConfig,
  CommandTypeParams,
  ExtensionCommandReturn,
  ExtensionIsActiveFunction,
  ExtensionManagerParams,
  ExtensionManagerTypeParams,
  FlipPartialAndRequired,
  IfNoRequiredProperties,
  KeyBindings,
  NodeViewMethod,
  OnTransactionParams,
  PlainObject,
  ProsemirrorPlugin,
} from '@remirror/core-types';

/**
 * These are the default options merged into every extension.
 * They can be overridden.
 */
export const defaultConfig: Required<BaseExtensionConfig> = {
  extraAttrs: [],
  exclude: {
    inputRules: false,
    keys: false,
    pasteRules: false,
    plugin: false,
    styles: false,
    attributes: false,
    nodeView: false,
    ssr: false,
    suggesters: false,
  },
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
  Commands extends ExtensionCommandReturn,
  Config extends BaseExtensionConfig,
  Props extends object,
  ProsemirrorType = never
> {
  /**
   * This defines the type of the extension.
   *
   * @remarks
   * There are three types of extension:
   *
   * - `plain`
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
   * Static config is passed in at instantiation and merged with the default options
   * of this extension.
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
   * The prosemirror plugin key for this extension.
   */
  private pk?: PluginKey;

  constructor(...config: IfNoRequiredProperties<Config, [Config?], [Config]>) {
    this.config = deepMerge(defaultConfig, {
      ...this.defaultConfig,
      ...config[0],
    });
  }

  /**
   * A method that must be defined on classes that extend this.
   *
   * @remarks
   *
   * It provides all the `options` passed when this `ExtensionConstructor` was
   * created. This is for internal usage only since the `Extension` class is
   * not exported from this library.
   *
   * @internal
   */
  abstract getCreatorOptions(): Readonly<
    ExtensionCreatorOptions<Name, Commands, Config, Props, ProsemirrorType>
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
  get tags(): Array<Tags | string> {
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
    return `${RemirrorClassName.Extension}[${this.name}]`;
  }
}

type DefaultConfigType<Config extends BaseExtensionConfig> = FlipPartialAndRequired<Config> &
  Partial<BaseExtensionConfig>;

export interface ExtensionCreatorOptions<
  Name extends string,
  Commands extends ExtensionCommandReturn,
  Config extends BaseExtensionConfig,
  Props extends object,
  ProsemirrorType = never
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
  tags?: Array<Tags | string>;

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
   * Called whenever a transaction successfully updates the editor state.
   *
   * Changes to the transaction at this point have no impact at all. It is
   * purely for observational reasons
   */
  onTransaction?: (params: OnTransactionParams) => void;

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
   * An extension can declare the extensions it requires with the default options for
   * instantiating them.
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

/**
 * Provides a type annotation which is applicable to any extension type.
 */
export type AnyExtension = Extension<any, any, any, any, any>;
