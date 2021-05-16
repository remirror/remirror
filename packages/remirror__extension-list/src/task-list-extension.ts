import {
  ApplySchemaAttributes,
  assertGet,
  command,
  CommandFunction,
  ExtensionPriority,
  ExtensionTag,
  getMatchString,
  InputRule,
  keyBinding,
  KeyBindingProps,
  NamedShortcut,
  NodeExtension,
  NodeExtensionSpec,
  nodeInputRule,
  NodeSpecOverride,
  NodeViewMethod,
  ProsemirrorNode,
} from '@remirror/core';
import { ExtensionListMessages as Messages } from '@remirror/messages';
import { NodeSelection, TextSelection } from '@remirror/pm/state';
import { ExtensionListTheme } from '@remirror/theme';

import { toggleList } from './list-commands';
import { TaskListItemExtension } from './task-list-item-extension';

/**
 * Create the node for a task list.
 */
export class TaskListExtension extends NodeExtension {
  get name() {
    return 'taskList' as const;
  }

  createTags() {
    return [ExtensionTag.Block, ExtensionTag.ListContainerNode];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      content: 'taskListItem+',
      ...override,
      attrs: extra.defaults(),
      parseDOM: [{ tag: 'ul', getAttrs: extra.parse }, ...(override.parseDOM ?? [])],
      toDOM: (node) => ['ul', extra.dom(node), 0],
    };
  }

  createNodeViews(): NodeViewMethod | Record<string, never> {
    return (_, view, getPos) => {
      const dom = document.createElement('ul');
      dom.style.position = 'relative';

      const pos = (getPos as () => number)();
      const $pos = view.state.doc.resolve(pos + 1);

      const parentListItemNode: ProsemirrorNode | undefined = $pos.node($pos.depth - 1);

      const isFirstLevel = parentListItemNode?.type?.name !== 'listItem';

      if (!isFirstLevel) {
        const parentListItemPos: number = $pos.start($pos.depth - 1);

        const spine = document.createElement('div');
        spine.contentEditable = 'false';
        spine.classList.add(ExtensionListTheme.LIST_SPINE);

        spine.addEventListener('click', (event) => {
          view.dispatch?.(
            view.state.tr.setSelection(NodeSelection.create(view.state.doc, parentListItemPos - 1)),
          );
          this.store.commands.toggleListItemClosed();

          event.preventDefault();
          event.stopPropagation();
        });
        dom.append(spine);
      }

      const contentDOM = document.createElement('div');
      contentDOM.classList.add(ExtensionListTheme.UL_LIST_CONTENT);
      dom.append(contentDOM);

      return {
        dom,
        contentDOM,
      };
    };
  }

  createExtensions() {
    return [new TaskListItemExtension({ priority: ExtensionPriority.Low })];
  }

  /**
   * Toggle the task list for the current selection.
   */
  @command({ icon: 'listUnordered', label: ({ t }) => t(Messages.BULLET_LIST_LABEL) })
  toggleTaskList(): CommandFunction {
    return toggleList(this.type, assertGet(this.store.schema.nodes, 'taskListItem'));
  }

  @keyBinding({ shortcut: NamedShortcut.TaskList, command: 'toggleTaskList' })
  listShortcut(props: KeyBindingProps): boolean {
    return this.toggleTaskList()(props);
  }

  createInputRules(): InputRule[] {
    return [
      nodeInputRule({
        regexp: /^\s*(\[( ?|x|X)]\s)$/,
        type: this.type,
        getAttributes: (match) => ({
          checked: ['x', 'X'].includes(getMatchString(match, 2)),
          hasCheckbox: true,
        }),
        beforeDispatch: ({ tr, start }) => {
          const $listItemPos = tr.doc.resolve(start + 1);

          if ($listItemPos.node()?.type.name === 'taskListItem') {
            tr.setSelection(new TextSelection($listItemPos));
          }
        },
      }),
    ];
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      taskList: TaskListExtension;
    }
  }
}
