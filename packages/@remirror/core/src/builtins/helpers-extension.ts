import { ErrorConstant, ExtensionPriority } from '@remirror/core-constants';
import { entries, invariant, object } from '@remirror/core-helpers';
import { AnyFunction, EmptyShape, ProsemirrorAttributes } from '@remirror/core-types';
import { isMarkActive, isNodeActive } from '@remirror/core-utils';

import {
  AnyExtension,
  CreateLifecycleMethod,
  HelpersFromExtensions,
  isMarkExtension,
  isNodeExtension,
  PlainExtension,
  ViewLifecycleMethod,
} from '../extension';
import { throwIfNameNotUnique } from '../helpers';
import { ActiveFromCombined, AnyCombinedUnion, HelpersFromCombined } from '../preset';
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
  static readonly defaultPriority = ExtensionPriority.High;

  get name() {
    return 'helpers' as const;
  }

  /**
   * Provide a method with access to the helpers for use in commands and
   * helpers.
   */
  onCreate: CreateLifecycleMethod = () => {
    this.store.setExtensionStore('getHelpers', () => {
      const helpers = this.store.getStoreKey('helpers');
      invariant(helpers, { code: ErrorConstant.HELPERS_CALLED_IN_OUTER_SCOPE });

      return helpers as any;
    });
  };

  /**
   * Helpers are only available once the view has been added to
   * `RemirrorManager`.
   */
  onView: ViewLifecycleMethod = (extensions) => {
    const helpers: Record<string, AnyFunction> = object();
    const active: Record<string, AnyFunction> = object();
    const names = new Set<string>();

    for (const extension of extensions) {
      if (isNodeExtension(extension)) {
        active[extension.name] = (attrs?: ProsemirrorAttributes) => {
          return isNodeActive({ state: this.store.getState(), type: extension.type, attrs });
        };
      }

      if (isMarkExtension(extension)) {
        active[extension.name] = () => {
          return isMarkActive({ stateOrTransaction: this.store.getState(), type: extension.type });
        };
      }

      if (!extension.createHelpers) {
        continue;
      }

      const extensionHelpers = extension.createHelpers();

      for (const [name, helper] of entries(extensionHelpers)) {
        throwIfNameNotUnique({ name, set: names, code: ErrorConstant.DUPLICATE_HELPER_NAMES });
        helpers[name] = helper;
      }
    }

    this.store.setStoreKey('active', active);
    this.store.setStoreKey('helpers', helpers);
  };

  createHelpers = () => {
    return {};
  };
}

declare global {
  namespace Remirror {
    interface ManagerStore<Combined extends AnyCombinedUnion> {
      /**
       * The helpers provided by the extensions used.
       */
      helpers: HelpersFromCombined<Combined>;

      /**
       * Check which nodes and marks are active under the current user
       * selection.
       *
       * ```ts
       * const { active } = manager.store;
       *
       * return active.bold() ? 'bold' : 'regular';
       * ```
       */
      active: ActiveFromCombined<Combined>;
    }

    interface ExtensionCreatorMethods {
      /**
       * `ExtensionHelpers`
       *
       * This pseudo property makes it easier to infer Generic types of this
       * class.
       * @private
       */
      ['~H']: this['createHelpers'] extends AnyFunction
        ? ReturnType<this['createHelpers']>
        : EmptyShape;

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
       *   const { helpers } = useRemirror({ autoUpdate: true });
       *
       *   return helpers.beautiful.checkBeautyLevel() > 50
       *     ? (<span>😍</span>)
       *     : (<span>😢</span>);
       * };
       * ```
       */
      createHelpers?(): ExtensionHelperReturn;
    }

    interface ExtensionStore {
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
