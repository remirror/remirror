import {
  ApplySchemaAttributes,
  convertCommand,
  cx,
  extension,
  ExtensionTag,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeView,
  omitExtraAttributes,
  ProsemirrorAttributes,
  Static,
} from '@remirror/core';
import { CreateEventHandlers } from '@remirror/extension-events';
import { liftListItem, sinkListItem, splitListItem } from '@remirror/pm/schema-list';

/**
 * Creates the node for a list item.
 */
@extension<ListItemOptions>({
  defaultOptions: { enableToggle: true },
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
      attrs: { ...extra.defaults(), closed: { default: null } },
      parseDOM: [{ tag: 'li', getAttrs: extra.parse }, ...(override.parseDOM ?? [])],
      toDOM: (node) => {
        if (!enableToggle) {
          return ['li', extra.dom(node), 0];
        }

        const { closed } = omitExtraAttributes(node.attrs, extra) as ListItemAttributes;
        // const className =

        return ['li', extra.dom(node), ['span', {}], 0];
      },
    };
  }

  createEventHandlers(): CreateEventHandlers {
    return {
      click: (event, clickState) => {
        const nodeWithPos = clickState.getNode(this.type);

        if (!nodeWithPos || !event) {
          return;
        }
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
   * This is set to true when the
   */
  closed?: boolean;
}>;

declare global {
  namespace Remirror {
    interface AllExtensions {
      listItem: ListItemExtension;
    }
  }
}
