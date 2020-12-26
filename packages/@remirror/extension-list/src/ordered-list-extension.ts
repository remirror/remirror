import {
  ApplySchemaAttributes,
  CommandFunction,
  extension,
  ExtensionTag,
  isElementDomNode,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
} from '@remirror/core';
import { InputRule, wrappingInputRule } from '@remirror/pm/inputrules';

import { toggleList } from './list-commands';
import { ListItemExtension } from './list-item-extension';

/**
 * Creates the list for the ordered list.
 */
@extension({})
export class OrderedListExtension extends NodeExtension {
  get name() {
    return 'orderedList' as const;
  }

  createTags() {
    return [ExtensionTag.Block, ExtensionTag.ListContainerNode];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      content: 'listItem+',
      ...override,
      attrs: {
        ...extra.defaults(),
        order: {
          default: 1,
        },
      },
      parseDOM: [
        {
          tag: 'ol',
          getAttrs: (node) => {
            if (!isElementDomNode(node)) {
              return {};
            }

            return {
              ...extra.parse(node),
              order: +(node.getAttribute('start') ?? 1),
            };
          },
        },
      ],
      toDOM: (node) => {
        const extraAttributes = extra.dom(node);

        return node.attrs.order === 1
          ? ['ol', extraAttributes, 0]
          : ['ol', { ...extraAttributes, start: node.attrs.order }, 0];
      },
    };
  }

  /**
   * Automatically add the `ListItemExtension` which is required here.
   */
  createExtensions() {
    return [new ListItemExtension()];
  }

  createCommands() {
    return {
      /**
       * Toggle the ordered list for the current selection.
       */
      toggleOrderedList: (): CommandFunction =>
        toggleList(this.type, this.store.schema.nodes.listItem),
    };
  }

  createKeymap(): KeyBindings {
    return {
      'Shift-Ctrl-9': toggleList(this.type, this.store.schema.nodes.listItem),
    };
  }

  createInputRules(): InputRule[] {
    return [
      wrappingInputRule(
        /^(\d+)\.\s$/,
        this.type,
        (match) => ({ order: +match[1] }),
        (match, node) => node.childCount + (node.attrs.order as number) === +match[1],
      ),
    ];
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      orderedList: OrderedListExtension;
    }
  }
}
