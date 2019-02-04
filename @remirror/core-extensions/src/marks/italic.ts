import {
  MarkExtension,
  markInputRule,
  markPasteRule,
  SchemaMarkTypeParams,
  toggleMark,
} from '@remirror/core';

export class Italic extends MarkExtension {
  get name() {
    return 'italic';
  }

  get schema() {
    return {
      parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
      toDOM: () => ['em', 0],
    };
  }

  public keys({ type }: SchemaMarkTypeParams) {
    return {
      'Mod-i': toggleMark(type),
    };
  }

  public commands({ type }: SchemaMarkTypeParams) {
    return () => toggleMark(type);
  }

  public inputRules({ type }: SchemaMarkTypeParams) {
    return [markInputRule(/(?:^|[^*_])(?:\*|_)([^*_]+)(?:\*|_)$/, type)];
  }

  public pasteRules({ type }: SchemaMarkTypeParams) {
    return [markPasteRule(/(?:^|[^*_])(?:\*|_)([^*_]+)(?:\*|_)/g, type)];
  }
}
