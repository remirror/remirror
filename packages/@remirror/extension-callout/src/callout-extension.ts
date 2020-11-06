import {
  ApplySchemaAttributes,
  CommandFunction,
  extensionDecorator,
  ExtensionTag,
  isElementDomNode,
  NodeExtension,
  NodeExtensionSpec,
  toggleWrap,
} from '@remirror/core';
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
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      callout: CalloutExtension;
    }
  }
}
