import {
  __INTERNAL_REMIRROR_IDENTIFIER_KEY__,
  ErrorConstant,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import {
  freeze,
  invariant,
  isIdentifierOfType,
  isRemirrorType,
  uniqueBy,
} from '@remirror/core-helpers';
import type { EmptyShape, Replace, Shape, ValidOptions } from '@remirror/core-types';

import type { AnyExtension, AnyExtensionConstructor } from '../extension';
import {
  AnyBaseClassOverrides,
  BaseClass,
  BaseClassConstructor,
  ConstructorParameter,
  DefaultOptions,
  isValidConstructor,
} from '../extension/base-class';
import type { OnSetOptionsParameter } from '../types';

/**
 * A preset is our way of bundling similar extensions with unified options and
 * dynamic properties.
 */
export abstract class Preset<Options extends ValidOptions = EmptyShape> extends BaseClass<
  Options,
  object
> {
  /**
   * The default options for this preset.
   */
  static readonly defaultOptions = {};

  /**
   * The preset constructor identifier key.
   *
   * @internal
   */
  static get [__INTERNAL_REMIRROR_IDENTIFIER_KEY__]() {
    return RemirrorIdentifier.PresetConstructor as const;
  }
  /**
   * The remirror identifier key.
   *
   * @internal
   */
  get [__INTERNAL_REMIRROR_IDENTIFIER_KEY__]() {
    return RemirrorIdentifier.Preset as const;
  }

  /**
   * The `camelCased` name of the preset.
   */
  abstract readonly name: string;

  get extensions() {
    return this.#extensions;
  }

  /**
   * The store is a property that's internal to the preset. It include important
   * items like the `view` and `schema` that are added by the editor manager.
   *
   * **NOTE** - The store is not available until the manager has been created and
   * received the extension. As a result trying to access the store during
   * `init` and `constructor` will result in a runtime error.
   */
  protected get extensionStore() {
    invariant(this.#extensionStore, {
      code: ErrorConstant.MANAGER_PHASE_ERROR,
      message: `An error occurred while attempting to access the 'extension.store' when the Manager has not yet set upt the lifecycle methods.`,
    });

    return freeze(this.#extensionStore, { requireKeys: true });
  }

  /**
   * This store is can be modified by the extension manager with and lifecycle
   * extension methods.
   *
   * Different properties are added at different times so it's important to
   * check the documentation for each property to know what phase is being
   * added.
   */
  #extensionStore?: Remirror.ExtensionStore;

  /**
   * Private list of extension stored in within this preset.
   */
  #extensions: Array<this['~E']>;

  /**
   * An extension mapping of the extensions and their constructors.
   */
  #extensionMap: Map<this['~E']['constructor'], this['~E']>;

  constructor(...parameters: PresetConstructorParameter<Options>) {
    super(
      {
        validator: isValidPresetConstructor,
        defaultOptions: {},
        code: ErrorConstant.INVALID_PRESET,
      },
      ...parameters,
    );

    // Create the extension list.
    this.#extensions = uniqueBy(
      this.createExtensions(),
      // Ensure that all the provided extensions are unique.
      (extension) => extension.constructor,
    );

    this.#extensionMap = new Map<this['~E']['constructor'], this['~E']>();

    // Create the extension map for retrieving extensions from the `Preset`
    for (const extension of this.#extensions) {
      this.#extensionMap.set(extension.constructor, extension);
    }
  }

  /**
   * Check if the type of this extension's constructor matches the type of the
   * provided constructor.
   */
  isOfType<Type extends AnyPresetConstructor>(Constructor: Type): this is InstanceType<Type> {
    return this.constructor === (Constructor as unknown);
  }

  /**
   * Create the extensions which will be consumed by the preset.
   *
   * Since this method is called in the constructor it should always be created
   * as an instance method and not a property. Properties aren't available for
   * the call to the parent class.
   *
   * ```ts
   * class MyPreset extends Preset {
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
  abstract createExtensions(): AnyExtension[];

  /**
   * Called every time the options for this extension are set or reset. This is
   * also called when the extension is first created with the default
   * options.
   *
   * @remarks
   *
   * **Please Note**:
   *
   * This must be defined as a instance method and not a property since it is
   * called in the constructor.
   *
   * ```ts
   * class ThisPreset extends Preset {
   *   // GOOD ✅
   *   onSetOptions(parameter: OnSetOptionsParameter<{}>) {}
   *
   *    // BAD ❌
   *   onSetOptions = (parameter: OnSetOptionsParameter<{}>) => {}
   * }
   * ```
   */
  protected abstract onSetOptions(parameter: OnSetOptionsParameter<Options>): void;

  /**
   * When there are duplicate extensions used within the editor the extension
   * manager will call this method and make sure all presets are using the same
   * instance of the `ExtensionConstructor`.
   */
  replaceExtension(constructor: AnyExtensionConstructor, extension: this['~E']): void {
    if (this.#extensionMap.has(constructor)) {
      this.#extensionMap.set(constructor, extension);
    }
  }

  /**
   * Get an extension from the extension holder (either a preset or a manager)
   * that corresponds to the provided `Constructor`.
   *
   * @param Constructor - the extension constructor to find in the editor.
   *
   * @remarks
   *
   * This method will throw an error if the constructor doesn't exist.
   */
  getExtension<Type extends this['~E']['constructor']>(Constructor: Type): InstanceType<Type> {
    const extension = this.#extensionMap.get(Constructor);

    // Throws an error if attempting to get an extension which is not available
    // in this preset.
    invariant(extension, {
      code: ErrorConstant.INVALID_PRESET_EXTENSION,
      message: `'${Constructor.name}' does not exist within the preset: '${this.name}'`,
    });

    return extension as InstanceType<Type>;
  }

  /**
   * Pass a reference to the globally shared `ExtensionStore` for this extension.
   *
   * @remarks
   *
   * The extension store allows extensions to access important variables without
   * complicating their creator methods.
   *
   * ```ts
   * import { PlainExtension } from 'remirror/core';
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
  setExtensionStore(store: Remirror.ExtensionStore) {
    if (this.#extensionStore) {
      return;
    }

    this.#extensionStore = store;
  }

  /**
   * Clone a preset.
   */
  clone(...parameters: PresetConstructorParameter<Options>) {
    return new this.constructor(...parameters);
  }
}

export interface Preset<Options extends ValidOptions = EmptyShape> {
  /**
   * The typed constructor for the `Preset` instance.
   */
  constructor: PresetConstructor<Options>;

  /**
   * Not for usage. This is purely for types to make it easier to infer
   * the type of `Options` on an extension instance.
   */
  ['~S']: Options;

  /**
   * Not for usage. This is purely for types to make it easier to infer
   * the type of `Options` on an extension instance.
   */
  ['~P']: Options;

  /**
   * Not for usage. This is purely for types to make it easier to infer
   * available extension types.
   */
  ['~E']: ReturnType<this['createExtensions']>[number];
}

/**
 * The type which is applicable to any `Preset` instances.
 *
 * **NOTE** `& object` forces VSCode to use the name `AnyPreset` rather than
 * print out `Replace<Preset<Shape>, Remirror.AnyPresetOverrides>`
 */
export type AnyPreset = Replace<Preset<Shape>, Remirror.AnyPresetOverrides> & object;

/**
 * The type which is applicable to any `Preset` constructor.
 */
export type AnyPresetConstructor = Replace<
  PresetConstructor<any>,
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  { new (...args: any[]): AnyPreset }
>;

/**
 * The default preset options.
 *
 * - `StaticOptions` - It works by making all partial properties required and all required
 * properties partial.
 * - `DynamicOptions` - All properties must have a default value whether default
 *   or required
 * -  1
 */
export type DefaultPresetOptions<Options extends ValidOptions> = DefaultOptions<
  Options,
  EmptyShape
>;

/**
 * The preset constructor. This is used to annotate the Preset class since
 * TypeScript doesn't automatically provide a meaningful type for the
 * `constructor` property.
 */
export interface PresetConstructor<Options extends ValidOptions = EmptyShape>
  extends BaseClassConstructor {
  /**
   * The identifier for the constructor which identifies it as a preset
   * constructor.
   * @internal
   */
  readonly [__INTERNAL_REMIRROR_IDENTIFIER_KEY__]: RemirrorIdentifier;

  /**
   * Default options.
   */
  readonly defaultOptions: DefaultPresetOptions<Options>;

  new (...args: PresetConstructorParameter<Options>): Preset<Options>;
}

/**
 * Determines if the passed in value is a preset.
 *
 * @param value - the preset to check
 */
export function isPreset<Type extends AnyPreset = AnyPreset>(value: unknown): value is Type {
  return isRemirrorType(value) && isIdentifierOfType(value, RemirrorIdentifier.Preset);
}

/**
 * Determines if the passed in value is a preset constructor.
 *
 * @param value - the value to test
 */
export function isPresetConstructor<Type extends AnyPresetConstructor = AnyPresetConstructor>(
  value: unknown,
): value is Type {
  return isRemirrorType(value) && isIdentifierOfType(value, RemirrorIdentifier.PresetConstructor);
}

/**
 * Checks that the preset has a valid constructor with the `defaultOptions` and
 * `defaultOptions` defined as static properties.
 */
function isValidPresetConstructor(
  Constructor: unknown,
): asserts Constructor is AnyExtensionConstructor {
  const code = ErrorConstant.INVALID_PRESET;

  invariant(isPresetConstructor(Constructor), {
    message: 'This is not a valid extension constructor',
    code,
  });

  isValidConstructor(Constructor, code);
}

/**
 * Automatically infers whether the constructor parameter is required for the
 * Preset.
 *
 * - Required when any of the options are not optional.
 */
export type PresetConstructorParameter<Options extends ValidOptions> = ConstructorParameter<
  Options,
  EmptyShape
>;

declare global {
  namespace Remirror {
    /**
     * An override to for the `AnyPreset` type. If you're Preset adds a new
     * property to the `Preset` that is deeply nested or very complex it can
     * break the `AnyPreset` implementation from being compatible with all valid
     * Presets.
     *
     * The keys you provide on this override replace the default `AnyPreset`
     * types include unsafe properties that need to be simplified.
     *
     * An example is the `constructor` property which makes it impossible to
     * find a common interface between presets with different options and
     * properties. By setting the `constructor` to a much simpler override all
     * `Preset`'s are now assignable to the `AnyPreset type again.`
     */
    interface AnyPresetOverrides extends AnyBaseClassOverrides {
      constructor: AnyPresetConstructor;
    }
  }
}
