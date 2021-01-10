import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  extension,
  ExtensionTag,
  findNodeAtSelection,
  getMatchString,
  InputRule,
  isElementDomNode,
  isTextSelection,
  keyBinding,
  KeyBindingProps,
  NodeExtension,
  NodeExtensionSpec,
  nodeInputRule,
  NodeSpecOverride,
  omitExtraAttributes,
  toggleWrap,
} from '@remirror/core';
import { TextSelection } from '@remirror/pm/state';

import type { CalloutAttributes, CalloutOptions } from './callout-types';
import {
  dataAttributeType,
  getCalloutType,
  toggleCalloutOptions,
  updateNodeAttributes,
} from './callout-utils';

/**
 * Adds a callout to the editor.
 */
@extension<CalloutOptions>({
  defaultOptions: {
    defaultType: 'info',
    validTypes: ['info', 'warning', 'error', 'success'],
  },
  staticKeys: ['defaultType', 'validTypes'],
})
export class CalloutExtension extends NodeExtension<CalloutOptions> {
  get name() {
    return 'callout' as const;
  }

  readonly tags = [ExtensionTag.Block];

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      content: 'block*',
      defining: true,
      draggable: false,
      ...override,
      attrs: {
        ...extra.defaults(),
        type: { default: this.options.defaultType },
      },
      parseDOM: [
        {
          tag: `div[${dataAttributeType}]`,
          getAttrs: (node) => {
            if (!isElementDomNode(node)) {
              return false;
            }

            const type = node.getAttribute(dataAttributeType);
            const content = node.textContent;
            return { ...extra.parse(node), type, content };
          },
        },
      ],
      toDOM: (node) => {
        const { type, ...rest } = omitExtraAttributes(node.attrs, extra);
        const attributes = { ...extra.dom(node), ...rest, [dataAttributeType]: type };

        return ['div', attributes, 0];
      },
    };
  }

  /**
   * Create an input rule that listens converts the code fence into a code block
   * when typing triple back tick followed by a space.
   */
  createInputRules(): InputRule[] {
    return [
      nodeInputRule({
        regexp: /^:::([\dA-Za-z]*) $/,
        type: this.type,
        beforeDispatch: ({ tr, start }) => {
          const $pos = tr.doc.resolve(start);
          tr.setSelection(new TextSelection($pos));
        },
        getAttributes: (match) => {
          const { defaultType, validTypes } = this.options;
          return { type: getCalloutType(getMatchString(match, 1), validTypes, defaultType) };
        },
      }),
    ];
  }

  /**
   * Toggle the callout at the current selection. If you don't provide the
   * type it will use the options.defaultType.
   *
   * If none exists one will be created or the existing callout content will be
   * lifted out of the callout node.
   *
   * ```ts
   * if (commands.toggleCallout.isEnabled()) {
   *   commands.toggleCallout({ type: 'success' });
   * }
   * ```
   */
  @command()
  toggleCallout(attributes: CalloutAttributes = {}): CommandFunction {
    return toggleWrap(this.type, attributes);
  }

  /**
   * Update the callout at the current position. Primarily this is used
   * to change the type.
   *
   * ```ts
   * if (commands.updateCallout.isEnabled()) {
   *   commands.updateCallout({ type: 'error' });
   * }
   * ```
   */
  @command(toggleCalloutOptions)
  updateCallout(attributes: CalloutAttributes): CommandFunction {
    return updateNodeAttributes(this.type)(attributes);
  }

  @keyBinding({ shortcut: 'Enter' })
  handleEnterKey({ dispatch, tr }: KeyBindingProps): boolean {
    const { selection } = tr;

    if (!isTextSelection(selection) || !selection.$cursor) {
      return false;
    }

    const { nodeBefore, parent } = selection.$from;

    if (!nodeBefore || !nodeBefore.isText || !parent.type.isTextblock) {
      return false;
    }

    const regex = /^:::([A-Za-z]*)?$/;
    const { text } = nodeBefore;
    const { textContent } = parent;

    if (!text) {
      return false;
    }

    const matchesNodeBefore = text.match(regex);
    const matchesParent = textContent.match(regex);

    if (!matchesNodeBefore || !matchesParent) {
      return false;
    }

    const { defaultType, validTypes } = this.options;

    const type = getCalloutType(matchesNodeBefore[1], validTypes, defaultType);
    const pos = selection.$from.before();
    const end = pos + nodeBefore.nodeSize + 1;
    // +1 to account for the extra pos a node takes up

    if (dispatch) {
      tr.replaceWith(pos, end, this.type.create({ type }));

      // Set the selection to within the codeBlock
      tr.setSelection(TextSelection.create(tr.doc, pos + 1));
      dispatch(tr);
    }

    return true;
  }

  /**
   * Handle the backspace key when deleting content.
   */
  @keyBinding({ shortcut: 'Backspace' })
  handleBackspace({ dispatch, tr }: KeyBindingProps): boolean {
    // Aims to stop merging callouts when deleting content in between
    const { selection } = tr;

    // If the selection is not empty return false and let other extension
    // (ie: BaseKeymapExtension) to do the deleting operation.
    if (!selection.empty) {
      return false;
    }

    const { $from } = selection;

    // If not at the start of current node, no joining will happen
    if ($from.parentOffset !== 0) {
      return false;
    }

    const previousPosition = $from.before($from.depth) - 1;

    // If nothing above to join with
    if (previousPosition < 1) {
      return false;
    }

    const previousPos = tr.doc.resolve(previousPosition);

    // If resolving previous position fails, bail out
    if (!previousPos?.parent) {
      return false;
    }

    const previousNode = previousPos.parent;
    const { node, pos } = findNodeAtSelection(selection);

    // If previous node is a callout, cut current node's content into it
    if (node.type !== this.type && previousNode.type === this.type) {
      const { content, nodeSize } = node;
      tr.delete(pos, pos + nodeSize);
      tr.setSelection(TextSelection.create(tr.doc, previousPosition - 1));
      tr.insert(previousPosition - 1, content);

      if (dispatch) {
        dispatch(tr);
      }

      return true;
    }

    return false;
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      callout: CalloutExtension;
    }
  }
}
