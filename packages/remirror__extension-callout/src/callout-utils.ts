import {
  CommandFunction,
  findParentNodeOfType,
  includes,
  isEqual,
  isObject,
  isString,
  NodeType,
  ProsemirrorAttributes,
  ProsemirrorNode,
} from '@remirror/core';
import { ExtensionCalloutMessages } from '@remirror/messages';

import type { CalloutAttributes } from './callout-types';

export const dataAttributeType = 'data-callout-type';

export const dataAttributeEmoji = 'data-callout-emoji';

/**
 * Check that the attributes exist and are valid for the codeBlock
 * updateAttributes.
 */
export function isValidCalloutAttributes(
  attributes: ProsemirrorAttributes,
): attributes is CalloutAttributes {
  if (attributes && isObject(attributes)) {
    const attributesChecklist = Object.entries(attributes).map(([key, value]) => {
      switch (key) {
        case 'type':
          return !!(isString(value) && value.length > 0);

        case 'emoji':
          return !!(isString(value) && value.length > 0);

        default:
          return true;
      }
    });
    return attributesChecklist.every((attr) => !!attr);
  }

  return false;
}

/**
 * Updates the node attrs.
 *
 * This is used to update the type of the callout.
 */
export function updateNodeAttributes(type: NodeType) {
  return (attributes: CalloutAttributes, pos?: number): CommandFunction =>
    ({ state: { tr, selection, doc }, dispatch }) => {
      if (!isValidCalloutAttributes(attributes)) {
        throw new Error('Invalid attrs passed to the updateAttributes method');
      }

      const parent = findParentNodeOfType({
        types: type,
        selection: pos ? doc.resolve(pos) : selection,
      });

      if (!parent || isEqual(attributes, parent.node.attrs)) {
        // Do nothing since the attrs are the same
        return false;
      }

      tr.setNodeMarkup(parent.pos, type, { ...parent.node.attrs, ...attributes });

      if (dispatch) {
        dispatch(tr);
      }

      return true;
    };
}

const { DESCRIPTION, LABEL } = ExtensionCalloutMessages;

export const toggleCalloutOptions: Remirror.CommandDecoratorOptions = {
  icon: ({ attrs }) => {
    switch (attrs?.type as CalloutAttributes['type']) {
      case 'error':
        return 'closeCircleLine';
      case 'success':
        return 'checkboxCircleLine';
      case 'warning':
        return 'errorWarningLine';
      default:
        return 'informationLine';
    }
  },
  description: ({ t, attrs }) => t(DESCRIPTION, { type: attrs?.type }),
  label: ({ t, attrs }) => t(LABEL, { type: attrs?.type }),
};

/**
 * Get the callout type from the provided string.
 */
export function getCalloutType(
  value: string | null | undefined,
  validTypes: string[],
  defaultType: string,
): string {
  return includes(validTypes, value) ? value : defaultType;
}

/**
 * The default emoji render function.
 */
export function defaultEmojiRender(node: ProsemirrorNode): HTMLElement {
  const emoji = document.createElement('span');
  emoji.textContent = node.attrs.emoji;
  return emoji;
}
