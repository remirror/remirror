/* eslint-disable @typescript-eslint/member-ordering */

import {
  __INTERNAL_REMIRROR_IDENTIFIER_KEY__,
  ErrorConstant,
  ExtensionPriority,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import { assertGet, freeze, invariant, pascalCase, uniqueBy } from '@remirror/core-helpers';
import type {
  ApplySchemaAttributes,
  Dispose,
  EditorState,
  EditorView,
  EmptyShape,
  MarkExtensionSpec,
  MarkSpecOverride,
  MarkType,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeType,
  Replace,
  Shape,
  ValidOptions,
} from '@remirror/core-types';
import { isIdentifierOfType, isRemirrorType } from '@remirror/core-utils';

import type {
  AppendLifecycleProps,
  ApplyStateLifecycleProps,
  BaseExtensionOptions,
  ExtensionCommandReturn,
  ExtensionHelperReturn,
  StateUpdateLifecycleProps,
} from '../types';
import {
  AnyBaseClassOverrides,
  BaseClass,
  BaseClassConstructor,
  ConstructorProps,
  DefaultOptions,
} from './base-class';

/**
 * Auto infers the parameter for the constructor. If there is a required static
 * option then the TypeScript compiler will error if nothing is passed in.
 */
export type ExtensionConstructorProps<Options extends ValidOptions> = ConstructorProps<
  Options,
  BaseExtensionOptions
>;

/**
 * Extensions are fundamental to the way that Remirror works by grouping
 * together the functionality and handling the management of similar concerns.
 *
 * @remarks
 *
 *  Extension can adjust editor functionality in any way. Here are some
 *  examples.
 *
 * - How the editor displays certain content, i.e. **bold**, _italic_,
 *   **underline**.
 * - Which commands should be made available e.g. `commands.toggleBold()` to
 *   toggle the weight of the selected text.
 * - Check if a command is currently enabled (i.e a successful dry run) e.g.
 *   `commands.toggleBold.isEnabled()`.
 * - Register Prosemirror `Plugin`s, `keymap`s, `InputRule`s `PasteRule`s,
 *   `Suggestions`, and custom `nodeViews` which affect the behavior of the
 *   editor.
 *
 * There are three types of `Extension`.
 *
 * - `NodeExtension` - For creating Prosemirror nodes in the editor. See
 *   {@link NodeExtension}
 * - `MarkExtension` - For creating Prosemirror marks in the editor. See
 *   {@link MarkExtension}
 * - `PlainExtension` - For behavior which doesn't map to a `ProsemirrorNode` or
 *   `Mark` and as a result doesn't directly affect the Prosemirror `Schema` or
 *   content. See {@link PlainExtension}.
 *
 * This `Extension` is an abstract class that should not be used directly but
 * rather extended to add the intended functionality.
 *
 * ```ts
 * import { PlainExtension, Static } from 'remirror';
 *
 * interface AwesomeExtensionOptions {
 *   isAwesome?: Static<boolean>;
 *   id?: string;
 * }
 *
 * class AwesomeExtension extends PlainExtension<AwesomeExtensionOptions> {
 *   static defaultOptions: DefaultExtensionOptions<AwesomeExtensionOptions> = {
 *     isAwesome: true,
 *     id: '',
 *   }
 *
 *   get name() {
 *     return 'awesome' as const;
 *   }
 * }
 * ```
 */
abstract class Extension<Options extends ValidOptions = EmptyShape> extends BaseClass<
  Options,
  BaseExtensionOptions
> {
  /**
   * The default priority for this family of extensions.
   */
  static readonly defaultPriority: ExtensionPriority = ExtensionPriority.Default;

  /**
   * Allows for the `RemirrorManager` or `Preset`'s to override the priority of
   * an extension.
   */
  private priorityOverride?: ExtensionPriority;

  /**
   * The priority level for this instance of the extension. A higher value
   * corresponds to a higher priority extension
   */
  get priority(): ExtensionPriority {
    return this.priorityOverride ?? this.options.priority ?? this.constructor.defaultPriority;
  }

  /**
   * The name that the constructor should have, which doesn't get mangled in
   * production.
   */
  get constructorName(): string {
    return `${pascalCase(this.name)}Extension`;
  }

  /**
   * The store is a shared object that's internal to each extension. It includes
   * often used items like the `view` and `schema` that are added by the
   * extension manager and also the lifecycle extension methods.
   *
   * **NOTE** - The store is not available until the manager has been created
   * and received the extension. As a result trying to access the store during
   * `init` and `constructor` will result in a runtime error.
   *
   * Some properties of the store are available at different phases. You should
   * check the inline documentation to know when a certain property is useable
   * in your extension.
   */
  protected get store(): Remirror.ExtensionStore {
    invariant(this._store, {
      code: ErrorConstant.MANAGER_PHASE_ERROR,
      message: `An error occurred while attempting to access the 'extension.store' when the Manager has not yet set created the lifecycle methods.`,
    });

    return freeze(this._store, { requireKeys: true });
  }

  /**
   * The list of extensions added to the editor by this `Preset`.
   */
  get extensions(): Array<this['~E']> {
    return this._extensions;
  }
  /**
   * Private list of extension stored within this [[`Preset`]].
   */
  private _extensions: Array<this['~E']>;

  /**
   * An extension mapping of the extensions and their constructors.
   */
  private readonly extensionMap: Map<this['~E']['constructor'], this['~E']>;

  /**
   * This store is can be modified by the extension manager with and lifecycle
   * extension methods.
   *
   * Different properties are added at different times so it's important to
   * check the documentation for each property to know what phase is being
   * added.
   */
  private _store?: Remirror.ExtensionStore;

  constructor(...args: ExtensionConstructorProps<Options>) {
    super(defaultOptions, ...args);

    // Create the extension list.
    this._extensions = uniqueBy(
      this.createExtensions() as any,
      // Ensure that all the provided extensions are unique.
      (extension) => extension.constructor,
    );

    this.extensionMap = new Map<this['~E']['constructor'], this['~E']>();

    // Create the extension map for retrieving extensions from the `Preset`
    for (const extension of this._extensions) {
      this.extensionMap.set(extension.constructor, extension);
    }
  }

  /**
   * When there are duplicate extensions used within the editor the extension
   * manager will call this method and make sure all extension holders are using
   * the same instance of the `ExtensionConstructor`.
   *
   * @internal
   */
  replaceChildExtension(constructor: AnyExtensionConstructor, extension: this['~E']): void {
    if (!this.extensionMap.has(constructor)) {
      return;
    }

    this.extensionMap.set(constructor, extension);
    this._extensions = this.extensions.map((currentExtension) =>
      extension.constructor === constructor ? extension : currentExtension,
    );
  }

  /**
   * Not for usage. This is purely for types to make it easier to infer
   * available sub extension types.
   *
   * @internal
   */
  ['~E']: ReturnType<this['createExtensions']>[number];

  /**
   * Create the extensions which will be consumed by the preset. Override this
   * if you would like to make your extension a parent to other (holder)
   * extensions which don't make sense existing outside of the context of this
   * extension.
   *
   * @remarks
   *
   * Since this method is called in the constructor it should always be created
   * as an instance method and not a property. Properties aren't available for
   * the call to the parent class.
   *
   * ```ts
   * class HolderExtension extends PlainExtension {
   *   get name() {
   *     return 'holder'
   *   }
   *
   *   // GOOD ✅
   *   createExtensions() {
   *     return [];
   *   }
   *
   *   // BAD ❌
   *   createExtensions = () => {
   *     return [];
   *   }
   * }
   * ```
   */
  createExtensions(): AnyExtension[] {
    return [];
  }

  /**
   * Get an extension from this holder extension by providing the desired
   * `Constructor`.
   *
   * @param Constructor - the extension constructor to find in the editor.
   *
   * @remarks
   *
   * This method will throw an error if the constructor doesn't exist within the
   * extension created by this extension.
   *
   * It can be used to forward options and attach handlers to the children
   * extensions. It is the spiritual replacement of the `Preset` extension.
   *
   * ```ts
   * import { PlainExtension, OnSetOptionsProps } from 'remirror';
   *
   * interface ParentOptions { weight?: string }
   *
   * class ParentExtension extends PlainExtension<ParentOptions> {
   *   get name() {
   *     return 'parent' as const;
   *   }
   *
   *   createExtensions() {
   *     return [new BoldExtension()]
   *   }
   *
   *   onSetOptions(options: OnSetOptionsProps<ParentOptions>): void {
   *     if (options.changes.weight.changed) {
   *       // Update the value of the provided extension.
   *       this.getExtension(BoldExtension).setOption({ weight: options.changes.weight.value });
   *     }
   *   }
   * }
   * ```
   */
  getExtension<Type extends this['~E']['constructor']>(Constructor: Type): InstanceType<Type> {
    const extension = this.extensionMap.get(Constructor);

    // Throws an error if attempting to get an extension which is not available
    // in this preset.
    invariant(extension, {
      code: ErrorConstant.INVALID_GET_EXTENSION,
      message: `'${Constructor.name}' does not exist within the preset: '${this.name}'`,
    });

    return extension as InstanceType<Type>;
  }

  /**
   * Check if the type of this extension's constructor matches the type of the
   * provided constructor.
   */
  isOfType<Type extends AnyExtensionConstructor>(Constructor: Type): this is InstanceType<Type> {
    return this.constructor === (Constructor as unknown);
  }

  /**
   * Pass a reference to the globally shared `ExtensionStore` for this
   * extension.
   *
   * @remarks
   *
   * The extension store allows extensions to access important variables without
   * complicating their creator methods.
   *
   * ```ts
   * import { PlainExtension } from 'remirror';
   *
   * class Awesome extends PlainExtension {
   *   customMethod() {
   *     if (this.store.view.hasFocus()) {
   *       log('dance dance dance');
   *     }
   *   }
   * }
   * ```
   *
   * This should only be called by the `RemirrorManager`.
   *
   * @internal
   * @nonVirtual
   */
  setStore(store: Remirror.ExtensionStore): void {
    if (this._store) {
      return;
    }

    this._store = store;
  }

  /**
   * Clone an extension.
   */
  clone(...args: ExtensionConstructorProps<Options>): Extension<Options> {
    return new this.constructor(...args);
  }

  /**
   * Set the priority override for this extension. This is used in the
   * `RemirrorManager` in order to override the priority of an extension.
   *
   * If you set the first parameter to `undefined` it will remove the priority
   * override.
   *
   * @internal
   */
  setPriority(priority: undefined | ExtensionPriority): void {
    this.priorityOverride = priority;
  }
}

/**
 * Declaration merging since the constructor property can't be defined on the
 * actual class.
 */
interface Extension<Options extends ValidOptions = EmptyShape>
  extends ExtensionLifecycleMethods,
    Remirror.BaseExtension {
  /**
   * The type of the constructor for the extension.
   */
  constructor: ExtensionConstructor<Options>;

  /**
   * An extension can declare the extensions it requires.
   *
   * @remarks
   *
   * When creating the extension manager the extension will be checked for
   * required extension as well as a quick check to see if the required
   * extension is already included. If not present a descriptive error will be
   * thrown.
   */
  requiredExtensions?: AnyExtensionConstructor[];
}

/**
 * Get the expected type signature for the `defaultOptions`. Requires that every
 * optional setting key (except for keys which are defined on the
 * `BaseExtensionOptions`) has a value assigned.
 */
export type DefaultExtensionOptions<Options extends ValidOptions> = DefaultOptions<
  Options,
  BaseExtensionOptions
>;

/**
 * Here is the extension lifecycle order.
 *
 * ### Ordering
 *
 * - `onCreate`
 * - `onView`
 * - **runtime**
 * - `onStateUpdate` (repeats for every update to the prosemirror editor state)
 * - `onDestroy` (end of life)
 */
interface ExtensionLifecycleMethods {
  /**
   * This handler is called when the `RemirrorManager` is first created.
   *
   * @remarks
   *
   * Since it is called as soon as the manager is some methods may not be
   * available in the extension store. When accessing methods on `this.store` be
   * shore to check when they become available in the lifecycle.
   *
   * You can return a `Dispose` function which will automatically be called when
   * the extension is destroyed.
   *
   * @category Lifecycle Methods
   */
  onCreate?(): Dispose | void;

  /**
   * This event happens when the view is first received from the view layer
   * (e.g. React).
   *
   * Return a dispose function which will be called when the extension is
   * destroyed.
   *
   * @category Lifecycle Methods
   */
  onView?(view: EditorView): Dispose | void;

  /**
   * This can be used by the `Extension` to append a transaction to the latest
   * update.
   *
   * This is shorthand for the `ProsemirrorPlugin.spec.appendTransaction`.
   *
   * @category Lifecycle Methods
   */
  onAppendTransaction?(props: AppendLifecycleProps): void;

  /**
   * This is called when the prosemirror editor state is first attached to the
   * editor. It can be useful for doing some preparation work.
   *
   * This is a shorthand for creating a plugin and adding the
   * [[`Plugin.spec.state.init`]].
   *
   * @category Lifecycle Methods
   */
  onInitState?(state: EditorState): void;

  /**
   * This is called when the state is being applied to the editor. This can be
   * used as a shorthand for the [[`Plugin.spec.state.apply`]] method.
   *
   * For example, when using [[`createDecorations`]] you can respond to editor
   * updates within this callback.
   *
   * @category Lifecycle Methods
   */
  onApplyState?(props: ApplyStateLifecycleProps): void;

  /**
   * This handler is called after a transaction successfully updates the editor
   * state. It is called asynchronously after the [[`onApplyState`]] hook has
   * been run run.
   *
   * @category Lifecycle Methods
   */
  onStateUpdate?(props: StateUpdateLifecycleProps): void;

  /**
   * Called when the extension is being destroyed.
   *
   * @category Lifecycle Methods
   */
  onDestroy?(): void;
}

/**
 * Create a plain extension which doesn't directly map to Prosemirror nodes or
 * marks.
 *
 * Plain extensions are a great way to add custom behavior to your editor.
 */
export abstract class PlainExtension<
  Options extends ValidOptions = EmptyShape,
> extends Extension<Options> {
  /** @internal */
  static get [__INTERNAL_REMIRROR_IDENTIFIER_KEY__](): RemirrorIdentifier.PlainExtensionConstructor {
    return RemirrorIdentifier.PlainExtensionConstructor;
  }

  /** @internal */
  get [__INTERNAL_REMIRROR_IDENTIFIER_KEY__](): RemirrorIdentifier.PlainExtension {
    return RemirrorIdentifier.PlainExtension;
  }
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
  Options extends ValidOptions = EmptyShape,
> extends Extension<Options> {
  /** @internal */
  static get [__INTERNAL_REMIRROR_IDENTIFIER_KEY__](): RemirrorIdentifier.MarkExtensionConstructor {
    return RemirrorIdentifier.MarkExtensionConstructor;
  }

  /**
   * Whether to disable extra attributes for this extension.
   */
  static readonly disableExtraAttributes: boolean = false;

  /** @internal */
  get [__INTERNAL_REMIRROR_IDENTIFIER_KEY__](): RemirrorIdentifier.MarkExtension {
    return RemirrorIdentifier.MarkExtension;
  }

  /**
   * Provides access to the mark type from the schema.
   *
   * @remarks
   *
   * The type is available as soon as the schema is created by the
   * `SchemaExtension` which has the priority `Highest`. It should be safe to
   * access in any of the lifecycle methods.
   */
  get type(): MarkType {
    return assertGet(this.store.schema.marks, this.name);
  }

  constructor(...args: ExtensionConstructorProps<Options>) {
    super(...args);
  }

  /**
   * Provide a method for creating the schema. This is required in order to
   * create a `MarkExtension`.
   *
   * @remarks
   *
   * The main difference between the return value of this method and Prosemirror
   * `MarkSpec` is that that the `toDOM` method doesn't allow dom manipulation.
   * You can only return an array or string.
   *
   * For more advanced requirements, it may be possible to create a `nodeView`
   * to manage the dom interactions.
   */
  abstract createMarkSpec(
    extra: ApplySchemaAttributes,
    override: MarkSpecOverride,
  ): MarkExtensionSpec;
}

export interface MarkExtension<Options extends ValidOptions = EmptyShape>
  extends Extension<Options>,
    Remirror.MarkExtension {}

/**
 * Defines the abstract class for extensions which can place nodes into the
 * prosemirror state.
 *
 * @remarks
 *
 * For more information see {@link https://prosemirror.net/docs/ref/#model.Node}
 */
export abstract class NodeExtension<
  Options extends ValidOptions = EmptyShape,
> extends Extension<Options> {
  static get [__INTERNAL_REMIRROR_IDENTIFIER_KEY__](): RemirrorIdentifier.NodeExtensionConstructor {
    return RemirrorIdentifier.NodeExtensionConstructor;
  }

  /**
   * Whether to disable extra attributes for this extension.
   */
  static readonly disableExtraAttributes: boolean = false;

  /** @internal */
  get [__INTERNAL_REMIRROR_IDENTIFIER_KEY__](): RemirrorIdentifier.NodeExtension {
    return RemirrorIdentifier.NodeExtension as const;
  }

  /**
   * Provides access to the node type from the schema.
   */
  get type(): NodeType {
    return assertGet(this.store.schema.nodes, this.name);
  }

  constructor(...args: ExtensionConstructorProps<Options>) {
    super(...args);
  }

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
   *
   * @params hole - a method that is meant to indicate where extra attributes
   * should be placed (if they exist).
   *
   * The `hole` is a function that augments the passed object adding a special
   * `secret` key which is used to insert the extra attributes setter.
   *
   * ```ts
   * import { NodeExtension, SpecHole } from 'remirror';
   *
   * class AwesomeExtension extends NodeExtension {
   *   get name() { return 'awesome' as const'; }
   *
   *   createNodeSpec() {
   *     return {
   *       toDOM: (node) => {
   *         return ['p', hole(), 0]
   *       }
   *     }
   *   }
   * }
   * ```
   *
   * The above example will have the `hole()` method call replaced with the
   * extra attributes.
   */
  abstract createNodeSpec(
    extra: ApplySchemaAttributes,
    override: NodeSpecOverride,
  ): NodeExtensionSpec;
}

export interface NodeExtension<Options extends ValidOptions = EmptyShape>
  extends Extension<Options>,
    Remirror.NodeExtension {}

/**
 * The type which is applicable to any extension instance.
 *
 * **NOTE** `& object` forces VSCode to use the name `AnyExtension` rather than
 * print out `Replace<Extension<Shape>, Remirror.AnyExtensionOverrides>`
 */
export type AnyExtension = Replace<Extension<Shape>, Remirror.AnyExtensionOverrides> & object;

/**
 * The type which is applicable to any extension instance.
 */
export type AnyExtensionConstructor = Replace<
  ExtensionConstructor<any>,
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  { new (...args: any[]): AnyExtension }
>;

/**
 * The type for any potential PlainExtension.
 */
export type AnyPlainExtension = Replace<PlainExtension<Shape>, Remirror.AnyExtensionOverrides> &
  object;

/**
 * The type for any potential NodeExtension.
 */
export type AnyNodeExtension = Replace<NodeExtension<Shape>, Remirror.AnyExtensionOverrides> &
  object;

/**
 * The type for any potential MarkExtension.
 */
export type AnyMarkExtension = Replace<MarkExtension<Shape>, Remirror.AnyExtensionOverrides> &
  object;

/**
 * These are the default options merged into every extension. They can be
 * overridden.
 */
const defaultOptions: BaseExtensionOptions = {
  priority: undefined,
  extraAttributes: {},
  disableExtraAttributes: false,
  exclude: {},
} as BaseExtensionOptions;

/**
 * Mutate the default extension options.
 *
 * @remarks
 *
 * This is a dangerous method since it allows you to mutate the received object.
 * Don't use it unless you absolutely have to.
 *
 * A potential use case is for adding a new default option to all extensions. It
 * shows an example of how to accomplish this in a typesafe way.
 *
 * ```ts
 * import { mutateDefaultExtensionOptions } from 'remirror';
 *
 * mutateDefaultExtensionOptions((settings) => {
 *   // Set the default value of all extensions to have a property `customSetting` with value `false`.
 *   settings.customSetting = false;
 * })
 *
 * declare global {
 *   namespace Remirror {
 *     interface BaseExtensionOptions {
 *       customSetting?: boolean;
 *     }
 *   }
 * }
 *```
 *
 * The mutation must happen before any extension have been instantiated.
 */
export function mutateDefaultExtensionOptions(
  mutatorMethod: (defaultOptions: BaseExtensionOptions) => void,
): void {
  mutatorMethod(defaultOptions);
}

/**
 * Determines if the passed value is an extension.
 *
 * @param value - the value to test
 */
export function isExtension<Type extends AnyExtension = AnyExtension>(
  value: unknown,
): value is Type {
  return (
    isRemirrorType(value) &&
    isIdentifierOfType(value, [
      RemirrorIdentifier.PlainExtension,
      RemirrorIdentifier.MarkExtension,
      RemirrorIdentifier.NodeExtension,
    ])
  );
}

/**
 * Determines if the passed value is an extension constructor.
 *
 * @param value - the value to test
 */
export function isExtensionConstructor<
  Type extends AnyExtensionConstructor = AnyExtensionConstructor,
>(value: unknown): value is Type {
  return (
    isRemirrorType(value) &&
    isIdentifierOfType(value, [
      RemirrorIdentifier.PlainExtensionConstructor,
      RemirrorIdentifier.MarkExtensionConstructor,
      RemirrorIdentifier.NodeExtensionConstructor,
    ])
  );
}

/**
 * Checks whether the provided value is a plain extension.
 *
 * @param value - the extension to check
 */
export function isPlainExtension<Type extends AnyPlainExtension = AnyPlainExtension>(
  value: unknown,
): value is Type {
  return isRemirrorType(value) && isIdentifierOfType(value, RemirrorIdentifier.PlainExtension);
}

/**
 * Determines if the passed in extension is a node extension. Useful as a type
 * guard where a particular type of extension is needed.
 *
 * @param value - the extension to check
 */
export function isNodeExtension<Type extends AnyNodeExtension = AnyNodeExtension>(
  value: unknown,
): value is Type {
  return isRemirrorType(value) && isIdentifierOfType(value, RemirrorIdentifier.NodeExtension);
}

/**
 * Determines if the passed in extension is a mark extension. Useful as a type
 * guard where a particular type of extension is needed.
 *
 * @param value - the extension to check
 */
export function isMarkExtension<Type extends AnyMarkExtension = AnyMarkExtension>(
  value: unknown,
): value is Type {
  return isRemirrorType(value) && isIdentifierOfType(value, RemirrorIdentifier.MarkExtension);
}

export interface ExtensionConstructor<Options extends ValidOptions = EmptyShape>
  extends BaseClassConstructor<Options, BaseExtensionOptions>,
    Partial<Remirror.StaticExtensionOptions> {
  new (...args: ExtensionConstructorProps<Options>): Extension<Options>;

  /**
   * The default priority level for all instance of this extension.
   *
   * @default ExtensionPriority.Default
   */
  readonly defaultPriority: ExtensionPriority;
}

export type AnyManagerStore = Remirror.ManagerStore<any>;
export type ManagerStoreKeys = keyof Remirror.ManagerStore<any>;

declare global {
  /**
   * This namespace is global and you can use declaration merging to extend and
   * create new types used by the `remirror` project.
   *
   * @remarks
   *
   * The following would add `MyCustomType` to the `Remirror` namespace. Please
   * note that this can only be used for types and interfaces.
   *
   * ```ts
   * declare global {
   *   namespace Remirror {
   *     type MyCustomType = 'look-at-me';
   *   }
   * }
   * ```
   */
  namespace Remirror {
    /**
     * This interface stores all the currently installed extensions. As a result
     * it can be used to set the default loaded extensions to include all
     * available within `node_modules`. By extending this extension in the
     * global `Remirror` namespace the key is ignored but the value is used to
     * form the union type in the `chain`, `commands`, `helpers` properties on
     * the `Remirror.ExtensionStore` interface.
     *
     * This is useful for extensions being able to reuse the work of other
     * extension.
     */
    interface AllExtensions {}

    /**
     * This is the global interface for adding extra methods and properties to
     * all [[`Extension`]]s using declaration merging.
     *
     * @remarks
     *
     * The following will add `newOption` to the expected options. This is the
     * way that extensions which add new functionality to the editor can request
     * configuration options.
     *
     * ```ts
     * declare global {
     *   namespace Remirror {
     *     interface ExtensionFactoryProps {
     *       newOption?: string;
     *     }
     *   }
     * }
     * ```
     */
    interface BaseExtension {}

    interface NodeExtension {}
    interface MarkExtension {}

    /**
     * An override to for the `AnyExtension` type. If you're extension adds a
     * new property to the `Extension` that is deeply nested or very complex it
     * can break the `AnyExtension` implementation from being compatible with
     * all valid extensions.
     *
     * The keys you provide on this override replace the default `AnyExtension`
     * types include unsafe properties that need to be simplified.
     *
     * An example is the `constructor` property which makes it impossible to
     * find a common interface between extensions with different settings and
     * properties. By setting the `constructor` to a much simpler override all
     * `Extension`'s are now assignable to the `AnyExtension type again.`
     */
    interface AnyExtensionOverrides extends AnyBaseClassOverrides {
      constructor: AnyExtensionConstructor;
      ['~C']: ExtensionCommandReturn;
      ['~H']: ExtensionHelperReturn;
      ['~E']: AnyExtension;
    }
  }
}

/* eslint-enable @typescript-eslint/member-ordering */

// Make the abstract extension available but only as a type.
export type { Extension };
