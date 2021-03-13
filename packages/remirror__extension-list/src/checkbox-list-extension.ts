import {
  ApplySchemaAttributes,
  assertGet,
  command,
  CommandFunction,
  extension,
  ExtensionTag,
  // keyBinding,
  // KeyBindingProps,
  // NamedShortcut,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
} from '@remirror/core';
import { ExtensionListMessages as Messages } from '@remirror/messages';

import { CheckboxItemExtension } from './checkbox-item-extension';
import { toggleList } from './list-commands';

/**
 * Creates the node for a checkbox list.
 */
@extension({})
export class CheckboxListExtension extends NodeExtension {
  get name() {
    return 'checkboxList' as const;
  }

  createTags() {
    return [ExtensionTag.Block, ExtensionTag.ListContainerNode];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      content: 'checkboxItem+',
      ...override,
      attrs: extra.defaults(),
      parseDOM: [{ tag: 'ul[data-checkbox]', getAttrs: extra.parse }],
      toDOM: (node) => ['ul', { ...extra.dom(node), 'data-checkbox': '' }, 0],
    };
  }

  /**
   * Automatically add the `CheckboxItemExtension` which is required here.
   */
  createExtensions() {
    return [new CheckboxItemExtension()];
  }

  /**
   * Toggle the checkbox list for the current selection.
   */
  @command({ icon: 'checkboxMultipleLine', label: ({ t }) => t(Messages.CHECKBOX_LIST_LABEL) })
  toggleCheckboxList(): CommandFunction {
    return toggleList(this.type, assertGet(this.store.schema.nodes, 'checkboxItem'));
  }

  // @keyBinding({ shortcut: NamedShortcut.CheckboxList, command: 'toggleCheckboxList' })
  // listShortcut(props: KeyBindingProps): boolean {
  //   return this.toggleCheckboxList()(props);
  // }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      checkboxList: CheckboxListExtension;
    }
  }
}
