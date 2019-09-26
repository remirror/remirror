import {
  CommandMarkTypeParams,
  ExtensionManagerMarkTypeParams,
  MarkExtension,
  MarkExtensionSpec,
  MarkGroup,
  markInputRule,
  markPasteRule,
} from '@remirror/core';
import { toggleMark } from 'prosemirror-commands';

export class ItalicExtension extends MarkExtension {
  get name() {
    return 'italic' as const;
  }

  get schema(): MarkExtensionSpec {
    return {
      group: MarkGroup.FontStyle,
      parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
      toDOM: () => ['em', 0],
    };
  }

  public keys({ type }: ExtensionManagerMarkTypeParams) {
    return {
      'Mod-i': toggleMark(type),
    };
  }

  public commands({ type }: CommandMarkTypeParams) {
    return { italic: () => toggleMark(type) };
  }

  public inputRules({ type }: ExtensionManagerMarkTypeParams) {
    return [markInputRule({ regexp: /(?:^|[^*_])(?:\*|_)([^*_]+)(?:\*|_)$/, type })];
  }

  public pasteRules({ type }: ExtensionManagerMarkTypeParams) {
    return [markPasteRule({ regexp: /(?:^|[^*_])(?:\*|_)([^*_]+)(?:\*|_)/g, type })];
  }
}
