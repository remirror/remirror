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
import { Fragment, Slice } from '@remirror/pm/model';
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
    validTypes: ['info', 'warning', 'error', 'success', 'blank'],
  },
  staticKeys: ['defaultType', 'validTypes'],
})
export class CalloutExtension extends NodeExtension<CalloutOptions> {
  get name() {
    return 'callout' as const;
  }

  readonly tags = [ExtensionTag.Block];

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    const { defaultType, validTypes } = this.options;
    return {
      content: 'block+',
      defining: true,
      draggable: false,
      ...override,
      attrs: {
        ...extra.defaults(),
        type: { default: defaultType },
      },
      parseDOM: [
        {
          tag: `div[${dataAttributeType}]`,
          getAttrs: (node) => {
            if (!isElementDomNode(node)) {
              return false;
            }

            const rawType = node.getAttribute(dataAttributeType);
            const type = getCalloutType(rawType, validTypes, defaultType);
            const content = node.textContent;
            return { ...extra.parse(node), type, content };
          },
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => {
        const { type, ...rest } = omitExtraAttributes(node.attrs, extra);
        const attributes = { ...extra.dom(node), ...rest, [dataAttributeType]: type };

        return ['div', attributes, 0];
      },
    };
  }

  /**
   * Create an input rule that listens for input of 3 colons followed
   * by a valid callout type, to create a callout node
   * If the callout type is invalid, the defaultType callout is created
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
   * if (commands.toggleCallout.enabled()) {
   *   commands.toggleCallout({ type: 'success' });
   * }
   * ```
   */
  @command(toggleCalloutOptions)
  toggleCallout(attributes: CalloutAttributes = {}): CommandFunction {
    return toggleWrap(this.type, attributes);
  }

  /**
   * Update the callout at the current position. Primarily this is used
   * to change the type.
   *
   * ```ts
   * if (commands.updateCallout.enabled()) {
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
    if (!(isTextSelection(tr.selection) && tr.selection.empty)) {
      return false;
    }

    const { nodeBefore, parent } = tr.selection.$from;

    if (!nodeBefore || !nodeBefore.isText || !parent.type.isTextblock) {
      return false;
    }

    const regex = /^:::([A-Za-z]*)?$/;
    const { text, nodeSize } = nodeBefore;
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
    const pos = tr.selection.$from.before();
    const end = pos + nodeSize + 1;
    // +1 to account for the extra pos a node takes up

    if (dispatch) {
      const slice = new Slice(Fragment.from(this.type.create({ type })), 0, 1);
      tr.replace(pos, end, slice);

      // Set the selection to within the callout
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

    // If the selection is not empty return false and let other extension
    // (ie: BaseKeymapExtension) to do the deleting operation.
    if (!tr.selection.empty) {
      return false;
    }

    const { $from } = tr.selection;

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
    const { node, pos } = findNodeAtSelection(tr.selection);

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
