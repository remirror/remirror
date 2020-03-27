import { ExtensionType } from '@remirror/core-constants';
import { freeze } from '@remirror/core-helpers';
import {
  BaseExtensionConfig,
  ExtensionCommandReturn,
  IfNoRequiredProperties,
} from '@remirror/core-types';

import { Extension, ExtensionConstructor, ExtensionCreatorOptions } from './extension';

const createBaseExtensionCreator = <
  Config extends BaseExtensionConfig = BaseExtensionConfig,
  Props extends object = {}
>() => ({
  /**
   * Creates a `PlainExtension`. This is useful for non content specific
   * functionality like adding styling or plugins.
   */
  plain<Name extends string, Commands extends ExtensionCommandReturn>(
    creatorOptions: ExtensionCreatorOptions<Name, Commands, Config, Props>,
  ): ExtensionConstructor<Name, Commands, Config, Props> {
    const options = freeze(creatorOptions);

    class PlainExtension extends Extension<Name, Commands, Config, Props> {
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
        return new PlainExtension(...config);
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

    return PlainExtension;
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
   * type out all the generic types. If you don't
   * want to add any configuration or dynamic props you can use the other
   * methods exposed by this configuration.
   */
  typed<Config extends BaseExtensionConfig, Props extends object>() {
    return createBaseExtensionCreator<Config, Props>();
  },
};

const SimplestExtension = ExtensionCreator.plain({ name: 'simplest' }).of();

const MyExtension = ExtensionCreator.typed<{ isGood: boolean } & BaseExtensionConfig, {}>().plain({
  name: 'mine',
});
// MyExtension.of();
