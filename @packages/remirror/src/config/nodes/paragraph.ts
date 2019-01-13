import { SchemaNodeTypeParams } from '../../types';
import { setBlockType } from '../commands';
import { NodeExtension } from '../utils/node-extension';

export class Paragraph extends NodeExtension {
  get name() {
    return 'paragraph';
  }

  get schema() {
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
