import { ErrorConstant, ExtensionPriority } from '@remirror/core-constants';
import { entries, invariant, object } from '@remirror/core-helpers';
import { AnyFunction, EditorSchema, EmptyShape, Shape } from '@remirror/core-types';

import {
  AnyExtension,
  CreateLifecycleMethod,
  GetExtensionUnion,
  HelpersFromExtensions,
  PlainExtension,
  ViewLifecycleMethod,
} from '../extension';
import { throwIfNameNotUnique } from '../helpers';
import { AnyPreset } from '../preset';
import { ExtensionHelperReturn } from '../types';

/**
 * Helpers are custom methods that can provide extra functionality to the
 * editor.
 *
 * @remarks
 *
 * They can be used for pulling information from the editor or performing custom
 * async commands.
 *
 * Also provides the default helpers used within the extension.
 *
 * @builtin
 */
export class HelpersExtension extends PlainExtension {
  public static readonly defaultPriority = ExtensionPriority.High;

  get name() {
    return 'helpers' as const;
  }

  /**
   * Provide a method with access to the helpers for use in commands and helpers.
   */
  public onCreate: CreateLifecycleMethod = () => {
    this.store.setExtensionStore('getHelpers', () => {
      const helpers = this.store.getStoreKey('helpers');
      invariant(helpers, { code: ErrorConstant.HELPERS_CALLED_IN_OUTER_SCOPE });

      return helpers as any;
    });

    return {};
  };

  /**
   * Helpers are only available once the view has been added to `EditorManager`.
   */
  public onView: ViewLifecycleMethod = () => {
    const helpers: Record<string, AnyFunction> = object();
    const names = new Set<string>();

    return {
      forEachExtension(extension) {
        if (!extension.createHelpers) {
          return;
        }

        const extensionHelpers = extension.createHelpers();

        for (const [name, helper] of entries(extensionHelpers)) {
          throwIfNameNotUnique({ name, set: names, code: ErrorConstant.DUPLICATE_HELPER_NAMES });
          helpers[name] = helper;
        }
      },
      afterExtensionLoop: () => {
        this.store.setStoreKey('helpers', helpers);
      },
    };
  };
}

declare global {
  namespace Remirror {
    const _HELPERS: unique symbol;

    interface ManagerStore<ExtensionUnion extends AnyExtension, PresetUnion extends AnyPreset> {
      /**
       * The helpers provided by the extensions used.
       */
      helpers: HelpersFromExtensions<ExtensionUnion | GetExtensionUnion<PresetUnion>>;
    }

    interface ExtensionCreatorMethods<
      Settings extends Shape = object,
      Properties extends Shape = object
    > {
      /**
       * A helper method is a function that takes in arguments and returns a
       * value depicting the state of the editor specific to this extension.
       *
       * @remarks
       *
       * Unlike commands they can return anything and may not effect the
       * behavior of the editor.
       *
       * Below is an example which should provide some idea on how to add
       * helpers to the app.
       *
       * ```tsx
       * // extension.ts
       * import { ExtensionFactory } from '@remirror/core';
       *
       * const MyBeautifulExtension = ExtensionFactory.plain({
       *   name: 'beautiful',
       *   createHelpers: () => ({
       *     checkBeautyLevel: () => 100
       *   }),
       * })
       * ```
       *
       * ```
       * // app.tsx
       * import { useRemirror } from '@remirror/react';
       *
       * const MyEditor = () => {
       *   const { helpers } = useRemirror();
       *
       *   return helpers.beautiful.checkBeautyLevel() > 50
       *     ? (<span>😍</span>)
       *     : (<span>😢</span>);
       * };
       * ```
       */
      createHelpers?: () => ExtensionHelperReturn;
      /**
       * `ExtensionHelpers`
       *
       * This pseudo property makes it easier to infer Generic types of this class.
       * @private
       */
      [_HELPERS]: this['createHelpers'] extends AnyFunction
        ? ReturnType<this['createHelpers']>
        : EmptyShape;
    }

    interface ExtensionStore<Schema extends EditorSchema = EditorSchema> {
      /**
       * Helper method to provide information about the content of the editor.
       * Each extension can register its own helpers.
       */
      getHelpers: <ExtensionUnion extends AnyExtension = AnyExtension>() => HelpersFromExtensions<
        ExtensionUnion | HelpersExtension
      >;
    }
  }
}
