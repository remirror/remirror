import {
  ApplySchemaAttributes,
  assertGet,
  command,
  CommandFunction,
  ExtensionPriority,
  ExtensionTag,
  keyBinding,
  KeyBindingProps,
  NamedShortcut,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
} from '@remirror/core';
import { ExtensionListMessages as Messages } from '@remirror/messages';

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
      parseDOM: [
        {
          tag: 'ul[data-task-list]',
          getAttrs: extra.parse,

          // Make sure it has higher priority then BulletListExtension's parseDOM by default
          priority: ExtensionPriority.Medium,
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => ['ul', { ...extra.dom(node), 'data-task-list': '' }, 0],
    };
  }

  createExtensions() {
    return [new TaskListItemExtension({})];
  }

  /**
   * Toggle the task list for the current selection.
   */
  @command({ icon: 'checkboxMultipleLine', label: ({ t }) => t(Messages.TASK_LIST_LABEL) })
  toggleTaskList(): CommandFunction {
    return toggleList(this.type, assertGet(this.store.schema.nodes, 'taskListItem'));
  }

  @keyBinding({ shortcut: NamedShortcut.TaskList, command: 'toggleTaskList' })
  listShortcut(props: KeyBindingProps): boolean {
    return this.toggleTaskList()(props);
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      taskList: TaskListExtension;
    }
  }
}
