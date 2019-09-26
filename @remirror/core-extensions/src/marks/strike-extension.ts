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

export class StrikeExtension extends MarkExtension {
  get name() {
    return 'strike' as const;
  }

  get schema(): MarkExtensionSpec {
    return {
      group: MarkGroup.FontStyle,
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

  public keys({ type }: ExtensionManagerMarkTypeParams) {
    return {
      'Mod-d': toggleMark(type),
    };
  }

  public commands({ type }: CommandMarkTypeParams) {
    return { strike: () => toggleMark(type) };
  }

  public inputRules({ type }: ExtensionManagerMarkTypeParams) {
    return [markInputRule({ regexp: /~([^~]+)~$/, type })];
  }

  public pasteRules({ type }: ExtensionManagerMarkTypeParams) {
    return [markPasteRule({ regexp: /~([^~]+)~/g, type })];
  }
}
