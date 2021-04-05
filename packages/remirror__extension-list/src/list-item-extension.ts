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
import { liftListItem, sinkListItem } from '@remirror/pm/schema-list';

import { isList, splitListItem } from './list-commands';

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
        nested: { default: false },
      },
      parseDOM: [{ tag: 'li', getAttrs: extra.parse }, ...(override.parseDOM ?? [])],
      toDOM: (node) => {
        const canToggle =
          enableToggle &&
          findChildren({ node, predicate: (child) => isList(child.node) }).length > 0;

        const toggleDom = canToggle ? [['button', { class: 'toggler' }]] : [];

        const { closed } = omitExtraAttributes(node.attrs, extra) as ListItemAttributes;
        const attrs = extra.dom(node);
        attrs.class = cx(attrs.class, closed && 'closed', canToggle && 'can-toggle');

        return ['li', extra.dom(node), ...toggleDom, ['span', 0]] as any;
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
      Enter: splitListItem(this.type, ['closed']),
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
}>;

declare global {
  namespace Remirror {
    interface AllExtensions {
      listItem: ListItemExtension;
    }
  }
}
