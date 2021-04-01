import {
  ApplySchemaAttributes,
  convertCommand,
  cx,
  extension,
  ExtensionTag,
  findChildren,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  omitExtraAttributes,
  ProsemirrorAttributes,
  Static,
} from '@remirror/core';
import { CreateEventHandlers } from '@remirror/extension-events';
import { liftListItem, sinkListItem, splitListItem } from '@remirror/pm/schema-list';

import { isList } from './list-commands';

/**
 * Creates the node for a list item.
 */
@extension<ListItemOptions>({
  defaultOptions: { enableToggle: false },
  staticKeys: ['enableToggle'],
})
export class ListItemExtension extends NodeExtension<ListItemOptions> {
  get name() {
    return 'listItem' as const;
  }

  createTags() {
    return [ExtensionTag.ListItemNode];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    const { enableToggle } = this.options;
    return {
      content: 'paragraph block*',
      defining: true,
      draggable: false,
      ...override,
      attrs: {
        ...extra.defaults(),
        closed: { default: null },
        checked: { default: null },
        checkbox: { default: false },
        nested: { default: false },
      },
      parseDOM: [{ tag: 'li', getAttrs: extra.parse }, ...(override.parseDOM ?? [])],
      toDOM: (node) => {
        const canToggle =
          enableToggle &&
          findChildren({ node, predicate: (child) => isList(child.node) }).length > 0;

        const toggleDom = canToggle ? [['button', { class: 'toggler' }]] : [];

        const { closed, checked, checkbox } = omitExtraAttributes(
          node.attrs,
          extra,
        ) as ListItemAttributes;
        const attrs = extra.dom(node);
        attrs.class = cx(
          attrs.class,
          closed && 'closed',
          canToggle && 'can-toggle',
          checkbox && 'checkbox',
        );

        const checkboxDom = checkbox
          ? [
              [
                'span',
                { class: 'pretty p-default' },
                ['input', { type: 'checkbox', ...(checked ? { checked: '' } : {}) }],
                ['div', { class: 'state' }, ['label']],
              ],
            ]
          : [];

        return ['li', extra.dom(node), ...toggleDom, ...checkboxDom, ['span', 0]] as any;
      },
    };
  }

  createEventHandlers(): CreateEventHandlers {
    return {
      click: (event, clickState) => {
        const nodeWithPos = clickState.getNode(this.type);

        if (!nodeWithPos || !event) {
          return false;
        }

        const { pos, node } = nodeWithPos;

        if (event.target instanceof HTMLInputElement) {
          this.store.commands.updateNodeAttributes(pos, {
            ...node.attrs,
            checked: !node.attrs.checked,
          });
          return true;
        }

        if (event.target instanceof HTMLButtonElement) {
          this.store.commands.updateNodeAttributes(pos, {
            ...node.attrs,
            closed: !node.attrs.closed,
          });

          return true;
        }

        return false;
      },
    };
  }

  createKeymap(): KeyBindings {
    return {
      Enter: convertCommand(splitListItem(this.type)),
      Tab: convertCommand(sinkListItem(this.type)),
      'Shift-Tab': convertCommand(liftListItem(this.type)),
    };
  }
}

export interface ListItemOptions {
  /**
   * Set this to true to support toggling.
   *
   * Since the list item is used for both bullet lists
   */
  enableToggle?: Static<boolean>;
}

export type ListItemAttributes = ProsemirrorAttributes<{
  /**
   * @default false
   */
  closed: boolean;

  /**
   * The status of the checkbox.
   *
   * @default null
   */
  checked: null | boolean;

  /**
   * True when this is a checkable item.
   */
  checkbox: boolean;
}>;

declare global {
  namespace Remirror {
    interface AllExtensions {
      listItem: ListItemExtension;
    }
  }
}
