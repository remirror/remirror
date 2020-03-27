import { freeze } from '@remirror/core-helpers';
import { BaseExtensionConfig, ExtensionCommandReturn } from '@remirror/core-types';

import { Extension, ExtensionCreatorOptions } from './extension';

const createBaseExtensionCreator = <
  Config extends BaseExtensionConfig = BaseExtensionConfig,
  Props extends object = {}
>() => ({
  /**
   * Creates a PlainExtension. This is useful for non content specific
   * functionality like adding styling or plugins.
   */
  plain<Name extends string, Commands extends ExtensionCommandReturn>(
    creatorOptions: ExtensionCreatorOptions<Name, Commands, Config, Props>,
  ) {
    const options = freeze(creatorOptions);

    return class extends Extension<Name, Commands, Config, Props> {
      public getCreatorOptions() {
        return options;
      }
    };
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
   * preserve type inference while benefiting from type inference. If you don't
   * want to add any configuration or dynamic props you can use the other
   * methods exposed by this configuration.
   */
  typed<Config extends BaseExtensionConfig, Props extends object>() {
    return createBaseExtensionCreator<Config, Props>();
  },
};

const MyExtension = ExtensionCreator.plain({});
