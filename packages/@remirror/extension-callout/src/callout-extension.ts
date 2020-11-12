import {
  ApplySchemaAttributes,
  CommandFunction,
  extensionDecorator,
  ExtensionTag,
  findNodeAtSelection,
  isElementDomNode,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
  toggleWrap,
} from '@remirror/core';
import { TextSelection } from '@remirror/pm/state';

import type { CalloutAttributes, CalloutOptions } from './callout-types';
import { dataAttributeType, updateNodeAttributes } from './callout-utils';

/**
 * Adds a callout to the editor.
 */
@extensionDecorator<CalloutOptions>({
  defaultOptions: {
    defaultType: 'info',
  },
})
export class CalloutExtension extends NodeExtension<CalloutOptions> {
  get name() {
    return 'callout' as const;
  }

  readonly tags = [ExtensionTag.BlockNode];

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      attrs: {
        ...extra.defaults(),
        type: { default: this.options.defaultType },
      },
      content: 'block*',
      defining: true,
      draggable: false,
      parseDOM: [
        {
          tag: `div[${dataAttributeType}]`,
          getAttrs: (node) => {
            if (!isElementDomNode(node)) {
              return false;
            }

            const type = node.getAttribute(dataAttributeType);
            const content = node.textContent;
            return { ...extra.parse(node), type, content };
          },
        },
      ],
      toDOM: (node) => {
        const { type, ...rest } = node.attrs as CalloutAttributes;
        const attributes = { ...extra.dom(node), ...rest, [dataAttributeType]: type };

        return ['div', attributes, 0];
      },
    };
  }

  createCommands() {
    return {
      /**
       * Toggle the callout at the current selection. If you don't provide the
       * type it will use the options.defaultType.
       *
       * If none exists one will be created or the existing callout content will be
       * lifted out of the callout node.
       *
       * ```ts
       * if (commands.toggleCallout.isEnabled()) {
       *   commands.toggleCallout({ type: 'success' });
       * }
       * ```
       */
      toggleCallout: (attributes: CalloutAttributes = {}): CommandFunction =>
        toggleWrap(this.type, attributes),

      /**
       * Update the callout at the current position. Primarily this is used
       * to change the type.
       *
       * ```ts
       * if (commands.updateCallout.isEnabled()) {
       *   commands.updateCallout({ type: 'error' });
       * }
       * ```
       */
      updateCallout: (attributes: CalloutAttributes): CommandFunction =>
        updateNodeAttributes(this.type)(attributes),
    };
  }

  /**
   * Create specific keyboard bindings for the code block.
   */
  createKeymap(): KeyBindings {
    return {
      Backspace: ({ dispatch, tr }) => {
        // Aims to stop merging callouts when deleting content in between
        const { selection } = tr;

        // If the selection is not empty return false and let other extension
        // (ie: BaseKeymapExtension) to do the deleting operation.
        if (!selection.empty) {
          return false;
        }

        const { $from } = selection;

        // If not at the start of current node, no joining will happen
        if ($from.parentOffset !== 0) {
          return false;
        }

        const previousPosition = $from.before($from.depth) - 1;

        // If nothing above to join with
        if (previousPosition < 1) {
          return false;
        }

        const previousPos = tr.doc.resolve(previousPosition);

        // If resolving previous position fails, bail out
        if (!previousPos?.parent) {
          return false;
        }

        const previousNode = previousPos.parent;
        const { node, pos } = findNodeAtSelection(selection);

        // If previous node is a callout, cut current node's content into it
        if (node.type !== this.type && previousNode.type === this.type) {
          const { content, nodeSize } = node;
          tr.delete(pos, pos + nodeSize);
          tr.setSelection(TextSelection.create(tr.doc, previousPosition - 1));
          tr.insert(previousPosition - 1, content);

          if (dispatch) {
            dispatch(tr);
          }

          return true;
        }

        return false;
      },
    };
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      callout: CalloutExtension;
    }
  }
}
