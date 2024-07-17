import {
  ApplySchemaAttributes,
  assertGet,
  command,
  CommandFunction,
  extension,
  ExtensionPriority,
  ExtensionTag,
  findParentNodeOfType,
  isElementDomNode,
  keyBinding,
  KeyBindingProps,
  NamedShortcut,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
} from '@remirror/core';
import { ExtensionListMessages as Messages } from '@remirror/messages';
import { InputRule, wrappingInputRule } from '@remirror/pm/inputrules';

import { toggleList, wrapSelectedItems } from './list-commands';
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
          validate: 'number',
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
        ...(override.parseDOM ?? []),
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
    return [new ListItemExtension({ priority: ExtensionPriority.Low })];
  }

  /**
   * Toggle the ordered list for the current selection.
   */
  @command({ icon: 'listOrdered', label: ({ t }) => t(Messages.ORDERED_LIST_LABEL) })
  toggleOrderedList(): CommandFunction {
    return toggleList(this.type, assertGet(this.store.schema.nodes, 'listItem'));
  }

  @keyBinding({ shortcut: NamedShortcut.OrderedList, command: 'toggleOrderedList' })
  listShortcut(props: KeyBindingProps): boolean {
    return this.toggleOrderedList()(props);
  }

  createInputRules(): InputRule[] {
    const regexp = /^(\d+)\.\s$/;

    return [
      wrappingInputRule(
        regexp,
        this.type,
        (match) => ({ order: +assertGet(match, 1) }),
        (match, node) => node.childCount + (node.attrs.order as number) === +assertGet(match, 1),
      ),

      new InputRule(regexp, (state, match, start, end) => {
        const tr = state.tr;
        tr.deleteRange(start, end);
        const canUpdate = wrapSelectedItems({
          listType: this.type,
          itemType: assertGet(this.store.schema.nodes, 'listItem'),
          tr,
        });

        if (!canUpdate) {
          return null;
        }

        const order = +assertGet(match, 1);

        if (order !== 1) {
          const found = findParentNodeOfType({ selection: tr.selection, types: this.type });

          if (found) {
            tr.setNodeMarkup(found.pos, undefined, { order });
          }
        }

        return tr;
      }),
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
