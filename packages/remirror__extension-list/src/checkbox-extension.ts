import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  extension,
  ExtensionTag,
  getMatchString,
  InputRule,
  isElementDomNode,
  isNodeSelection,
  NodeExtension,
  NodeExtensionSpec,
  nodeInputRule,
  NodeSpecOverride,
  omitExtraAttributes,
} from '@remirror/core';
import type { CreateEventHandlers } from '@remirror/extension-events';
import { NodeSelection } from '@remirror/pm/state';

/**
 * Creates the node for a list item.
 */
@extension({})
export class CheckboxExtension extends NodeExtension {
  get name() {
    return 'checkbox' as const;
  }

  createTags() {
    return [ExtensionTag.Behavior];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      draggable: false,
      atom: true,
      ...override,
      attrs: {
        ...extra.defaults(),
        checked: { default: false },
      },
      parseDOM: [
        {
          tag: 'input[type=checkbox]',
          getAttrs: (node) => {
            if (!isElementDomNode(node)) {
              return false;
            }

            const input = node as HTMLInputElement;
            return { ...extra.parse(node), checked: input.checked };
          },
        },
      ],
      toDOM: (node) => {
        const { checked } = omitExtraAttributes(node.attrs, extra);

        return [
          'input',
          {
            type: 'checkbox',
            checked: checked ? '' : undefined,
            style: 'cursor: pointer; vertical-align: baseline',
          },
        ];
      },
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
        regexp: /^\s*(\[( ?|x)])\s$/,
        type: this.type,
        getAttributes: (match) => ({ checked: getMatchString(match, 2) === 'x' }),
      }),
    ];
  }

  /**
   * Track click events passed through to the editor.
   */
  createEventHandlers(): CreateEventHandlers {
    return {
      click: (_, clickState) => {
        if (!clickState.direct) {
          return;
        }

        const nodeAtPosition = clickState.getNode(this.type);

        if (!nodeAtPosition) {
          return;
        }

        const {
          state: { tr },
          view,
          pos,
        } = clickState;
        view.dispatch?.(tr.setSelection(NodeSelection.create(tr.doc, pos)));

        return this.store.commands.toggleCheckboxChecked();
      },
    };
  }
}
