import { extension, PlainExtension } from '@remirror/core';

export interface NodeFormattingOptions {}

/**
 * Support consistent formatting of nodes within your editor.
 */
@extension<NodeFormattingOptions>({})
export class NodeFormattingExtension extends PlainExtension<NodeFormattingOptions> {
  get name() {
    return 'nodeFormatting' as const;
  }
}
