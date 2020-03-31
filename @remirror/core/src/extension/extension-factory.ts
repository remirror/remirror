import {
  ExtensionType,
  REMIRROR_IDENTIFIER_KEY,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import { Cast, freeze, isRemirrorType } from '@remirror/core-helpers';
import {
  BaseExtensionSettings,
  ExtensionCommandReturn,
  ExtensionHelperReturn,
  IfNoRequiredProperties,
} from '@remirror/core-types';

import {
  AnyExtensionConstructor,
  Extension,
  ExtensionFactoryParameter,
  MarkExtension,
  MarkExtensionConstructor,
  MarkExtensionFactoryParameter,
  NodeExtension,
  NodeExtensionConstructor,
  NodeExtensionFactoryParameter,
  PlainExtensionConstructor,
} from './extension-base';

/**
 * This function returns the base extension creator methods. It is exposed as a
 * function to allow for fully typed `ExtensionConstructor`s.
 */
const createBaseExtensionFactory = <
  Settings extends BaseExtensionSettings = BaseExtensionSettings,
  Properties extends object = {}
>() => {
  const creators = {
    /**
     * Creates a `PlainExtensionConstructor`. This is useful for non content
     * specific functionality like adding styling or plugins.
     */
    plain<
      Name extends string,
      Commands extends ExtensionCommandReturn,
      Helpers extends ExtensionHelperReturn
    >(
      factoryParameter: ExtensionFactoryParameter<Name, Settings, Properties, Commands, Helpers>,
    ): PlainExtensionConstructor<Name, Settings, Properties, Commands, Helpers> {
      const parameter = freeze(factoryParameter);

      class PlainConstructor extends Extension<Name, Settings, Properties, Commands, Helpers> {
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
        public static of(...arguments_: IfNoRequiredProperties<Settings, [Settings?], [Settings]>) {
          return new PlainConstructor(...arguments_);
        }

        /**
         * The name of the extension.
         */
        static get extensionName() {
          return parameter.name;
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
        private constructor(...config: IfNoRequiredProperties<Settings, [Settings?], [Settings]>) {
          super(...config);
        }

        public getFactoryParameter() {
          // Not sure why I have to cast to `never` here.
          return Cast<never>(parameter);
        }
      }

      return PlainConstructor;
    },

    /**
     * Creates a `MarkExtensionConstructor`. This is useful for non content
     * specific functionality like adding styling or plugins.
     */
    mark<
      Name extends string,
      Commands extends ExtensionCommandReturn,
      Helpers extends ExtensionHelperReturn
    >(
      factoryParameter: MarkExtensionFactoryParameter<
        Name,
        Settings,
        Properties,
        Commands,
        Helpers
      >,
    ): MarkExtensionConstructor<Name, Settings, Properties, Commands, Helpers> {
      const parameter = freeze(factoryParameter);

      class MarkConstructor extends MarkExtension<Name, Settings, Properties, Commands, Helpers> {
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
        public static of(...arguments_: IfNoRequiredProperties<Settings, [Settings?], [Settings]>) {
          return new MarkConstructor(...arguments_);
        }

        /**
         * The name of the extension.
         */
        static get extensionName() {
          return parameter.name;
        }

        /**
         * This makes the constructor private so that it can't be extended from
         * when using Typescript.
         */
        private constructor(...config: IfNoRequiredProperties<Settings, [Settings?], [Settings]>) {
          super(...config);
        }

        public getFactoryParameter() {
          return parameter; // Cast cos I can.
        }
      }

      return MarkConstructor;
    },

    /**
     * Creates a `NodeExtensionConstructor`. This is useful for non content
     * specific functionality like adding styling or plugins.
     */
    node<
      Name extends string,
      Commands extends ExtensionCommandReturn,
      Helpers extends ExtensionHelperReturn
    >(
      factoryParameter: NodeExtensionFactoryParameter<
        Name,
        Settings,
        Properties,
        Commands,
        Helpers
      >,
    ): NodeExtensionConstructor<Name, Settings, Properties, Commands, Helpers> {
      const parameter = freeze(factoryParameter);

      class NodeConstructor extends NodeExtension<Name, Settings, Properties, Commands, Helpers> {
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
        public static of(...arguments_: IfNoRequiredProperties<Settings, [Settings?], [Settings]>) {
          return new NodeConstructor(...arguments_);
        }

        /**
         * The name of the extension.
         */
        static get extensionName() {
          return parameter.name;
        }

        /**
         * This makes the constructor private so that it can't be extended from
         * when using Typescript.
         */
        private constructor(...config: IfNoRequiredProperties<Settings, [Settings?], [Settings]>) {
          super(...config);
        }

        public getFactoryParameter() {
          return parameter;
        }
      }

      return NodeConstructor;
    },
  };

  return creators;
};

/**
 * The only way to create extensions using remirror.
 *
 * @remarks
 *
 * The created extensions are instantiated and placed into the editor to provide
 * different kinds of functionality.
 */
export const ExtensionFactory = {
  ...createBaseExtensionFactory(),

  /**
   * Set the `Settings` and `Props` for the created extension.
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
   * import { ExtensionFactory, BaseExtensionSettings } from '@remirror/core';
   *
   * interface MyExtensionSettings extends BaseExtensionSettings {
   *   custom: boolean;
   * }
   *
   * interface MyExtensionProps {
   *   onChange: (times: number) => void;
   * }
   *
   * const MyExtension = ExtensionFactory
   *   .typed<MyExtensionSettings, MyExtensionProps>()
   *   .plain({
   *     name: 'mine',
   *     defaultProps: {
   *       onChange: () => {}, // Do nothing
   *     },
   *   });
   * ```
   */
  typed<Settings extends BaseExtensionSettings, Props extends object = {}>() {
    return createBaseExtensionFactory<Settings, Props>();
  },
};

export const isExtensionConstructor = <Settings extends BaseExtensionSettings = any>(
  value: unknown,
): value is AnyExtensionConstructor<Settings> =>
  isRemirrorType(value) &&
  [
    RemirrorIdentifier.PlainExtensionConstructor,
    RemirrorIdentifier.MarkExtensionConstructor,
    RemirrorIdentifier.NodeExtensionConstructor,
  ].includes(value[REMIRROR_IDENTIFIER_KEY]);
