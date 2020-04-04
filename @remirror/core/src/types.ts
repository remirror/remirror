import { Attributes, ComponentType } from 'react';

import { ExtensionPriority, MarkGroup, NodeGroup, Tag } from '@remirror/core-constants';
import {
  AnyFunction,
  AttributesParameter,
  CreateExtraAttributes,
  EditorSchema,
  EditorState,
  EditorStateParameter,
  EditorViewParameter,
  ExtraAttributes,
  GetExtraAttributes,
  MarkType,
  NodeType,
  NodeWithAttributesParameter,
  ProsemirrorAttributes,
  ProsemirrorCommandFunction,
  TransactionParameter,
} from '@remirror/core-types';

/**
 * This is the shape for both the preset and extension so that properties can be
 * set with an identical interface.
 *
 * @typeParam Properties - The properties used by the object.
 */
interface PropertiesShape<Properties extends object> {
  /**
   * A properties object with all value required.
   */
  readonly properties: Required<Properties>;

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
      previous: Type;

      /**
       * The new value after the change. This is only accessible when
       * `changed` is `true`.
       */
      next: Type;
    };

/**
 * Highlights all the properties that have changed.
 */
type ChangedProperties<Properties extends object> = {
  [Key in keyof Properties]: Changes<Properties[Key]>;
};

/**
 * The tag names that apply to any extension whether plain, node or mark. These
 * are mostly used for nodes and marks the main difference is they are added to
 * the `tags` parameter of the extension rather than within the schema.
 */
type GeneralExtensionTags<Names extends string = string> = Record<Tag, Names[]> &
  Record<string, undefined | Names[]>;

/**
 * Provides the different mark groups which are defined in the mark extension
 * specification.
 */
type MarkExtensionTags<MarkNames extends string = string> = Record<MarkGroup, MarkNames[]> &
  Record<string, undefined | MarkNames[]>;

/**
 * Provides an object of the different node groups `block` and `inline` which
 * are defined in the node extension specification.
 */
type NodeExtensionTags<NodeNames extends string = string> = Record<NodeGroup, NodeNames[]> &
  Record<string, undefined | NodeNames[]>;

/**
 * Get the static extension settings.
 */
type GetSettings<
  Type extends {
    settings: unknown;
  }
> = Type['settings'];

/**
 * Get the dynamic extension properties.
 */
type GetProperties<
  Type extends {
    properties: unknown;
  }
> = Type['properties'];

/**
 * Get the commands provided by an extension.
 */
type GetCommands<Type extends { ['~C']: unknown }> = Type['~C'];

/**
 * Get the helpers provided by an extension.
 */
type GetHelpers<Type extends { ['~H']: unknown }> = Type['~H'];

/**
 * Get the name of an extension.
 */
type GetNameUnion<Type extends { name: string }> = Type['name'];

/**
 * Get the constructor of an extension.
 */
type GetConstructor<Type extends { constructor: unknown }> = Type['constructor'];

interface ManagerSettings {
  /**
   * An object which excludes certain functionality from all extensions within
   * the manager.
   */
  exclude?: ExcludeOptions;
}

/**
 * Parameters passed into many of the extension methods.
 */
interface ManagerParameter<Schema extends EditorSchema = EditorSchema>
  extends Remirror.ExtensionTagParameter {
  /**
   * The Prosemirror schema being used for the current interface
   */
  schema: Schema;

  /**
   * A helper method for retrieving the state of the editor
   */
  getState: () => EditorState<Schema>;

  /**
   * A method that returns an object with all the commands available to be run.
   *
   * @remarks
   *
   * Commands are instantly run and also have an `isEnabled()` method attached
   * to them for checking if the command would day anything if run.
   *
   * This should only be called when the view has been initialized (i.e.) within
   * the `createCommands` method calls.
   *
   * ```ts
   * import { ExtensionFactory } from '@remirror/core';
   *
   * const MyExtension = ExtensionFactory.plain({
   *   name: 'myExtension',
   *   version: '1.0.0',
   *   createCommands: ({ commands }) => {
   *     // This will throw since it can only be called within the returned methods.
   *     const c = commands();
   *
   *     return {
   *       // This is good 😋
   *       haveFun() => commands().insertText('fun!');
   *     }
   *   }
   * })
   * ```
   */
  commands: () => any;

  /**
   * Chainable commands for composing functionality together in quaint and
   * beautiful way..
   *
   * @remarks
   *
   * This should only be called when the view has been initialized (i.e.) within
   * the `createCommands` method calls.
   *
   * ```ts
   * import { ExtensionFactory } from '@remirror/core';
   *
   * const MyExtension = ExtensionFactory.plain({
   *   name: 'myExtension',
   *   version: '1.0.0',
   *   createCommands: ({ chain }) => {
   *     // This will throw since it can only be called within the returned methods.
   *     const c = chain();
   *
   *     return {
   *       // This is good 😋
   *       haveFun() => chain().insertText('fun!').changeSelection('end').insertText('hello');
   *     }
   *   }
   * })
   * ```
   */
  chain: () => any;

  /**
   * Helper method to provide information about the content of the editor. Each
   * extension can register its own helpers.
   */
  helpers: () => any;
}

/**
 * Parameters passed into many of the extension methods with a view added.
 *
 * Inherits from
 * - {@link EditorViewParameter}
 * - {@link ManagerParameter}
 *
 * @typeParam Schema - the underlying editor schema.
 */
interface ViewManagerParameter<Schema extends EditorSchema = any>
  extends EditorViewParameter<Schema>,
    ManagerParameter<Schema> {}

type ExtensionCommandFunction = (...args: any[]) => ProsemirrorCommandFunction;

type ExtensionIsActiveFunction = (params: Partial<AttributesParameter>) => boolean;

/**
 * The return signature for an extensions command method.
 */
interface ExtensionCommandReturn {
  [command: string]: ExtensionCommandFunction;
}

/**
 * The return signature for an extensions helper method.
 */
interface ExtensionHelperReturn {
  [helper: string]: AnyFunction;
}

/**
 * Generic extension manager type params for methods which require a prosemirror
 * NodeType.
 *
 * This is used to generate the specific types for Marks and Nodes.
 */
interface ManagerTypeParameter<ProsemirrorType, Schema extends EditorSchema = EditorSchema>
  extends ManagerParameter<Schema> {
  type: ProsemirrorType;
}

/**
 * The extension manager type params for a prosemirror `NodeType` extension
 */
interface ManagerNodeTypeParameter extends ManagerTypeParameter<NodeType<EditorSchema>> {}

/**
 * The extension manager type params for a prosemirror `NodeType` extension
 */
interface ManagerMarkTypeParameter extends ManagerTypeParameter<MarkType<EditorSchema>> {}

interface CommandParameter extends ViewManagerParameter<EditorSchema> {
  /**
   * Returns true when the editor can be edited and false when it cannot.
   *
   * This is useful for deciding whether or not to run a command especially if
   * the command is resource intensive or slow.
   */
  isEditable: () => boolean;
}

/**
 * The parameter passed to the commands method.
 */
interface CreateCommandsParameter<ProsemirrorType> extends CommandParameter {
  type: ProsemirrorType;
}

/**
 * The parameter passed to the helper methods.
 */
interface CreateHelpersParameter<ProsemirrorType> extends ViewManagerParameter<EditorSchema> {
  type: ProsemirrorType;
}

interface CommandMethod<Parameter extends any[] = []> {
  (...args: Parameter): void;

  /**
   * Returns true when the command can be run and false when it can't be run.
   *
   * @remarks
   * Some commands can have rules and restrictions. For example you may want to
   * disable styling making text bold when within a codeBlock. In that case
   * isEnabled would be false when within the codeBlock and true when outside.
   *
   * @param attrs - certain commands require attrs to run
   */
  isEnabled(attrs?: Attributes): boolean;
}

/**
 * The type signature for all actions.
 */
interface AnyCommands {
  [action: string]: CommandMethod<any>;
}

/**
 * The type signature for all helpers.
 */
interface AnyHelpers {
  [helper: string]: AnyFunction;
}

/**
 * The interface for SSR Component Props
 */
interface SSRComponentProps<
  Settings extends object = {},
  Attributes extends ProsemirrorAttributes = ProsemirrorAttributes
> extends NodeWithAttributesParameter<Attributes>, BaseExtensionSettingsParameter<Settings> {}

/**
 * The params object received by the onTransaction handler.
 */
interface OnTransactionParameter
  extends ViewManagerParameter,
    TransactionParameter,
    EditorStateParameter {}

interface BaseExtensionSettings extends Remirror.ExtensionSettings {
  /**
   * Inject additional attributes into the defined mark / node schema. This can
   * only be used for `NodeExtensions` and `MarkExtensions`.
   *
   * @remarks
   *
   * Sometimes you need to add additional attributes to a node or mark. This
   * property enables this without needing to create a new extension.
   *
   * - `extraAttributes: ['title']` Create an attribute with name `title`.When
   *   parsing the dom it will look for the attribute `title`
   * - `extraAttributes: [['custom', 'false', 'data-custom'],'title']` - Creates an
   *   attribute with name `custom` and default value `false`. When parsing the
   *   dom it will look for the attribute `data-custom`
   *
   * @defaultValue `[]`
   */
  extraAttributes?: ExtraAttributes[];

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

interface ExcludeOptions extends Partial<Remirror.ExcludeOptions> {
  /**
   * Whether to exclude the extension's pasteRules
   *
   * @defaultValue `false`
   */
  pasteRules?: boolean;

  /**
   * Whether to exclude the extension's inputRules
   *
   * @defaultValue `false`
   */
  inputRules?: boolean;

  /**
   * Whether to exclude the extension's keymaps
   *
   * @defaultValue `false`
   */
  keys?: boolean;

  /**
   * Whether to exclude the extension's nodeView
   *
   * @defaultValue `false`
   */
  nodeView?: boolean;

  /**
   * Whether to use the attributes provided by this extension
   *
   * @defaultValue `false`
   */
  attributes?: boolean;

  /**
   * Whether to exclude the suggestions plugin configuration for the extension.
   *
   * @defaultValue `false`
   */
  suggesters?: boolean;
}

interface SSRComponentParameter {
  /**
   * The component to render in SSR. The attrs are passed as props.
   *
   * @remarks
   *
   * Each node/mark extension can define it's own particular default component.
   *
   * This can only be consumed by Node and Mark extensions.
   */
  SSRComponent?: ComponentType<any> | null;
}

interface BaseExtensionSettingsParameter<Settings extends object = {}> {
  /**
   * The static config that was passed into the extension that created this node
   * or mark.
   */
  settings: Settings;
}

/**
 * The parameters passed to the `createSchema` method for node and mark
 * extensions.
 */
interface CreateSchemaParameter<Settings extends object> {
  /**
   * All the static settings that have been passed into the extension when
   * being created (instantiated).
   */
  settings: Readonly<Settings>;

  /**
   * A method that creates the `AttributeSpec` for prosemirror that can be added
   * to a node or mark extension to provide extra functionality and store more
   * information within the DOM and prosemirror state..
   *
   * @remarks
   *
   * ```ts
   * const schema = {
   *   attrs: {
   *      ...createExtraAttributes({ fallback: null }),
   *      href: {
   *       default: null,
   *     },
   *   },
   * }
   */
  createExtraAttributes: CreateExtraAttributes;

  /**
   * Pull all extra attrs from the dom node provided.
   */
  getExtraAttributes: GetExtraAttributes;
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
    interface ExtensionSettings {}
  }
}

export type {
  AnyCommands,
  AnyHelpers,
  BaseExtensionSettings,
  BaseExtensionSettingsParameter,
  ChangedProperties,
  CommandMethod,
  CommandParameter,
  CreateCommandsParameter,
  CreateHelpersParameter,
  CreateSchemaParameter,
  ExcludeOptions,
  ExtensionCommandFunction,
  ExtensionCommandReturn,
  ExtensionHelperReturn,
  ExtensionIsActiveFunction,
  GeneralExtensionTags,
  GetCommands,
  GetConstructor,
  GetHelpers,
  GetNameUnion,
  GetProperties,
  GetSettings,
  ManagerMarkTypeParameter,
  ManagerNodeTypeParameter,
  ManagerParameter,
  ManagerSettings,
  ManagerTypeParameter,
  MarkExtensionTags,
  NodeExtensionTags,
  OnTransactionParameter,
  PropertiesShape,
  SSRComponentParameter,
  SSRComponentProps,
  ViewManagerParameter,
};
