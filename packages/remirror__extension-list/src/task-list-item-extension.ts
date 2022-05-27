import {
  ApplySchemaAttributes,
  assertGet,
  command,
  CommandFunction,
  ExtensionPriority,
  ExtensionTag,
  findParentNodeOfType,
  getMatchString,
  isElementDomNode,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeViewMethod,
  ProsemirrorAttributes,
  ProsemirrorNode,
} from '@remirror/core';
import { InputRule, wrappingInputRule } from '@remirror/pm/inputrules';
import { ResolvedPos } from '@remirror/pm/model';
import { ExtensionListTheme } from '@remirror/theme';

import { splitListItem, wrapSelectedItems } from './list-commands';
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

          // Make sure it has higher priority then ListItemExtension's parseDOM by default
          priority: ExtensionPriority.Medium,
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
      const mark = document.createElement('input');
      mark.type = 'checkbox';
      mark.classList.add(ExtensionListTheme.LIST_ITEM_CHECKBOX);
      mark.contentEditable = 'false';
      mark.addEventListener('click', (e: MouseEvent) => {
        if (!view.editable) {
          e.preventDefault();
        }
      });
      mark.addEventListener('change', () => {
        const pos = (getPos as () => number)();
        const $pos = view.state.doc.resolve(pos + 1);
        this.store.commands.toggleCheckboxChecked({ $pos });
      });

      // Use the node as the source of truth of the checkbox state.
      mark.checked = node.attrs.checked;

      return createCustomMarkListItemNodeView({
        node,
        mark,
        updateDOM: updateNodeViewDOM,
        updateMark: updateNodeViewMark,
      });
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
   *
   * @param selection - a resolved position within the task list item you want to
   * toggle. It it's not passed, the lower bound of the current selection's will
   * be used.
   */
  @command()
  toggleCheckboxChecked(
    props?: { checked?: boolean; $pos?: ResolvedPos } | boolean,
  ): CommandFunction {
    let checked: boolean | undefined;
    let $pos: ResolvedPos | undefined;

    if (typeof props === 'boolean') {
      checked = props;
    } else if (props) {
      checked = props.checked;
      $pos = props.$pos;
    }

    return ({ tr, dispatch }) => {
      const found = findParentNodeOfType({
        selection: $pos ?? tr.selection.$from,
        types: this.type,
      });

      if (!found) {
        return false;
      }

      const { node, pos } = found;
      const attrs = { ...node.attrs, checked: checked ?? !node.attrs.checked };
      dispatch?.(tr.setNodeMarkup(pos, undefined, attrs));

      return true;
    };
  }

  createInputRules(): InputRule[] {
    const regexp = /^\s*(\[( ?|x|X)]\s)$/;

    return [
      wrappingInputRule(regexp, this.type, (match) => {
        return { checked: ['x', 'X'].includes(getMatchString(match, 2)) };
      }),

      new InputRule(regexp, (state, match, start, end) => {
        const tr = state.tr;
        tr.deleteRange(start, end);
        const canUpdate = wrapSelectedItems({
          listType: assertGet(this.store.schema.nodes, 'taskList'),
          itemType: this.type,
          tr,
        });

        if (!canUpdate) {
          return null;
        }

        const checked = ['x', 'X'].includes(getMatchString(match, 2));

        if (checked) {
          const found = findParentNodeOfType({ selection: tr.selection, types: this.type });

          if (found) {
            tr.setNodeMarkup(found.pos, undefined, { checked });
          }
        }

        return tr;
      }),
    ];
  }
}

function updateNodeViewDOM(node: ProsemirrorNode, dom: HTMLElement) {
  node.attrs.checked ? dom.setAttribute('data-checked', '') : dom.removeAttribute('data-checked');
  dom.setAttribute('data-task-list-item', '');
}

function updateNodeViewMark(node: ProsemirrorNode, mark: HTMLElement) {
  (mark as HTMLInputElement).checked = !!node.attrs.checked;
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
