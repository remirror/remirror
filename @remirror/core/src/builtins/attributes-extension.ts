import { ExtensionPriority } from '@remirror/core-constants';
import { bool, object } from '@remirror/core-helpers';
import { AttributesWithClass } from '@remirror/core-types';

import { AnyExtension, Extension, ExtensionFactory } from '../extension';
import { AnyPreset } from '../preset';
import { ExtensionCommandReturn, ExtensionHelperReturn } from '../types';

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
export const AttributesExtension = ExtensionFactory.plain({
  name: 'attributes',
  defaultPriority: ExtensionPriority.High,

  /**
   * Ensure that all ssr transformers are run.
   */
  onInitialize({ getParameter, managerSettings, setStoreKey }) {
    const attributeList: AttributesWithClass[] = [];
    let attributeObject: AttributesWithClass = object();

    return {
      forEachExtension: (extension) => {
        if (
          !extension.parameter.createAttributes ||
          managerSettings.exclude?.attributes ||
          extension.settings.exclude.attributes
        ) {
          return;
        }

        // Inserted at the start of the list so that when building the attribute
        // the higher priority extension attributes are preferred to the lower
        // priority since they merge with the object later.
        attributeList.unshift(
          extension.parameter.createAttributes(getParameter(extension), extension),
        );
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
  },
});

declare global {
  namespace Remirror {
    interface ManagerStore<
      ExtensionUnion extends AnyExtension,
      PresetUnion extends AnyPreset<ExtensionUnion>
    > {
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
      Name extends string,
      Settings extends object,
      Properties extends object,
      Commands extends ExtensionCommandReturn,
      Helpers extends ExtensionHelperReturn,
      ProsemirrorType = never
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
      createAttributes?: (
        parameter: ManagerMethodParameter,
        extension: Extension<Name, Settings, Properties, Commands, Helpers, ProsemirrorType>,
      ) => AttributesWithClass;
    }
  }
}
