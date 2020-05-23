import { FontWeightProperty } from 'csstype';

import {
  CommandFunction,
  ExtensionTag,
  FromToParameter,
  InputRule,
  isElementDOMNode,
  isString,
  MarkExtension,
  MarkExtensionSpec,
  MarkGroup,
  markInputRule,
  toggleMark,
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
export class BoldExtension extends MarkExtension<BoldExtensionSettings> {
  public static readonly defaultSettings = { weight: null };

  get name() {
    return 'bold' as const;
  }
  public readonly tags = [ExtensionTag.FormattingMark];

  public createMarkSpec(): MarkExtensionSpec {
    const { weight } = this.settings;

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
  }

  public createKeymap = () => {
    return {
      'Mod-b': toggleMark({ type: this.type }),
    };
  };

  public createInputRules = (): InputRule[] => {
    return [markInputRule({ regexp: /(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, type: this.type })];
  };

  public createCommands = () => {
    return {
      /**
       * Toggle the bold styling on and off. Remove the formatting if any
       * matching bold formatting within the selection or provided range.
       */
      toggleBold: (range?: FromToParameter) => {
        return toggleMark({ type: this.type, range });
      },

      /**
       * Set the bold formatting for the provided range.
       *
       * TODO add selection support.
       * TODO add check to see that provided range is valid.
       */
      setBold: (range: FromToParameter): CommandFunction => ({ state, dispatch }) => {
        if (dispatch) {
          dispatch(state.tr.addMark(range?.from, range?.to, this.type.create()));
        }

        return true;
      },

      /**
       * Remove the bold formatting from the provided range.
       *
       * TODO add selection support.
       * TODO add check that the provided range is valid.
       */
      removeBold: (range: FromToParameter): CommandFunction => ({ state, dispatch }) => {
        if (dispatch) {
          dispatch(state.tr.removeMark(range?.from, range?.to, this.type));
        }

        return true;
      },
    };
  };
}
