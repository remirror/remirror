import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  convertCommand,
  cx,
  extension,
  ExtensionTag,
  getMatchString,
  InputRule,
  isNodeSelection,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
  nodeInputRule,
  NodeSpecOverride,
  NodeViewMethod,
  ProsemirrorAttributes,
  Static,
} from '@remirror/core';
import { liftListItem, sinkListItem } from '@remirror/pm/schema-list';
import { NodeSelection, TextSelection } from '@remirror/pm/state';
import { ExtensionListTheme } from '@remirror/theme';

import { splitListItem } from './list-commands';

/**
 * Creates the node for a list item.
 */
@extension<ListItemOptions>({
  defaultOptions: { enableCollapsible: false, enableCheckbox: false },
  staticKeys: ['enableCollapsible', 'enableCheckbox'],
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
        hasCheckbox: { default: false },
        checked: { default: false },
      },
      parseDOM: [{ tag: 'li', getAttrs: extra.parse }, ...(override.parseDOM ?? [])],
      toDOM: (node) => {
        const attrs = extra.dom(node);
        attrs.class = cx(attrs.class);
        return ['li', attrs, 0];
      },
    };
  }

  createNodeViews(): NodeViewMethod | Record<string, never> {
    if (!this.options.enableCheckbox && !this.options.enableCollapsible) {
      return {};
    }

    return (node, view, getPos) => {
      const dom = document.createElement('li');
      dom.classList.add(ExtensionListTheme.LIST_ITEM_WITH_CUSTOM_MARKER);

      if (node.attrs.closed) {
        dom.classList.add(ExtensionListTheme.COLLAPSIBLE_LIST_ITEM_CLOSED);
      }

      const markContainer = document.createElement('span');
      markContainer.contentEditable = 'false';
      markContainer.classList.add(ExtensionListTheme.LIST_ITEM_MARKER_CONTAINER);

      let mark: HTMLElement;

      const contentDOM = document.createElement('span');

      if (node.attrs.hasCheckbox) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = !!node.attrs.checked;
        checkbox.classList.add(ExtensionListTheme.LIST_ITEM_CHECKBOX);
        checkbox.addEventListener('click', () => {
          const pos = (getPos as () => number)();
          view.dispatch?.(view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)));
          this.store.commands.toggleCheckboxChecked();
          return true;
        });
        mark = checkbox;
      } else {
        mark = document.createElement('div');
        mark.classList.add(ExtensionListTheme.COLLAPSIBLE_LIST_ITEM_BUTTON);

        if (node.childCount <= 1) {
          mark.classList.add('disabled');
        } else {
          mark.addEventListener('click', () => {
            const pos = (getPos as () => number)();
            view.dispatch?.(view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)));
            this.store.commands.toggleListItemClosed();
            return true;
          });
        }
      }

      mark.contentEditable = 'false';
      markContainer.append(mark);
      dom.append(markContainer);
      dom.append(contentDOM);

      // When a list item node's `content` updates, it's necessary to re-run the
      // nodeView function so that the list item node's `disabled` class can be
      // updated.
      const update = (): boolean => {
        return false;
      };

      return { dom, contentDOM, update };
    };
  }

  createKeymap(): KeyBindings {
    return {
      Enter: splitListItem(this.type), // TODO: if the previous checkbox list item is checked, the next list item should not be checked.
      Tab: convertCommand(sinkListItem(this.type)),
      'Shift-Tab': convertCommand(liftListItem(this.type)),
    };
  }

  /**
   * Toggles the current checkbox state
   */
  @command()
  toggleCheckboxChecked(): CommandFunction {
    return ({ state: { tr, selection }, dispatch }) => {
      // Make sure the list item is selected. Otherwise do nothing.
      if (!isNodeSelection(selection) || selection.node.type.name !== this.name) {
        return false;
      }

      const { node, from } = selection;
      dispatch?.(
        tr.setNodeMarkup(from, undefined, { ...node.attrs, checked: !node.attrs.checked }),
      );

      return true;
    };
  }

  /**
   * Toggles the current list item
   */
  @command()
  toggleListItemClosed(closed?: true | false | undefined): CommandFunction {
    // TODO: rename
    return ({ state: { tr, selection }, dispatch }) => {
      // Make sure the list item is selected. Otherwise do nothing.
      if (!isNodeSelection(selection) || selection.node.type.name !== this.name) {
        return false;
      }

      const { node, from } = selection;
      dispatch?.(
        tr.setNodeMarkup(from, undefined, {
          ...node.attrs,
          closed: closed === undefined ? !node.attrs.closed : closed,
        }),
      );

      return true;
    };
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

          if ($listItemPos.node()?.type.name === this.type.name) {
            tr.setSelection(new TextSelection($listItemPos));
          }
        },
      }),
    ];
  }
}

export interface ListItemOptions {
  /**
   * Set this to true to support toggling.
   */
  enableCollapsible?: Static<boolean>;

  /**
   * Set this to true to support checkbox.
   */
  enableCheckbox?: Static<boolean>;
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
  /**
   * @default false
   */
  hasCheckbox: boolean;
  /**
   * @default false
   */
  checked: boolean;
}>;

declare global {
  namespace Remirror {
    interface AllExtensions {
      listItem: ListItemExtension;
    }
  }
}
