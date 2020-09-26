import { ErrorConstant, ExtensionPriority } from '@remirror/core-constants';
import { entries, object } from '@remirror/core-helpers';
import type { AnyFunction, EmptyShape, ProsemirrorAttributes, Value } from '@remirror/core-types';
import { isMarkActive, isNodeActive, isSelectionEmpty } from '@remirror/core-utils';

import { extensionDecorator } from '../decorators';
import {
  AnyExtension,
  HelpersFromExtensions,
  isMarkExtension,
  isNodeExtension,
  PlainExtension,
} from '../extension';
import { throwIfNameNotUnique } from '../helpers';
import type { ActiveFromCombined, AnyCombinedUnion, HelpersFromCombined } from '../preset';
import type { ExtensionHelperReturn } from '../types';

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
@extensionDecorator({ defaultPriority: ExtensionPriority.High })
export class HelpersExtension extends PlainExtension {
  get name() {
    return 'helpers' as const;
  }

  /**
   * Helpers are only available once the view has been added to
   * `RemirrorManager`.
   */
  onView(): void {
    const helpers: Record<string, AnyFunction> = object();
    const active: Record<string, AnyFunction> = object();
    const names = new Set<string>();

    for (const extension of this.store.extensions) {
      if (isNodeExtension(extension)) {
        active[extension.name] = (attrs?: ProsemirrorAttributes) => {
          return isNodeActive({ state: this.store.getState(), type: extension.type, attrs });
        };
      }

      if (isMarkExtension(extension)) {
        active[extension.name] = () => {
          return isMarkActive({ trState: this.store.getState(), type: extension.type });
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
    this.store.setExtensionStore('helpers', helpers as any);
  }

  createHelpers() {
    return {
      /**
       * Check whether the selection is empty.
       */
      isSelectionEmpty: () => isSelectionEmpty(this.store.view.state),
    };
  }
}

declare global {
  namespace Remirror {
    interface ManagerStore<Combined extends AnyCombinedUnion> {
      /**
       * The helpers provided by the extensions used.
       */
      helpers: HelpersFromCombined<Combined | Value<AllExtensions>>;

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
       *
       * This should only be accessed after the `onView` lifecycle method
       * otherwise it will throw an error.
       */
      helpers: HelpersFromExtensions<Builtin | AnyExtension>;
    }

    interface AllExtensions {
      helpers: HelpersExtension;
    }
  }
}
