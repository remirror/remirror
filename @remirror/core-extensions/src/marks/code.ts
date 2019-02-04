import {
  MarkExtension,
  markInputRule,
  markPasteRule,
  SchemaMarkTypeParams,
  toggleMark,
} from '@remirror/core';

export class Code<GOptions extends {} = {}> extends MarkExtension<GOptions> {
  get name() {
    return 'code';
  }

  get schema() {
    return {
      parseDOM: [{ tag: 'code' }],
      toDOM: () => ['code', 0],
    };
  }

  public keys({ type }: SchemaMarkTypeParams) {
    return {
      'Mod-`': toggleMark(type),
    };
  }

  public commands({ type }: SchemaMarkTypeParams) {
    return () => toggleMark(type);
  }

  public inputRules({ type }: SchemaMarkTypeParams) {
    return [markInputRule(/(?:`)([^`]+)(?:`)$/, type)];
  }

  public pasteRules({ type }: SchemaMarkTypeParams) {
    return [markPasteRule(/(?:`)([^`]+)(?:`)/g, type)];
  }
}
