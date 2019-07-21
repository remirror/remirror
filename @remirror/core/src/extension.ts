import { Interpolation } from 'emotion';
import { InputRule } from 'prosemirror-inputrules';
import { PluginKey } from 'prosemirror-state';
import { Cast, deepMerge, isObject } from './helpers/base';
import {
  AttrsWithClass,
  BaseExtensionOptions,
  BooleanExtensionCheck,
  CommandTypeParams,
  EditorStateParams,
  ExtensionCommandReturn,
  ExtensionManagerParams,
  ExtensionType,
  KeyboardBindings,
  NodeViewMethod,
  PlainObject,
  ProsemirrorPlugin,
  SchemaTypeParams,
  TransactionParams,
  ViewExtensionManagerParams,
} from './types';

/**
 * These are the default options merged into every extension.
 * They can be overridden.
 */
const defaultOptions: Required<BaseExtensionOptions> = {
  extraStyles: '',
  extraAttrs: [],
  exclude: {
    inputRules: false,
    keymaps: false,
    pasteRules: false,
    plugin: false,
    styles: false,
    attributes: false,
    nodeView: false,
    ssr: false,
  },
};

/**
 * Extensions are fundamental to the way that Remirror works and they handle the management of similar concerns.
 *
 * @remarks
 * They allows for grouping items that affect editor functionality.
 *
 * - How the editor displays certain content, i.e. **bold**, _italic_, **underline**.
 * - Which commands should be made available e.g. `actions.bold()` to make selected text bold.
 * - Check if a command is currently active or enabled e.g. `actions.bold.isActive()`.
 * - Register Prosemirror plugins, keymaps, input rules paste rules and custom nodeViews which affect the behaviour of the editor.
 *
 * There are three types of `Extension`.
 *
 * - `NodeExtension` - For creating Prosemirror nodes in the editor. See {@link NodeExtension}
 * - `MarkExtension` - For creating Prosemirror marks in the editor. See {@link MarkExtension}
 * - `Extension` - For behaviour which doesn't need to be displayed in the dom.
 *
 * The extension is an abstract class that should not be used directly but rather extended to add the intended functionality.
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
 *
 * }
 * ```
 */
export abstract class Extension<
  GOptions extends BaseExtensionOptions = BaseExtensionOptions,
  GCommands extends string = string,
  GExtensionData extends {} = PlainObject,
  GType = never
> {
  /**
   * This pseudo property makes it easier to infer Generic types of this class.
   * @private
   */
  public readonly _O!: GOptions;

  /**
   * This pseudo property makes it easier to infer Generic types of this class.
   * @private
   */
  public readonly _T!: GType;

  /**
   * This pseudo property makes it easier to infer Generic types of this class.
   * @private
   */
  public readonly _C!: GCommands;

  /**
   * This pseudo property makes it easier to infer Generic types of this class.
   * @private
   */
  public readonly _E!: GExtensionData;

  /**
   * The options of this extension
   *
   * @remarks
   * Options are passed in at instantiation and merged with the default options of this extension.
   */
  public readonly options: Required<GOptions>;

  /**
   * The unique name of this extension.
   *
   * @remarks
   *
   * Every extension **must** have a name. Ideally the name should have a distinct type to allow
   * for better type inference for end users.
   *
   * By convention the name should be `camelCased` and unique within your editor instance.
   *
   * ```ts
   * class SimpleExtension extends Extension {
   *   get name() {
   *     return 'simple' as const;
   *   }
   *   // ...
   * }
   * ```
   */
  public abstract readonly name: string;

  /**
   * The prosemirror plugin key for this extension.
   */
  private pk?: PluginKey;

  constructor(options: GOptions = Cast<GOptions>({})) {
    this.options = Cast<Required<GOptions>>(
      deepMerge([defaultOptions, { ...this.defaultOptions, ...options }]),
    );

    this.init();
  }

  /**
   * Allows for the addition of attributes to the defined schema.
   * This is only used in node and mark extensions.
   *
   * For now extraAttrs can only be optional
   */
  protected extraAttrs(fallback: string = '') {
    if (this.type === ExtensionType.EXTENSION) {
      throw new Error('Invalid use of extraAttrs within a plain extension.');
    }

    const extraAttrs = this.options.extraAttrs!;
    const attrs: Record<string, { default?: unknown }> = {};
    if (!extraAttrs) {
      return attrs;
    }

    for (const item of extraAttrs) {
      if (Array.isArray(item)) {
        attrs[item[0]] = { default: attrs[1] };
      } else {
        attrs[item] = { default: fallback };
      }
    }
    return attrs;
  }

  /**
   * This is a utility method to help avoid the need for defining a constructor in sub classes.
   *
   * @remarks
   * When overriding this method make sure to call the super method.
   *
   * ```ts
   * class AwesomeExtension extends Extension {
   *   protected init() {
   *     super.init(); // Must be called
   *     this.doMyThing();
   *   }
   *
   *   private doMyThing() {
   *     // Secret sauce
   *   }
   * }
   * ```
   */
  protected init() {
    this.pk = new PluginKey(this.name);
  }

  /**
   * This defines the type of the extension.
   *
   * @remarks
   * There are three types of extension:
   *
   * - `extension`
   * - `node` see {@link NodeExtension}
   * - `mark` see {@link MarkExtension}
   *
   * This identifier is used in the extension manager to separate marks from nodes and to determine
   * the functionality of each extension.
   */
  get type(): ExtensionType {
    return ExtensionType.EXTENSION;
  }

  /**
   * Retrieves the plugin key which is used to uniquely identify the plugin created by the extension.
   */
  public get pluginKey(): PluginKey {
    if (this.pk) {
      return this.pk;
    }
    this.pk = new PluginKey(this.name);
    return this.pk;
  }

  /**
   * This determines the default options for the extension.
   *
   * @remarks
   * All non-required options that an extension uses should have a default options defined here.
   */
  protected get defaultOptions(): Partial<GOptions> {
    return {};
  }
}

export interface Extension<
  GOptions extends BaseExtensionOptions = BaseExtensionOptions,
  GCommands extends string = string,
  GExtensionData extends {} = PlainObject,
  GType = never
> {
  /**
   * An extension can declare the extensions it requires with options needed for instantiating them.
   *
   * @remarks
   *
   * When creating the extension manager the extension will be checked for required extension as well as
   * a quick check to see if the required extension is already included.
   *
   * @internalremarks
   * TODO implement this functionality
   */
  readonly requiredExtensions?: RequiredExtension[];

  /**
   * Determines whether this extension is currently active (only applies to Node Extensions and Mark Extensions).
   *
   * If a command name is provided (to the return function) then this method should return true if that command
   * is currently active. Conceptually this doesn't always make sense and in those cases it should be save to just
   * return false.
   *
   * @param params - extension manager params
   */
  isActive?(params: ExtensionManagerParams): BooleanExtensionCheck<GCommands>;

  /**
   * Allows the extension to modify the attributes for the Prosemirror editor dom element.
   *
   * @remarks
   *
   * Sometimes an extension will need to make a change to the attributes of the editor itself. For example
   * a placeholder may need to do some work to make the editor more accessible by setting the `aria-placeholder`
   * value to match the value of the placeholder.
   *
   * @param params - extension manger params
   *
   * @alpha
   */
  attributes?(params: ExtensionManagerParams): AttrsWithClass;

  /**
   * Register commands for the extension.
   *
   * These are typically used to create menu's actions and as a direct response
   * to user actions.
   *
   * @remarks
   *
   * The commands function should return an object with each key being unique within the editor. To ensure
   * that this is the case it is recommended that the keys of the command are namespaced with the name of the
   * extension.
   *
   * e.g.
   *
   * ```ts
   * class History extends Extension {
   *   name = 'history';
   *   commands() {
   *     return {
   *       undoHistory: COMMAND_FN,
   *       redoHistory: COMMAND_FN,
   *     }
   *   }
   * }
   * ```
   *
   * The actions available in this case would be `undoHistory` and `redoHistory`. It is unlikely
   * that any other extension would override these commands.
   *
   * Another benefit of commands is that they are picked up by typescript and can provide code completion
   * for consumers of the extension.
   *
   * @param params - schema params with type included
   */
  commands?(params: CommandTypeParams<GType>): ExtensionCommandReturn<GCommands>;

  /**
   * Determines whether this extension is enabled. If a command name is provided then it should return a value
   * determining whether that command is able to be run.
   *
   * @param params - extension manager parameters
   */
  isEnabled?(params: ExtensionManagerParams): BooleanExtensionCheck<GCommands>;

  /**
   * Each extension can make extension data available which is updated on each render. Think of it like the
   * prosemirror plugins state.
   *
   * Within React this data is passed back into Remirror render prop and also the Remirror context and can be retrieved
   * with a `hook` or `HOC`
   */
  extensionData(params: SchemaTypeParams<GType>): GExtensionData;

  /**
   * Register input rules which are activated if the regex matches as a user is typing.
   *
   * @param params - schema params with type included
   */
  inputRules?(params: SchemaTypeParams<GType>): InputRule[];

  /**
   * Add key bindings for this extension.
   *
   * @param params - schema params with type included
   */
  keys?(params: SchemaTypeParams<GType>): KeyboardBindings;

  /**
   * Registers a node view for the extension.
   *
   * This is a shorthand way of registering a nodeView without the need to create a prosemirror plugin.
   * It allows for the registration of one nodeView which has the same name as the extension.
   *
   * To register more than one you would need to use a custom plugin returned from the `plugin` method.
   *
   * @param params - schema params with type included
   *
   * @alpha
   */
  nodeView?(params: SchemaTypeParams<GType>): NodeViewMethod;

  /**
   * Called whenever a transaction successfully updates the editor state.
   *
   * Changes to the transaction will have no impact at this point and are purely f
   */
  onTransaction?(params: OnTransactionParams): void;

  /**
   * Register paste rules for this extension.
   *
   * Paste rules are activated when text is pasted into the editor.
   *
   * @param params - schema params with type included
   */
  pasteRules?(params: SchemaTypeParams<GType>): ProsemirrorPlugin[];

  /**
   * Register a plugin for the extension.
   *
   * @param params - schema params with type included
   */
  plugin?(params: SchemaTypeParams<GType>): ProsemirrorPlugin;

  /**
   * A method for transforming the SSR JSX received by the extension. Some extensions add decorations
   * to the ProsemirrorView based on their state. These decorations can touch any node or mark and it
   * would be very difficult to model this without being able to take the completed JSX render and
   * transforming it some way.
   *
   * An example use case is for placeholders which need to render a `data-placeholder` and `class` attribute so that
   * the placeholder is shown by the styles. This method can be called to check if there is only one child of the parent
   */
  ssrTransformer?(element: JSX.Element, params: ExtensionManagerParams): JSX.Element;

  /**
   * Allows extensions to register styles on the editor instance using emotion for dynamic styling.
   *
   * @param params - extension manager parameters
   */
  styles?(params: ExtensionManagerParams): Interpolation;
}

/**
 * Provides a type annotation which is applicable to any extension type.
 */
export type AnyExtension = Extension<any, any, any, any>;

/**
 * Utility type for retrieving the extension options from an extension.
 */
export type ExtensionOptions<GExtension extends AnyExtension> = GExtension['_O'];

/**
 * Utility type for retrieving the commands provided by an extension.
 */
export type ExtensionCommands<GExtension extends AnyExtension> = GExtension['_C'];

/**
 * Utility type for retrieving the extension data object made available from the extension.
 */
export type ExtensionExtensionData<GExtension extends AnyExtension> = GExtension['_E'];

/**
 * Utility type for retrieving the prosemirror type of the extension.
 */
export type ExtensionProsemirrorType<GExtension extends AnyExtension> = GExtension['_T'];

/** An extension constructor */
export interface ExtensionConstructor<
  GOptions extends BaseExtensionOptions,
  GExtension extends Extension<GOptions, any, string>
> {
  // tslint:disable-next-line: callable-types
  new (options?: GOptions): GExtension;
}

/**
 * The API for required extensions.
 *
 * @internalremarks
 * This is still very much WIP and has no implementation.
 *
 * @alpha
 */
export interface RequiredExtension {
  extension: AnyExtension;
  options: any;
}

/**
 * The params object received by the onTransaction handler.
 */
export interface OnTransactionParams
  extends ViewExtensionManagerParams,
    TransactionParams,
    EditorStateParams {}

/**
 * Provides a priority value to the extension which determines the priority.
 *
 * @remarks
 * A lower value for priority means a higher priority. Think of it as an index and position in array
 * except that it can also support negative values.
 */
export interface PrioritizedExtension {
  /**
   * The instantiated extension
   */
  extension: AnyExtension;

  /**
   * A priority given to the extension.
   *
   * @remarks
   * A lower number implies an earlier place in the extension list and hence more priority over the extensions that follow.
   *
   * @defaultValue 2
   */
  priority: number;
}

/**
 * Either a PrioritizedExtension or the actual Extension.
 *
 * @remarks
 *
 * This is used by the extension manager to allow for a more flexible initialization.
 */
export type FlexibleExtension = PrioritizedExtension | AnyExtension;

export interface ExtensionListParams {
  /** A list of passed extensions */
  extensions: AnyExtension[];
}

/**
 * Determines if the passed in extension is a any type of extension.
 *
 * @param extension - the extension to check
 */
export const isExtension = (extension: unknown): extension is AnyExtension =>
  isObject(extension) && extension instanceof Extension;

/**
 * Checks whether the this is an extension and if it is a plain one
 *
 * @param extension - the extension to check
 */
export const isPlainExtension = (extension: unknown): extension is Extension<any, never> =>
  isExtension(extension) && extension.type === ExtensionType.EXTENSION;
