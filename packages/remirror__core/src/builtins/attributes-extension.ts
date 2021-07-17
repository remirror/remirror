import type { ClassName } from '@linaria/core/types/cx';
import { cx, object } from '@remirror/core-helpers';
import type { ProsemirrorAttributes } from '@remirror/core-types';

import { AnyExtension, PlainExtension } from '../extension';

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
 * @category Builtin Extension
 */
export class AttributesExtension extends PlainExtension {
  get name() {
    return 'attributes' as const;
  }

  private attributeList: ProsemirrorAttributes[] = [];
  private attributeObject: ProsemirrorAttributes = object();

  /**
   * Create the attributes object on initialization.
   *
   * @internal
   */
  onCreate(): void {
    this.transformAttributes();
    this.store.setExtensionStore('updateAttributes', this.updateAttributes);
  }

  private readonly updateAttributes = (triggerUpdate = true) => {
    this.transformAttributes();

    if (triggerUpdate) {
      this.store.commands.forceUpdate('attributes');
    }
  };

  private transformAttributes() {
    this.attributeObject = object();

    // Exit early when the manager excludes these settings.
    if (this.store.managerSettings.exclude?.attributes) {
      this.store.setStoreKey('attributes', this.attributeObject);
      return;
    }

    // Reset this attributes
    this.attributeList = [];

    for (const extension of this.store.extensions) {
      if (extension.options.exclude?.attributes) {
        continue;
      }

      const createdAttributes = extension.createAttributes?.();
      const attributes = {
        ...createdAttributes,
        class: cx(...(extension.classNames ?? []), createdAttributes?.class),
      };

      // Inserted at the start of the list so that when combining the full
      // attribute object the higher priority extension attributes are
      // preferred to the lower priority since they merge with the object
      // later.
      this.attributeList.unshift(attributes);
    }

    for (const attributes of this.attributeList) {
      this.attributeObject = {
        ...this.attributeObject,
        ...attributes,
        class: cx(this.attributeObject.class, attributes.class),
      };
    }

    this.store.setStoreKey('attributes', this.attributeObject);
  }
}

declare global {
  namespace Remirror {
    interface ManagerStore<Extension extends AnyExtension> {
      /**
       * The attributes to be added to the prosemirror editor.
       */
      attributes: ProsemirrorAttributes;
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
       * @default undefined
       */
      attributes?: boolean;
    }

    interface BaseExtension {
      /**
       * A list of class names to add to the main editor element.
       */
      classNames?: ClassName[];

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
      createAttributes?(): ProsemirrorAttributes;
    }

    interface AllExtensions {
      attributes: AttributesExtension;
    }
  }
}
