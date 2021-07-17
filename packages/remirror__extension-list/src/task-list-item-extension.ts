import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  ExtensionTag,
  findParentNodeOfType,
  getMatchString,
  isElementDomNode,
  isNodeSelection,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
  nodeInputRule,
  NodeSpecOverride,
  NodeViewMethod,
  ProsemirrorAttributes,
} from '@remirror/core';
import { InputRule } from '@remirror/pm/inputrules';
import { EditorState, NodeSelection, TextSelection } from '@remirror/pm/state';
import { ExtensionListTheme } from '@remirror/theme';

import { splitListItem } from './list-commands';
import { createCustomMarkListItemNodeView } from './list-item-node-view';
import { ListItemSharedExtension } from './list-item-shared-extension';

/**
 * Creates the node for a task list item.
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
        {
          tag: 'li[data-task-list-item]',
          getAttrs: (node) => {
            let checked = false;

            if (isElementDomNode(node) && node.getAttribute('data-checked') !== null) {
              checked = true;
            }

            return {
              checked,
              ...extra.parse(node),
            };
          },
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => {
        return [
          'li',
          {
            ...extra.dom(node),
            'data-task-list-item': '',
            'data-checked': node.attrs.checked ? '' : undefined,
          },
          0,
        ];
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

      const extraAttrs: Record<string, string> = node.attrs.checked
        ? { 'data-task-list-item': '', 'data-checked': '' }
        : { 'data-task-list-item': '' };
      return createCustomMarkListItemNodeView({ mark: checkbox, extraAttrs });
    };
  }

  createKeymap(): KeyBindings {
    return {
      Enter: splitListItem(this.type),
    };
  }

  createExtensions() {
    return [new ListItemSharedExtension()];
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
    return ({ tr, dispatch }) => {
      const { selection } = tr;

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

  createInputRules(): InputRule[] {
    const regexp = /^\s*(\[( ?|x|X)]\s)$/;

    const isInsideListItem = (state: EditorState) =>
      state.selection.$from.node(-1).type.name === 'listItem';

    const isInsideTaskListItem = (state: EditorState) =>
      state.selection.$from.node(-1).type === this.type;

    const defaultInputRule = nodeInputRule({
      regexp,
      type: this.type,
      getAttributes: (match) => ({
        checked: ['x', 'X'].includes(getMatchString(match, 2)),
      }),
      beforeDispatch: ({ tr, start }) => {
        const $listItemPos = tr.doc.resolve(start + 1);

        if ($listItemPos.node()?.type.name === 'taskListItem') {
          tr.setSelection(new TextSelection($listItemPos));
        }
      },
      shouldSkip: ({ state }) => {
        return isInsideListItem(state) || isInsideTaskListItem(state);
      },
    });

    const listItemInputRule = new InputRule(regexp, (state, match, start, end) => {
      if (!isInsideListItem(state)) {
        return null;
      }

      let tr = state.tr;
      tr.deleteRange(start, end);
      const chain = this.store.chain(tr);
      chain.liftListItemOutOfList();
      chain.toggleTaskList();
      tr = chain.tr();

      const checked = ['x', 'X'].includes(getMatchString(match, 2));

      if (checked) {
        const found = findParentNodeOfType({ selection: tr.selection, types: this.type });

        if (found) {
          tr.setNodeMarkup(found.pos, undefined, { checked });
        }
      }

      return tr;
    });

    return [defaultInputRule, listItemInputRule];
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
