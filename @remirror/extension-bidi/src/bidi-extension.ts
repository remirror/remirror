import direction from 'direction';

import {
  DefaultExtensionOptions,
  ExtraAttributesObject,
  ExtraSchemaAttributes,
  isString,
  PlainExtension,
} from '@remirror/core';

export interface BidiOptions {
  /**
   * This is the direction that is used when the algorithm is not quite sure.
   */
  defaultDirection?: null | 'ltr' | 'rtl';
}

/**
 * An extension which adds bidirectional text support to your editor.
 *
 * TODO add support for custom options. For example the default direction should be configuraable.
 */
export class BidiExtension extends PlainExtension<BidiOptions> {
  static readonly defaultOptions: DefaultExtensionOptions<BidiOptions> = {
    defaultDirection: null,
  };

  get name() {
    return 'bidi' as const;
  }

  createExtraSchemaAttributes = (): ExtraSchemaAttributes[] => {
    return [
      {
        identifiers: 'nodes',
        attributes: { dir: this.dir() },
      },
    ];
  };

  /**
   * Create the `SchemaAttributesObject`
   */
  private dir(): ExtraAttributesObject {
    return {
      default: this.options.defaultDirection,
      parseDOM: (element) => element.getAttribute('dir') ?? this.getDirection(element.textContent),
      toDOM: (_, { node }) => {
        if (!node) {
          return;
        }

        if (!node.textContent) {
          return;
        }

        return this.getDirection(node.textContent) ?? this.options.defaultDirection;
      },
    };
  }

  /**
   * Get the direction of the text.
   */
  private getDirection(text: string | undefined | null) {
    if (!isString(text)) {
      return;
    }

    const dir = direction(text);

    if (dir === 'neutral') {
      return this.options.defaultDirection;
    }

    return dir;
  }
}
