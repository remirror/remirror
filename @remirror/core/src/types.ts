import { Attributes } from 'react';

import { ExtensionPriority, ExtensionTag, MarkGroup, NodeGroup } from '@remirror/core-constants';
import {
  AnyConstructor,
  AnyFunction,
  AttributesParameter,
  CommandFunction,
  EditorSchema,
  EditorState,
  EditorStateParameter,
  TransactionParameter,
} from '@remirror/core-types';

/**
 * This is the shape for both the preset and extension so that properties can be
 * set with an identical interface.
 *
 * @typeParam Properties - The properties used by the object.
 */
export interface PropertiesShape<Properties extends object>
  extends ReadonlyPropertiesParameter<Properties> {
  /**
   * Reset the properties object to the default values.
   */
  resetProperties: () => void;

  /**
   * Set the properties to the newly defined values.
   */
  setProperties: (properties: Partial<Properties>) => void;
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
export type ChangedProperties<Properties extends object> = {
  [Key in keyof Properties]: Changes<Properties[Key]>;
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
export type GetSettings<Type extends { ['~S']: unknown }> = Type['~S'];

/**
 * Get the dynamic extension properties.
 */
export type GetProperties<Type extends { ['~P']: unknown }> = Type['~P'];

/**
 * Get the schema from an `EditorManager`.
 */
export type GetSchema<Type extends { ['~Sch']: unknown }> = Type['~Sch'];

/**
 * Get the commands from an `EditorManager`, `Extension` or `Preset`.
 */
export type GetCommands<Type extends { ['~C']: unknown }> = Type['~C'];

/**
 * Get the Extensions from an `EditorManager`, or `Preset`.
 */
export type GetExtensions<Type extends { ['~E']: unknown }> = Type['~E'];

/**
 * Get the helpers provided by an from an `EditorManager`, `Extension` or
 * `Preset`.
 */
export type GetHelpers<Type extends { ['~H']: unknown }> = Type['~H'];

/**
 * Get the name of an extension.
 */
export type GetNameUnion<Type extends { name: string }> = Type['name'];

/**
 * Get the constructor of an instance.
 */
export type GetConstructor<Type extends { constructor: unknown }> = Type['constructor'];

/**
 * Get the settings from any constructor. Can be used for both presets and
 * extensions.
 */
export type SettingsOfConstructor<Constructor extends AnyConstructor> = GetSettings<
  InstanceType<Constructor>
>;

/**
 * Get the properties from any constructor. Can be used for both presets and
 * extensions.
 */
export type PropertiesOfConstructor<Constructor extends AnyConstructor> = GetProperties<
  InstanceType<Constructor>
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
  isEnabled: (attrs?: Attributes) => boolean;

  (...args: Parameter): void;
}

export interface TransactionLifecycleParameter extends TransactionParameter, EditorStateParameter {
  /**
   * The previous state.
   */
  previousState: EditorState;
}
export type TransactionLifecycleMethod = (parameter: TransactionLifecycleParameter) => void;

export interface BaseExtensionSettings extends Remirror.BaseExtensionSettings {
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

export interface ReadonlySettingsParameter<Settings extends object> {
  /**
   * The static config that was passed into the extension that created this node
   * or mark.
   */
  readonly settings: Required<Readonly<Settings>>;
}

export interface ReadonlyPropertiesParameter<Properties extends object> {
  /**
   * The current value of the dynamic properties.
   */
  readonly properties: Required<Readonly<Properties>>;
}

export interface PartialProperties<Properties extends object> {
  /**
   * The current value of the dynamic properties.
   */
  properties?: Partial<Properties>;
}

/**
 * @internal
 */
export type PropertiesUpdateReason = 'init' | 'set' | 'reset';

export interface PropertiesUpdateReasonParameter {
  /**
   * Describes what triggered an update.
   *
   * - `set` - the change was triggered by an update in some properties
   * - `reset` - the user has specifically requested to reset all properties to
   *   their initial defaults
   * - `init` - the update is happening when the preset is being It will receive
   *   all the items as changes.
   */
  reason: PropertiesUpdateReason;
}

export interface DefaultPropertiesParameter<Properties extends object> {
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
    interface BaseExtensionSettings {}

    /**
     * Parameters passed into many of the extension methods. These can be added
     * to by the parameter methods.
     */
    interface ExtensionStore<Schema extends EditorSchema> {
      /**
       * A helper method for retrieving the state of the editor
       */
      getState: () => EditorState<Schema>;
    }
  }
}
