import {
  CommandMarkTypeParams,
  ExtensionManagerMarkTypeParams,
  isElementDOMNode,
  isString,
  MarkExtension,
  MarkExtensionSpec,
  MarkGroup,
  markInputRule,
} from '@remirror/core';
import { toggleMark } from 'prosemirror-commands';

export class BoldExtension extends MarkExtension {
  get name() {
    return 'bold' as const;
  }

  get schema(): MarkExtensionSpec {
    return {
      group: MarkGroup.FontStyle,
      parseDOM: [
        {
          tag: 'strong',
        },
        // This works around a Google Docs misbehavior where
        // pasted content will be inexplicably wrapped in `<b>`
        // tags with a font-weight normal.
        {
          tag: 'b',
          getAttrs: node => (isElementDOMNode(node) && node.style.fontWeight !== 'normal' ? null : false),
        },
        {
          style: 'font-weight',
          getAttrs: node => (isString(node) && /^(bold(er)?|[5-9]\d{2,})$/.test(node) ? null : false),
        },
      ],
      toDOM: () => ['strong', 0],
    };
  }

  public keys({ type }: ExtensionManagerMarkTypeParams) {
    return {
      'Mod-b': toggleMark(type),
    };
  }

  public commands({ type }: CommandMarkTypeParams) {
    return {
      bold: () => {
        return toggleMark(type);
      },
    };
  }

  public inputRules({ type }: ExtensionManagerMarkTypeParams) {
    return [markInputRule({ regexp: /(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, type })];
  }
}
