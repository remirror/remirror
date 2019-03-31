import { Cast, MarkExtension, MarkExtensionSpec, markInputRule, SchemaMarkTypeParams } from '@remirror/core';
import { toggleMark } from 'prosemirror-commands';

export class Bold extends MarkExtension {
  get name() {
    return 'bold' as const;
  }

  get schema(): MarkExtensionSpec {
    return {
      parseDOM: [
        {
          tag: 'strong',
        },
        // This works around a Google Docs misbehavior where
        // pasted content will be inexplicably wrapped in `<b>`
        // tags with a font-weight normal.
        {
          tag: 'b',
          getAttrs(node) {
            const element = Cast<HTMLElement>(node);
            return element.style.fontWeight !== 'normal' && null;
          },
        },
        {
          style: 'font-weight',
          getAttrs(value) {
            return value === 'string' && /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null;
          },
        },
      ],
      toDOM: () => ['strong', 0],
    };
  }

  public keys = ({ type }: SchemaMarkTypeParams) => {
    return {
      'Mod-b': toggleMark(type),
    };
  };

  public commands({ type }: SchemaMarkTypeParams) {
    return () => {
      return toggleMark(type);
    };
  }

  public inputRules({ type }: SchemaMarkTypeParams) {
    return [markInputRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, type)];
  }
}
