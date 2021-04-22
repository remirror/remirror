import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  convertCommand,
  cx,
  DOMOutputSpec,
  extension,
  ExtensionTag,
  findChildren,
  getMatchString,
  InputRule,
  isDomNode,
  isNodeSelection,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
  nodeInputRule,
  NodeSpecOverride,
  omitExtraAttributes,
  ProsemirrorAttributes,
  Static,
} from '@remirror/core';
import { ClickHandlerState, CreateEventHandlers } from '@remirror/extension-events';
import { liftListItem, sinkListItem } from '@remirror/pm/schema-list';
import { NodeSelection, TextSelection } from '@remirror/pm/state';
import { ExtensionListTheme } from '@remirror/theme';

import { isList, splitListItem } from './list-commands';

/**
 * Creates the node for a list item.
 */
@extension<ListItemOptions>({
  defaultOptions: { enableToggle: false },
  staticKeys: ['enableToggle'],
})
export class ListItemExtension extends NodeExtension<ListItemOptions> {
  get name() {
    return 'listItem' as const;
  }

  createTags() {
    return [ExtensionTag.ListItemNode];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    const { enableToggle } = this.options;
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
        const canToggle =
          enableToggle &&
          findChildren({ node, predicate: (child) => isList(child.node) }).length > 0;

        const toggleDom: DOMOutputSpec[] = canToggle ? [['button', { class: 'toggler' }]] : [];

        const { closed } = omitExtraAttributes(node.attrs, extra) as ListItemAttributes;
        const attrs = extra.dom(node);
        attrs.class = cx(
          attrs.class,
          closed && 'closed',
          canToggle && 'can-toggle',
          node.attrs.hasCheckbox && ExtensionListTheme.CHECKBOX_LIST_ITEM,
        );

        let childrenDom: DOMOutputSpec[] = [['span', 0]];

        if (node.attrs.hasCheckbox) {
          attrs['data-checkbox'] = '';
          childrenDom = [
            [
              'p', // Since the first child node of a listItem node is a paragraph, use a <p> as the checkbox container is the easiest way to align the checkbox.
              {
                contentEditable: 'false',
                class: ExtensionListTheme.LIST_ITEM_CHECKBOX_CONTAINER,
              },
              [
                'input',
                {
                  type: 'checkbox',
                  checked: node.attrs.checked ? '' : undefined,
                  class: ExtensionListTheme.LIST_ITEM_CHECKBOX,
                },
              ],
            ],
            ['div', { style: 'flex: 1;' }, 0],
          ];
        }

        return ['li', attrs, ...toggleDom, ...childrenDom] as any;
      },
    };
  }

  /**
   * Track click events passed through to the editor.
   */
  createEventHandlers(): CreateEventHandlers {
    return {
      click: (event, clickState) => {
        return (
          this.handleListItemToggleClick(event, clickState) ||
          this.handleListItemCheckboxClick(event, clickState)
        );
      },
    };
  }

  private handleListItemToggleClick(event: MouseEvent, clickState: ClickHandlerState): boolean {
    const nodeWithPos = clickState.getNode(this.type);

    if (!nodeWithPos || !event) {
      return false;
    }

    const { pos, node } = nodeWithPos;

    if (event.target instanceof HTMLButtonElement) {
      this.store.commands.updateNodeAttributes(pos, {
        ...node.attrs,
        closed: !node.attrs.closed,
      });

      return true;
    }

    return false;
  }

  private handleListItemCheckboxClick(event: MouseEvent, clickState: ClickHandlerState): boolean {
    if (!clickState.direct) {
      return false;
    }

    const target = event.target;

    if (!isDomNode(target)) {
      return false;
    }

    if (
      target.nodeName === 'INPUT' &&
      (target as HTMLInputElement).getAttribute('type') === 'checkbox'
    ) {
      const nodeAtPosition = clickState.getNode(this.type);

      if (!nodeAtPosition) {
        return false;
      }

      const {
        state: { tr },
        view,
        pos,
      } = clickState;
      view.dispatch?.(tr.setSelection(NodeSelection.create(tr.doc, pos)));

      this.store.commands.toggleCheckboxChecked();
      return true;
    }

    return false;
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
      // Make sure  the `checkbox` that is selected. Otherwise do nothing.
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
   *
   * Since the list item is used for both bullet lists
   */
  enableToggle?: Static<boolean>;
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
