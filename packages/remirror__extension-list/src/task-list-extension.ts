import {
  ApplySchemaAttributes,
  assertGet,
  command,
  CommandFunction,
  extension,
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
} from '@remirror/core';
import { ExtensionListMessages as Messages } from '@remirror/messages';
import { TextSelection } from '@remirror/pm/state';

import { toggleList } from './list-commands';
import { TaskListItemExtension } from './task-list-item-extension';

/**
 * Create the node for a task list.
 */
@extension<object>({
  defaultOptions: { priority: ExtensionPriority.Medium },
})
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
      parseDOM: [
        { tag: 'ul[data-task-list]', getAttrs: extra.parse },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => ['ul', { ...extra.dom(node), 'data-task-list': '' }, 0],
    };
  }

  createExtensions() {
    return [
      new TaskListItemExtension({
        // The priority is `Medium` instead of `Default` because we want `TaskListItemExtension` to have a
        // higher priority than `ListItemExtension` so that `TaskListItemExtension#parseDOM` will
        // be called first.
        priority: ExtensionPriority.Medium,
      }),
    ];
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
