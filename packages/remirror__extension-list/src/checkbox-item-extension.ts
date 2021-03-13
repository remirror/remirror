import {
  ApplySchemaAttributes,
  convertCommand,
  extension,
  ExtensionTag,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
} from '@remirror/core';
import { liftListItem, sinkListItem, splitListItem } from '@remirror/pm/schema-list';

import { CheckboxExtension } from './checkbox-extension';

/**
 * Creates the node for a list item.
 */
@extension({})
export class CheckboxItemExtension extends NodeExtension {
  get name() {
    return 'checkboxItem' as const;
  }

  createTags() {
    return [ExtensionTag.ListItemNode];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      content: 'checkbox paragraph block*',
      defining: true,
      draggable: false,
      ...override,
      attrs: extra.defaults(),
      parseDOM: [{ tag: 'li[data-checkbox]', getAttrs: extra.parse }],
      toDOM: (node) => ['li', { ...extra.dom(node), 'data-checkbox': '' }, 0],
    };
  }

  /**
   * Automatically add the `CheckboxExtension` which is required here.
   */
  createExtensions() {
    return [new CheckboxExtension()];
  }

  createKeymap(): KeyBindings {
    return {
      Enter: convertCommand(splitListItem(this.type)),
      Tab: convertCommand(sinkListItem(this.type)),
      'Shift-Tab': convertCommand(liftListItem(this.type)),
    };
  }
}
