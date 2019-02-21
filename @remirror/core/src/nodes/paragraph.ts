import { setBlockType } from '../commands';
import { NodeExtension } from '../node-extension';
import { NodeExtensionSpec, SchemaNodeTypeParams } from '../types';

export class Paragraph extends NodeExtension {
  get name() {
    return 'paragraph';
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

  public commands({ type }: SchemaNodeTypeParams) {
    return () => {
      return setBlockType(type);
    };
  }
}
