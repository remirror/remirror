import {
  ApplySchemaAttributes,
  assertGet,
  command,
  CommandFunction,
  extension,
  ExtensionPriority,
  ExtensionTag,
  keyBinding,
  KeyBindingProps,
  NamedShortcut,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeViewMethod,
  ProsemirrorNode,
  Static,
} from '@remirror/core';
import { ExtensionListMessages as Messages } from '@remirror/messages';
import { InputRule, wrappingInputRule } from '@remirror/pm/inputrules';
import { NodeSelection } from '@remirror/pm/state';
import { ExtensionListTheme } from '@remirror/theme';

import { toggleList } from './list-commands';
import { ListItemExtension } from './list-item-extension';

/**
 * Create the node for a bullet list.
 */
@extension<BulletListOptions>({
  defaultOptions: { enableSpine: false },
  staticKeys: ['enableSpine'],
})
export class BulletListExtension extends NodeExtension<BulletListOptions> {
  get name() {
    return 'bulletList' as const;
  }

  createTags() {
    return [ExtensionTag.Block, ExtensionTag.ListContainerNode];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      content: 'listItem+',
      ...override,
      attrs: extra.defaults(),
      parseDOM: [{ tag: 'ul', getAttrs: extra.parse }, ...(override.parseDOM ?? [])],
      toDOM: (node) => ['ul', extra.dom(node), 0],
    };
  }

  createNodeViews(): NodeViewMethod | Record<string, never> {
    if (!this.options.enableSpine) {
      return {};
    }

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
          const selection = NodeSelection.create(view.state.doc, parentListItemPos - 1);
          view.dispatch(view.state.tr.setSelection(selection));
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
    return [
      new ListItemExtension({
        priority: ExtensionPriority.Low,
        enableCollapsible: this.options.enableSpine,
      }),
    ];
  }

  /**
   * Toggle the bullet list for the current selection.
   */
  @command({ icon: 'listUnordered', label: ({ t }) => t(Messages.BULLET_LIST_LABEL) })
  toggleBulletList(): CommandFunction {
    return toggleList(this.type, assertGet(this.store.schema.nodes, 'listItem'));
  }

  @keyBinding({ shortcut: NamedShortcut.BulletList, command: 'toggleBulletList' })
  listShortcut(props: KeyBindingProps): boolean {
    return this.toggleBulletList()(props);
  }

  createInputRules(): InputRule[] {
    return [wrappingInputRule(/^\s*([*+-])\s$/, this.type)];
  }
}

export interface BulletListOptions {
  /**
   * Set this to true to add a spine.
   */
  enableSpine?: Static<boolean>;
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      bulletList: BulletListExtension;
    }
  }
}
