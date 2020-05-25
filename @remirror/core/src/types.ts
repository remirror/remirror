import { ExtensionPriority, ExtensionTag, MarkGroup, NodeGroup } from '@remirror/core-constants';
import {
  AnyConstructor,
  AnyFunction,
  CommandFunction,
  EditorSchema,
  EditorState,
  EditorStateParameter,
  GetDynamic,
  GetFixed,
  GetFixedDynamic,
  GetPartialDynamic,
  ProsemirrorAttributes,
  TransactionParameter,
  ValidOptions,
} from '@remirror/core-types';

/**
 * This is the shape for both the preset and extension so that properties can be
 * set with an identical interface.
 *
 * @typeParam Properties - The properties used by the object.
 */
export interface OptionsSetter<Options extends ValidOptions>
  extends ReadonlyOptionsParameter<Options> {
  /**
   * Reset the options object to the initial values.
   */
  resetOptions: () => void;

  /**
   * Set the properties to the newly defined values.
   */
  setOptions: (properties: GetPartialDynamic<Options>) => void;
}

type Changes<Type> =
  | {
      /**
       * Whether or not the value has changed.
       *
       * - `false` when no change occurred.
       */
      changed: false;
    }
  | {
      /**
       * - `true` when a change occurred.
       */
      changed: true;
      /**
       * The previous value before the changed. This is only accessible when
       * `changed` is `true`.
       */
      previousValue: Type;

      /**
       * The latest value after the change. This is only accessible when
       * `changed` is `true`.
       */
      value: Type;
    };

/**
 * Highlights all the properties that have changed.
 */
export type ChangedOptions<Options extends ValidOptions> = {
  [Key in keyof GetDynamic<Options>]: Changes<GetDynamic<Options>[Key]>;
};

/**
 * The tag names that apply to any extension whether plain, node or mark. These
 * are mostly used for nodes and marks the main difference is they are added to
 * the `tags` parameter of the extension rather than within the schema.
 */
export type GeneralExtensionTags<Names extends string = string> = Record<ExtensionTag, Names[]> &
  Record<string, undefined | Names[]>;

/**
 * Provides the different mark groups which are defined in the mark extension
 * specification.
 */
export type MarkExtensionTags<MarkNames extends string = string> = Record<MarkGroup, MarkNames[]> &
  Record<string, undefined | MarkNames[]>;

/**
 * Provides an object of the different node groups `block` and `inline` which
 * are defined in the node extension specification.
 */
export type NodeExtensionTags<NodeNames extends string = string> = Record<NodeGroup, NodeNames[]> &
  Record<string, undefined | NodeNames[]>;

/**
 * Get the static extension settings.
 */
export type GetOptions<
  Type extends { [Remirror._OPTIONS]: unknown }
> = Type[typeof Remirror._OPTIONS];

/**
 * Get the schema from an `EditorManager`.
 */
export type GetSchema<Type extends { ['~Sch']: unknown }> = Type['~Sch'];

/**
 * Get the commands from an `EditorManager`, `Extension` or `Preset`.
 */
export type GetCommands<
  Type extends { [Remirror._COMMANDS]: unknown }
> = Type[typeof Remirror._COMMANDS];

/**
 * Get the Extensions from an `EditorManager`, or `Preset`.
 */
export type GetExtensions<Type extends { ['~E']: unknown }> = Type['~E'];

/**
 * Get the helpers provided by an from an `EditorManager`, `Extension` or
 * `Preset`.
 */
export type GetHelpers<
  Type extends { [Remirror._HELPERS]: unknown }
> = Type[typeof Remirror._HELPERS];

/**
 * Get the name of an extension.
 */
export type GetNameUnion<Type extends { name: string }> = Type['name'];

/**
 * Get the constructor of an instance.
 */
export type GetConstructor<Type extends { constructor: unknown }> = Type['constructor'];

/**
 * Get the options from any constructor. Can be used for both presets and
 * extensions.
 */
export type OptionsOfConstructor<Constructor extends AnyConstructor> = GetOptions<
  InstanceType<Constructor>
>;

/**
 * Get the options from any constructor. Can be used for both presets and
 * extensions.
 */
export type DynamicOptionsOfConstructor<Constructor extends AnyConstructor> = GetPartialDynamic<
  GetOptions<InstanceType<Constructor>>
>;

/**
 * The extension store which is shared across all extensions. It provides access
 * to methods and data that can be used throughout the extension lifecycle.
 */
export interface ExtensionStore<Schema extends EditorSchema = EditorSchema>
  extends Remirror.ExtensionStore<Schema> {}

export type ExtensionCommandFunction = (...args: any[]) => CommandFunction<EditorSchema>;

/**
 * The return signature for an extensions command method.
 */
export interface ExtensionCommandReturn {
  [command: string]: ExtensionCommandFunction;
}

/**
 * The return signature for an extensions helper method.
 */
export interface ExtensionHelperReturn {
  [helper: string]: AnyFunction;
}

/**
 * The type of a non chainable command. It is a function with an `isEnabled`
 * method to check whether the command can be run.
 */
export interface CommandShape<Parameter extends any[] = []> {
  /**
   * Returns true when the command can be run and false when it can't be run. It
   * basically runs the command without dispatching it to see whether it returns
   * true or false.
   *
   * @remarks
   *
   * Some commands can have rules and restrictions. For example you may want to
   * disable styling making text bold when within a codeBlock. In that case
   * isEnabled would be false when within the codeBlock and true when outside.
   *
   * @param attrs - certain commands require attrs to run
   */
  isEnabled: (attrs?: ProsemirrorAttributes) => boolean;

  (...args: Parameter): void;
}

export interface TransactionLifecycleParameter extends TransactionParameter, EditorStateParameter {
  /**
   * The previous state.
   */
  previousState: EditorState;
}
export type TransactionLifecycleMethod = (parameter: TransactionLifecycleParameter) => void;

export interface BaseExtensionOptions extends Remirror.BaseExtensionOptions {
  /**
   * An object which excludes certain functionality from an extension.
   */
  exclude?: ExcludeOptions;

  /**
   * The priority with which this extension should be loaded by the manager.
   *
   * @remarks
   *
   * Each priority level corresponds to a higher level of importance for the
   * extension within the editor.
   *
   * When this is set to `null` the `defaultPriority` level for the extension
   * will be used instead.
   */
  priority?: ExtensionPriority | null;
}

export interface ExcludeOptions extends Partial<Remirror.ExcludeOptions> {}

interface ReadonlyOptionsParameter<Options extends ValidOptions> {
  /**
   * The readonly value for the options.
   */
  readonly options: GetFixed<Options>;
}

/**
 * @internal
 */
export type UpdateReason = 'init' | 'set' | 'reset';

export interface UpdateReasonParameter {
  /**
   * Describes what triggered an update.
   *
   * - `set` - the change was triggered by an update in some properties
   * - `reset` - the user has specifically requested to reset all properties to
   *   their initial defaults
   * - `init` - the update is happening when the preset is being It will receive
   *   all the items as changes.
   */
  reason: UpdateReason;
}

export interface GetChangeOptionsReturn<Options extends ValidOptions> {
  /**
   * The next value of the properties after the update.This also includes values
   * which have not been changed.
   */
  options: GetFixedDynamic<Options>;

  /**
   * An object with all the keys showing what's been changed. This should be
   * used to determine the children extensions which should be updated.
   *
   * @remarks
   *
   * Using this can prevent unnecessary updates. It's possible for new
   * properties to be passed that are identical to the previous, by checking if
   * the object was changed this can be avoided.
   *
   * This uses a discriminated union. When the `changed` property is true then
   * the object has a value as well.
   *
   * ```ts
   * if (changes.myProperty.changed) {
   *   doSomething(changes.myProperty.value);
   * }
   * ```
   */
  changes: Readonly<Required<ChangedOptions<Options>>>;

  /**
   * Pick the changed values by their key. An object populated with only the
   * changed items will be returned to you.
   */
  pickChanged: PickChanged<Options>;
}

export type PickChanged<Options> = <Key extends keyof GetFixedDynamic<Options>>(
  keys: Key[],
) => Partial<Pick<GetFixedDynamic<Options>, Key>>;

export interface OnSetOptionsParameter<Options extends ValidOptions>
  extends Pick<GetChangeOptionsReturn<Options>, 'changes' | 'pickChanged'>,
    UpdateReasonParameter {
  /**
   * The initial options for the extension. Falls back to default options.
   */
  initialOptions: GetFixedDynamic<Options>;

  /**
   * The next value of the properties after the update.This also includes values
   * which have not been changed.
   */
  options: GetFixedDynamic<Options>;
}

declare global {
  namespace Remirror {
    /**
     * A global type which allows setting additional options on the exclude.
     */
    interface ExcludeOptions {}

    /**
     * A global type which allows additional default settings to be added to the
     * editor.
     */
    interface BaseExtensionOptions {}
  }
}
