import { SchemaMarkTypeParams } from '../../types';
import { toggleMark } from '../commands';
import { markInputRule } from '../commands/mark-input-rule';
import { MarkExtension } from '../utils';

export class Bold extends MarkExtension {
  get name() {
    return 'bold';
  }

  get schema() {
    return {
      parseDOM: [
        {
          tag: 'strong',
        },
        {
          tag: 'b',
          getAttrs: (node: HTMLElement) => node.style.fontWeight !== 'normal' && null,
        },
        {
          style: 'font-weight',
          getAttrs: (value: string) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
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
