import { setBlockType } from 'prosemirror-commands';
import { NodeExtension } from '../node-extension';
import { CommandNodeTypeParams, NodeExtensionOptions, NodeExtensionSpec } from '../types';

export class ParagraphExtension extends NodeExtension<NodeExtensionOptions, 'createParagraph', {}> {
  get name() {
    return 'paragraph' as const;
  }

  get schema(): NodeExtensionSpec {
    return {
      content: 'inline*',
      group: 'block',
      draggable: false,
      parseDOM: [
        {
          tag: 'p',
        },
      ],
      toDOM: () => ['p', 0],
    };
  }

  public commands({ type }: CommandNodeTypeParams) {
    return {
      createParagraph: () => {
        return setBlockType(type);
      },
    };
  }
}
