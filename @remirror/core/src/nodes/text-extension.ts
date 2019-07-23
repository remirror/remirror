import { NodeExtension } from '../node-extension';

/**
 * The default text passed into the prosemirror schema.
 *
 * @builtin
 */
export class TextExtension extends NodeExtension {
  get name() {
    return 'text' as const;
  }

  get schema() {
    return {
      group: 'inline',
    };
  }
}
