import {
  ExtensionType,
  REMIRROR_IDENTIFIER_KEY,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import { Cast, freeze } from '@remirror/core-helpers';
import {
  BaseExtensionConfig,
  ExtensionCommandReturn,
  IfNoRequiredProperties,
} from '@remirror/core-types';

import {
  Extension,
  ExtensionCreatorOptions,
  MarkExtension,
  MarkExtensionConstructor,
  MarkExtensionCreatorOptions,
  NodeExtension,
  NodeExtensionConstructor,
  NodeExtensionCreatorOptions,
  PlainExtensionConstructor,
} from './extension';

/**
 * This function returns the base extension creator methods. It is exposed as a
 * function to allow for fully typed `ExtensionConstructor`s.
 */
const createBaseExtensionCreator = <
  Config extends BaseExtensionConfig = BaseExtensionConfig,
  Props extends object = {}
>() => ({
  /**
   * Creates a `PlainExtensionConstructor`. This is useful for non content
   * specific functionality like adding styling or plugins.
   */
  plain<Name extends string, Commands extends ExtensionCommandReturn>(
    creatorOptions: ExtensionCreatorOptions<Name, Config, Props, Commands>,
  ): PlainExtensionConstructor<Name, Config, Props, Commands> {
    const options = freeze(creatorOptions);

    class PlainConstructor extends Extension<Name, Config, Props, Commands> {
      /**
       * Identifies this as a `PlainExtensionConstructor`.
       *
       * @internal
       */
      static get [REMIRROR_IDENTIFIER_KEY]() {
        return RemirrorIdentifier.PlainExtensionConstructor;
      }

      /**
       * This static method is the only way to create an instance of this
       * extension.
       *
       * @remarks
       *
       * It helps prevent uses from struggling with some of the edge cases when
       * using the `new` keyword.
       */
      public static of(...config: IfNoRequiredProperties<Config, [Config?], [Config]>) {
        return new PlainConstructor(...config);
      }

      /**
       * The name of the extension.
       */
      static get extensionName() {
        return options.name;
      }

      /**
       * Set this extension to be a plain type.
       */
      get type() {
        return ExtensionType.Plain;
      }

      /**
       * This makes the constructor private so that it can't be extended from
       * when using Typescript.
       */
      private constructor(...config: IfNoRequiredProperties<Config, [Config?], [Config]>) {
        super(...config);
      }

      public getCreatorOptions() {
        return options;
      }
    }

    return PlainConstructor;
  },

  /**
   * Creates a `MarkExtensionConstructor`. This is useful for non content
   * specific functionality like adding styling or plugins.
   */
  mark<Name extends string, Commands extends ExtensionCommandReturn>(
    creatorOptions: MarkExtensionCreatorOptions<Name, Config, Props, Commands>,
  ): MarkExtensionConstructor<Name, Config, Props, Commands> {
    const options = freeze(creatorOptions);

    class MarkConstructor extends MarkExtension<Name, Config, Props, Commands> {
      /**
       * Identifies this as a `MarkExtensionConstructor`.
       *
       * @internal
       */
      static get [REMIRROR_IDENTIFIER_KEY]() {
        return RemirrorIdentifier.MarkExtensionConstructor;
      }

      /**
       * This static method is the only way to create an instance of this
       * extension.
       *
       * @remarks
       *
       * It helps prevent uses from struggling with some of the edge cases when
       * using the `new` keyword.
       */
      public static of(...config: IfNoRequiredProperties<Config, [Config?], [Config]>) {
        return new MarkConstructor(...config);
      }

      /**
       * The name of the extension.
       */
      static get extensionName() {
        return options.name;
      }

      /**
       * This makes the constructor private so that it can't be extended from
       * when using Typescript.
       */
      private constructor(...config: IfNoRequiredProperties<Config, [Config?], [Config]>) {
        super(...config);
      }

      public getCreatorOptions() {
        return Cast(options); // Cast cos I can.
      }

      public getMarkCreatorOptions() {
        return options;
      }
    }

    return MarkConstructor;
  },

  /**
   * Creates a `NodeExtensionConstructor`. This is useful for non content
   * specific functionality like adding styling or plugins.
   */
  node<Name extends string, Commands extends ExtensionCommandReturn>(
    creatorOptions: NodeExtensionCreatorOptions<Name, Config, Props, Commands>,
  ): NodeExtensionConstructor<Name, Config, Props, Commands> {
    const options = freeze(creatorOptions);

    class NodeConstructor extends NodeExtension<Name, Config, Props, Commands> {
      /**
       * Identifies this as a `NodeExtensionConstructor`.
       *
       * @internal
       */
      static get [REMIRROR_IDENTIFIER_KEY]() {
        return RemirrorIdentifier.NodeExtensionConstructor;
      }

      /**
       * This static method is the only way to create an instance of this
       * extension.
       *
       * @remarks
       *
       * It helps prevent uses from struggling with some of the edge cases when
       * using the `new` keyword.
       */
      public static of(...config: IfNoRequiredProperties<Config, [Config?], [Config]>) {
        return new NodeConstructor(...config);
      }

      /**
       * The name of the extension.
       */
      static get extensionName() {
        return options.name;
      }

      /**
       * This makes the constructor private so that it can't be extended from
       * when using Typescript.
       */
      private constructor(...config: IfNoRequiredProperties<Config, [Config?], [Config]>) {
        super(...config);
      }

      public getCreatorOptions() {
        return Cast(options); // Cast cos I can.
      }

      public getNodeCreatorOptions() {
        return options;
      }
    }

    return NodeConstructor;
  },
});

/**
 * The only way to create extensions using remirror.
 *
 * @remarks
 *
 * The created extensions are instantiated and placed into the editor to provide
 * different kinds of functionality.
 */
export const ExtensionCreator = {
  ...createBaseExtensionCreator(),

  /**
   * Set the `Config` and `Props` for the created extension.
   *
   * @remarks
   *
   * This might seem like an odd pattern but it's the only way I can think of to
   * preserve type inference for the config and props without having to manually
   * type out all the generic types. If you don't want to add any configuration
   * or dynamic props you can use the other methods exposed by this
   * configuration.
   *
   * ```ts
   * import { ExtensionCreator, BaseExtensionConfig } from '@remirror/core';
   *
   * interface MyExtensionConfig extends BaseExtensionConfig {
   *   custom: boolean;
   * }
   *
   * interface MyExtensionProps {
   *   onChange: (times: number) => void;
   * }
   *
   * const MyExtension = ExtensionCreator
   *   .typed<MyExtensionConfig, MyExtensionProps>()
   *   .plain({
   *     name: 'mine',
   *     defaultProps: {
   *       onChange: () => {}, // Do nothing
   *     },
   *   });
   * ```
   */
  typed<Config extends BaseExtensionConfig, Props extends object>() {
    return createBaseExtensionCreator<Config, Props>();
  },
};
