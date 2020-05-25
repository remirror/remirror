import { ExtensionPriority } from '@remirror/core-constants';
import { bool, object } from '@remirror/core-helpers';
import { AttributesWithClass, Shape } from '@remirror/core-types';

import { AnyExtension, InitializeLifecycleMethod, PlainExtension } from '../extension';
import { AnyPreset } from '../preset';

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
  public readonly defaultPriority = ExtensionPriority.High as const;

  /**
   * Create the attributes object on initialization.
   *
   * @internal
   */
  public onInitialize: InitializeLifecycleMethod = (parameter) => {
    const { managerSettings, setStoreKey } = parameter;

    const attributeList: AttributesWithClass[] = [];
    let attributeObject: AttributesWithClass = object();

    return {
      forEachExtension: (extension) => {
        if (
          !extension.createAttributes ||
          managerSettings.exclude?.attributes ||
          extension.options.exclude?.attributes
        ) {
          return;
        }

        // Inserted at the start of the list so that when combining the full
        // attribute object the higher priority extension attributes are
        // preferred to the lower priority since they merge with the object
        // later.
        attributeList.unshift(extension.createAttributes());
      },

      afterExtensionLoop: () => {
        for (const attributes of attributeList) {
          attributeObject = {
            ...attributeObject,
            ...attributes,
            class:
              (attributeObject.class ?? '') + (bool(attributes.class) ? attributes.class : '') ||
              '',
          };
        }

        setStoreKey('attributes', attributeObject);
      },
    };
  };
}

declare global {
  namespace Remirror {
    interface ManagerStore<ExtensionUnion extends AnyExtension, PresetUnion extends AnyPreset> {
      /**
       * The attributes to be added to the prosemirror editor.
       */
      attributes: AttributesWithClass;
    }

    interface ExcludeOptions {
      /**
       * Whether to use the attributes provided by this extension
       *
       * @defaultValue `undefined`
       */
      attributes?: boolean;
    }

    interface ExtensionCreatorMethods<
      Settings extends Shape = object,
      Properties extends Shape = object
    > {
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
      createAttributes?: () => AttributesWithClass;
    }
  }
}
