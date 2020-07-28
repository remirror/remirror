import { bool, object } from '@remirror/core-helpers';
import { AttributesWithClass } from '@remirror/core-types';

import { PlainExtension } from '../extension';
import { AnyCombinedUnion } from '../preset';

/**
 * This extension allows others extension to add the `createAttributes` method
 * for adding attributes to the prosemirror dom element.
 *
 * @remarks
 *
 * Use this to include all the dynamically generated attributes provided by each
 * extension. High priority extensions have preference over the lower priority
 * extensions.
 *
 * @builtin
 */
export class AttributesExtension extends PlainExtension {
  get name() {
    return 'attributes' as const;
  }

  #attributeList: AttributesWithClass[] = [];
  #attributeObject: AttributesWithClass = object();

  /**
   * Create the attributes object on initialization.
   *
   * @internal
   */
  onCreate() {
    this.transformAttributes();
    this.store.setExtensionStore('updateAttributes', this.updateAttributes);
  }

  private readonly updateAttributes = (triggerUpdate = true) => {
    this.transformAttributes();

    if (triggerUpdate) {
      this.store.getCommands().forceUpdate('attributes');
    }
  };

  private transformAttributes() {
    // Reset this attributes
    this.#attributeList = [];
    this.#attributeObject = object();

    for (const extension of this.store.extensions) {
      if (
        !extension.createAttributes ||
        this.store.managerSettings.exclude?.attributes ||
        extension.options.exclude?.attributes
      ) {
        continue;
      }

      // Inserted at the start of the list so that when combining the full
      // attribute object the higher priority extension attributes are
      // preferred to the lower priority since they merge with the object
      // later.
      this.#attributeList.unshift(extension.createAttributes());
    }

    for (const attributes of this.#attributeList) {
      this.#attributeObject = {
        ...this.#attributeObject,
        ...attributes,
        class:
          (this.#attributeObject.class ?? '') + (bool(attributes.class) ? attributes.class : '') ||
          '',
      };
    }

    this.store.setStoreKey('attributes', this.#attributeObject);
  }
}

declare global {
  namespace Remirror {
    interface ManagerStore<Combined extends AnyCombinedUnion> {
      /**
       * The attributes to be added to the prosemirror editor.
       */
      attributes: AttributesWithClass;
    }

    interface ExtensionStore {
      /**
       * Triggers a recalculation of the `view.dom` attributes for each
       * extension and notifies the parent UI once done.
       *
       * This will also dispatch an update to the state automatically. However
       * you can disable this by setting `triggerUpdate` to `false`.
       *
       * By not triggering an update the new value may not be capture by the view layer, e.g. `React`.
       *
       * @param triggerUpdate - defaults to true
       */
      updateAttributes: (triggerUpdate?: boolean) => void;
    }

    interface ExcludeOptions {
      /**
       * Whether to use the attributes provided by this extension
       *
       * @defaultValue `undefined`
       */
      attributes?: boolean;
    }

    interface ExtensionCreatorMethods {
      /**
       * Allows the extension to modify the attributes for the Prosemirror editor
       * dom element.
       *
       * @remarks
       *
       * Sometimes an extension will need to make a change to the attributes of the
       * editor itself. For example a placeholder may need to do some work to make
       * the editor more accessible by setting the `aria-placeholder` value to match
       * the value of the placeholder.
       *
       * @alpha
       */
      createAttributes?(): AttributesWithClass;
    }
  }
}
