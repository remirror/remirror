import { Interpolation } from '@emotion/core';
import { ExtensionType, Tags } from '@remirror/core-constants';
import { Cast, deepMerge, isString } from '@remirror/core-helpers';
import {
  AnyFunction,
  Attrs,
  AttrsWithClass,
  BaseExtensionOptions,
  CommandStatusCheck,
  CommandTypeParams,
  ExtensionCommandReturn,
  ExtensionHelperReturn,
  ExtensionManagerParams,
  ExtensionManagerTypeParams,
  KeyboardBindings,
  NodeViewMethod,
  OnTransactionParams,
  PlainObject,
  ProsemirrorPlugin,
  ExtraAttrs,
} from '@remirror/core-types';
import { InputRule } from 'prosemirror-inputrules';
import { PluginKey } from 'prosemirror-state';
import { Suggester } from 'prosemirror-suggest';

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
export abstract class Extension<GOptions extends BaseExtensionOptions, GType = never> {
  /**
   * The options of this extension
   *
   * @remarks
   *
   * Options are passed in at instantiation and merged with the default options
   * of this extension.
   *
   */
  public readonly options: Required<GOptions>;

  /**
   * The unique name of this extension.
   *
   * @remarks
   *
   * Every extension **must** have a name. Ideally the name should have a
   * distinct type to allow for better type inference for end users. By
   * convention the name should be `camelCased` and unique within your editor
   * instance.
   *
   * ```ts
   * class SimpleExtension extends Extension {
   *   get name() {
   *     return 'simple' as const;
   *   }
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
      deepMerge(defaultOptions, { ...this.defaultOptions, ...options }),
    );

    this.init();
  }

  /**
   * Allows for the addition of attributes to the defined schema.
   * This is only used in node and mark extensions.
   *
   * For now extraAttrs can only be optional
   */
  protected extraAttrs(fallback: string | null = '') {
    if (this.type === ExtensionType.Plain) {
      throw new Error('Invalid use of extraAttrs within a plain extension.');
    }

    const extraAttrs = this.options.extraAttrs as ExtraAttrs[];
    const attrs: Record<string, { default?: unknown }> = {};
    if (!extraAttrs) {
      return attrs;
    }

    for (const item of extraAttrs) {
      if (Array.isArray(item)) {
        attrs[item[0]] = { default: item[1] };
      } else if (isString(item)) {
        attrs[item] = { default: fallback };
      } else {
        const { name, default: def } = item;
        attrs[name] = def ? { default: def } : {};
      }
    }
    return attrs;
  }

  /**
   * Runs through the extraAttrs and retrieves the
   */
  protected getExtraAttrs(domNode: Node) {
    if (this.type === ExtensionType.Plain) {
      throw new Error('Invalid use of extraAttrs within a plain extension.');
    }

    const extraAttrs = this.options.extraAttrs as ExtraAttrs[];
    const attrs: Attrs = {};
    if (!extraAttrs) {
      return attrs;
    }

    for (const item of extraAttrs) {
      if (Array.isArray(item)) {
        // Use the default
        const [name, , attributeName] = item;
        attrs[name] = attributeName ? (domNode as Element).getAttribute(attributeName) : undefined;
      } else if (isString(item)) {
        // Assume the name is the same
        attrs[item] = (domNode as Element).getAttribute(item);
      } else {
        const { name, getAttrs, default: fallback } = item;
        attrs[name] = getAttrs ? getAttrs(domNode) || fallback : fallback;
      }
    }
    return attrs;
  }

  /**
   * This is a utility method to help avoid the need for defining a constructor
   * in sub classes.
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
   * - `plain`
   * - `node` - see {@link NodeExtension}
   * - `mark` - see {@link MarkExtension}
   *
   * This identifier is used in the extension manager to separate marks from
   * nodes and to determine the functionality of each extension.
   */
  get type(): ExtensionType {
    return ExtensionType.Plain;
  }

  /**
   * Tags help to categorize the behavior of an extension. This behavior is
   * later grouped in the extension manager and passed as `tag` to each
   * extension method. It can be used by commands that need to remove all
   * formatting and use the tag to identify which registered extensions are formatters.
   *
   * There are internally defined tags but it's also possible to define any
   * custom string as a tag. See {@link Tags}
   */
  get tags(): Array<Tags | string> {
    return [];
  }

  /**
   * Retrieves the plugin key which is used to uniquely identify the plugin
   * created by the extension.
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

  /**
   * `ExtensionOptions`
   *
   * This pseudo property makes it easier to infer generic types of this class.
   * @private
   */
  public readonly _O!: GOptions;

  /**
   * `ProsemirrorType`
   *
   * This pseudo property makes it easier to infer generic types from this class.
   * @private
   */
  public readonly _T!: GType;

  /**
   * `ExtensionCommands`
   *
   * This pseudo property makes it easier to infer Generic types of this class.
   * @private
   */
  public readonly _C!: this['commands'] extends AnyFunction ? ReturnType<this['commands']> : {};

  /**
   * `ExtensionHelpers`
   *
   * This pseudo property makes it easier to infer Generic types of this class.
   * @private
   */
  public readonly _H!: this['helpers'] extends AnyFunction ? ReturnType<this['helpers']> : {};
}

export interface Extension<GOptions extends BaseExtensionOptions = BaseExtensionOptions, GType = never> {
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
  commands?(params: CommandTypeParams<GType>): ExtensionCommandReturn;

  /**
   * Each extension can make extension data available which is updated on each
   * render. Think of it like the prosemirror plugins state.
   *
   * Within React this data is passed back into Remirror render prop and also
   * the Remirror context and can be retrieved with a `hook` or `HOC`
   */
  extensionData?(params: ExtensionManagerTypeParams<GType>): PlainObject;

  /**
   * A helper method is a function that takes in arguments and returns
   * a value depicting the state of the editor specific to this extension.
   *
   * @remarks
   *
   * Unlike commands they can return anything and they do not effect the editor in anyway.
   *
   * They are general versions of the `isActive` and `isEnabled` methods.
   *
   * Below is an example which should provide some idea on how to add helpers to the app.
   *
   * ```tsx
   * // extension.ts
   * import { ExtensionManagerParams } from '@remirror/core';
   *
   * class MyBeautifulExtension {
   *   get name() {
   *     return 'beautiful' as const
   *   }
   *
   *   helpers(params: ExtensionManagerParams) {
   *     return {
   *       isMyCodeBeautiful: () => true,
   *     }
   *   }
   * }
   *
   * // app.tsx
   * import { useRemirrorContext } from '@remirror/react';
   *
   * export const MyApp = () => {
   *   const { helpers } = useRemirrorContext();
   *
   *   return helpers.isMyCodeBeautiful() ? (<span>😍</span>) : (<span>😢</span>);
   * };
   * ```
   */
  helpers?(params: ExtensionManagerTypeParams<GType>): ExtensionHelperReturn;

  /**
   * Register input rules which are activated if the regex matches as a user is
   * typing.
   *
   * @param params - schema params with type included
   */
  inputRules?(params: ExtensionManagerTypeParams<GType>): InputRule[];

  /**
   * Determines whether this extension is currently active (only applies to Node
   * Extensions and Mark Extensions).
   *
   * If a command name is provided (to the return function) then this method
   * should return true if that command is currently active. Conceptually this
   * doesn't always make sense and in those cases it should be save to just
   * return false.
   *
   * @param params - extension manager params
   */
  isActive?(params: ExtensionManagerParams): CommandStatusCheck;

  /**
   * Determines whether this extension is enabled. If a command name is provided
   * then it should return a value determining whether that command is able to
   * be run.
   *
   * @param params - extension manager parameters
   */
  isEnabled?(params: ExtensionManagerParams): CommandStatusCheck;

  /**
   * Add key bindings for this extension.
   *
   * @param params - schema params with type included
   */
  keys?(params: ExtensionManagerTypeParams<GType>): KeyboardBindings;

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
  nodeView?(params: ExtensionManagerTypeParams<GType>): NodeViewMethod;

  /**
   * Called whenever a transaction successfully updates the editor state.
   *
   * Changes to the transaction at this point have no impact at all. It is
   * purely for observational reasons
   */
  onTransaction?(params: OnTransactionParams): void;

  /**
   * Register paste rules for this extension.
   *
   * Paste rules are activated when text is pasted into the editor.
   *
   * @param params - schema params with type included
   */
  pasteRules?(params: ExtensionManagerTypeParams<GType>): ProsemirrorPlugin[];

  /**
   * Register a plugin for the extension.
   *
   * @param params - schema params with type included
   */
  plugin?(params: ExtensionManagerTypeParams<GType>): ProsemirrorPlugin;

  /**
   * An extension can declare the extensions it requires with options needed for
   * instantiating them.
   *
   * @remarks
   *
   * When creating the extension manager the extension will be checked for
   * required extension as well as a quick check to see if the required
   * extension is already included.
   *
   * @internalremarks
   * TODO implement this functionality
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
  ssrTransformer?(element: JSX.Element, params: ExtensionManagerParams): JSX.Element;

  /**
   * Allows extensions to register styles on the editor instance using emotion
   * for dynamic styling.
   *
   * @param params - extension manager parameters
   */
  styles?(params: ExtensionManagerParams): Interpolation;

  /**
   * Create suggestions which respond to character key combinations within the
   * editor instance.
   */
  suggestions?(params: ExtensionManagerTypeParams<GType>): Suggester[] | Suggester;
}
