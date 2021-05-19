import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  convertCommand,
  cx,
  extension,
  ExtensionTag,
  isBoolean,
  isNodeSelection,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeViewMethod,
  ProsemirrorAttributes,
  Static,
} from '@remirror/core';
import { liftListItem, sinkListItem } from '@remirror/pm/schema-list';
import { NodeSelection } from '@remirror/pm/state';
import { ExtensionListTheme } from '@remirror/theme';

import { splitListItem } from './list-commands';
import { createCustomMarkListItemNodeView } from './list-item-node-view';

/**
 * Creates the node for a list item.
 */
@extension<ListItemOptions>({
  defaultOptions: { enableCollapsible: false },
  staticKeys: ['enableCollapsible'],
})
export class ListItemExtension extends NodeExtension<ListItemOptions> {
  get name() {
    return 'listItem' as const;
  }

  createTags() {
    return [ExtensionTag.ListItemNode];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      content: 'paragraph block*',
      defining: true,
      draggable: false,
      ...override,
      attrs: {
        ...extra.defaults(),
        closed: { default: false },
        nested: { default: false },
      },
      parseDOM: [{ tag: 'li', getAttrs: extra.parse }, ...(override.parseDOM ?? [])],
      toDOM: (node) => {
        const attrs = extra.dom(node);
        return ['li', attrs, 0];
      },
    };
  }

  createNodeViews(): NodeViewMethod | Record<string, never> {
    if (!this.options.enableCollapsible) {
      return {};
    }

    return (node, view, getPos) => {
      const mark: HTMLElement = document.createElement('div');
      mark.classList.add(ExtensionListTheme.COLLAPSIBLE_LIST_ITEM_BUTTON);
      mark.contentEditable = 'false';

      if (node.childCount <= 1) {
        mark.classList.add('disabled');
      } else {
        mark.addEventListener('click', () => {
          const pos = (getPos as () => number)();
          const selection = NodeSelection.create(view.state.doc, pos);
          view.dispatch(view.state.tr.setSelection(selection));
          this.store.commands.toggleListItemClosed();
          return true;
        });
      }

      return createCustomMarkListItemNodeView(node, mark);
    };
  }

  createKeymap(): KeyBindings {
    return {
      Enter: splitListItem(this.type),
      Tab: convertCommand(sinkListItem(this.type)),
      'Shift-Tab': convertCommand(liftListItem(this.type)),
    };
  }

  /**
   * Toggles the current list item.
   *
   * @param closed - the `closed` attribute. If it's a boolean value, then it
   * will be set as an attribute. If it's undefined, then the `closed` attribuate
   * will be toggled.
   */
  @command()
  toggleListItemClosed(closed?: boolean | undefined): CommandFunction {
    return ({ state: { tr, selection }, dispatch }) => {
      // Make sure the list item is selected. Otherwise do nothing.
      if (!isNodeSelection(selection) || selection.node.type.name !== this.name) {
        return false;
      }

      const { node, from } = selection;
      closed = isBoolean(closed) ? closed : !node.attrs.closed;
      dispatch?.(tr.setNodeMarkup(from, undefined, { ...node.attrs, closed }));

      return true;
    };
  }
}

export interface ListItemOptions {
  /**
   * Set this to true to support toggling.
   */
  enableCollapsible?: Static<boolean>;
}

export type ListItemAttributes = ProsemirrorAttributes<{
  /**
   * @default false
   */
  closed: boolean;
  /**
   * @default false
   */
  nested: boolean;
}>;

declare global {
  namespace Remirror {
    interface AllExtensions {
      listItem: ListItemExtension;
    }
  }
}
