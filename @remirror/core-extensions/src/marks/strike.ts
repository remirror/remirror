import {
  CommandMarkTypeParams,
  MarkExtension,
  MarkExtensionSpec,
  markInputRule,
  markPasteRule,
  SchemaMarkTypeParams,
} from '@remirror/core';
import { toggleMark } from 'prosemirror-commands';

export class StrikeExtension extends MarkExtension {
  get name() {
    return 'strike' as const;
  }

  get schema(): MarkExtensionSpec {
    return {
      parseDOM: [
        {
          tag: 's',
        },
        {
          tag: 'del',
        },
        {
          tag: 'strike',
        },
        {
          style: 'text-decoration',
          getAttrs: node => (node === 'line-through' ? {} : false),
        },
      ],
      toDOM: () => ['s', 0],
    };
  }

  public keys({ type }: SchemaMarkTypeParams) {
    return {
      'Mod-d': toggleMark(type),
    };
  }

  public commands({ type }: CommandMarkTypeParams) {
    return () => toggleMark(type);
  }

  public inputRules({ type }: SchemaMarkTypeParams) {
    return [markInputRule({ regexp: /~([^~]+)~$/, type })];
  }

  public pasteRules({ type }: SchemaMarkTypeParams) {
    return [markPasteRule({ regexp: /~([^~]+)~/g, type })];
  }
}
