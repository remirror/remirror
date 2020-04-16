import { FontWeightProperty } from 'csstype';
import { toggleMark } from 'prosemirror-commands';

import {
  convertCommand,
  ExtensionFactory,
  isElementDOMNode,
  isString,
  MarkGroup,
  markInputRule,
} from '@remirror/core';

export interface BoldExtensionSettings {
  /**
   * Optionally set the font weight property for this extension.
   */
  weight?: FontWeightProperty | null;
}

/**
 * When added to your editor it will provide the `bold` command which makes the text under the cursor /
 * or at the provided position range bold.
 */
export const BoldExtension = ExtensionFactory.typed<BoldExtensionSettings>().mark({
  name: 'bold',
  defaultSettings: { weight: null },
  createMarkSchema(parameter) {
    const { weight } = parameter.settings;
    return {
      group: MarkGroup.FontStyle,
      parseDOM: [
        {
          tag: 'strong',
        },
        // This works around a Google Docs misbehavior where
        // pasted content will be inexplicably wrapped in `<b>`
        // tags with a font-weight normal.
        {
          tag: 'b',
          getAttrs: (node) =>
            isElementDOMNode(node) && node.style.fontWeight !== 'normal' ? null : false,
        },
        {
          style: 'font-weight',
          getAttrs: (node) =>
            isString(node) && /^(bold(er)?|[5-9]\d{2,})$/.test(node) ? null : false,
        },
      ],
      toDOM: () => {
        if (weight) {
          return ['strong', { 'font-weight': weight.toString() }, 0];
        }

        return ['strong', 0];
      },
    };
  },

  createKeymap(parameter) {
    return {
      'Mod-b': convertCommand(toggleMark(parameter.type)),
    };
  },

  createInputRules(parameter) {
    return [markInputRule({ regexp: /(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, type: parameter.type })];
  },

  createCommands(parameter) {
    return {
      bold: () => {
        return convertCommand(toggleMark(parameter.type));
      },
    };
  },
});
