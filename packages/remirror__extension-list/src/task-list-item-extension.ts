import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  ExtensionTag,
  isNodeSelection,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeViewMethod,
  ProsemirrorAttributes,
} from '@remirror/core';
import { NodeSelection } from '@remirror/pm/state';
import { ExtensionListTheme } from '@remirror/theme';

import { createCustomMarkListItemNodeView } from './list-item-node-view';

/**
 * Creates the node for a list item.
 */
export class TaskListItemExtension extends NodeExtension {
  get name() {
    return 'taskListItem' as const;
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
        checked: { default: false },
      },
      parseDOM: [
        { tag: 'li[data-task-list-item]', getAttrs: extra.parse },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => {
        return ['li', { ...extra.dom(node), 'data-task-list-item': '' }, 0];
      },
    };
  }

  createNodeViews(): NodeViewMethod | Record<string, never> {
    return (node, view, getPos) => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = !!node.attrs.checked;
      checkbox.classList.add(ExtensionListTheme.LIST_ITEM_CHECKBOX);
      checkbox.contentEditable = 'false';
      checkbox.addEventListener('click', () => {
        const pos = (getPos as () => number)();
        const selection = NodeSelection.create(view.state.doc, pos);
        view.dispatch(view.state.tr.setSelection(selection));
        this.store.commands.toggleCheckboxChecked();
        return true;
      });

      return createCustomMarkListItemNodeView(node, checkbox);
    };
  }

  /**
   * Toggles the current checkbox state and transform a normal list item into a
   * checkbox list item when necessary.
   *
   * @param checked - the `checked` attribute. If it's a boolean value, then it
   * will be set as an attribute. If it's undefined, then the `checked` attribuate
   * will be toggled.
   */
  @command()
  toggleCheckboxChecked(checked?: boolean): CommandFunction {
    return ({ state: { tr, selection }, dispatch }) => {
      // Make sure the list item is selected. Otherwise do nothing.
      if (!isNodeSelection(selection) || selection.node.type.name !== this.name) {
        return false;
      }

      const { node, from } = selection;
      const attrs = { ...node.attrs, checked: checked ?? !node.attrs.checked };
      dispatch?.(tr.setNodeMarkup(from, undefined, attrs));

      return true;
    };
  }
}

export type TaskListItemAttributes = ProsemirrorAttributes<{
  /**
   * @default false
   */
  checked: boolean;
}>;

declare global {
  namespace Remirror {
    interface AllExtensions {
      taskListItem: TaskListItemExtension;
    }
  }
}
