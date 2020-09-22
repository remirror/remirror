import {
  ApplySchemaAttributes,
  ExtensionTag,
  MarkExtension,
  MarkExtensionSpec,
  NodeExtension,
  NodeExtensionSpec,
} from 'remirror/core';

/**
 * The top level markup block which holds the different combinations of markup possible.
 */
export class MarkupContainerExtension extends NodeExtension {
  get name() {
    return 'markup' as const;
  }

  tags = [ExtensionTag.BlockNode];

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      content: '(blockMarkup | inlineMarkup | wrappingMarkup)+',
      toDOM() {
        return ['div', 0];
      },
    };
  }
}

/**
 * Purely text content. This is the markup equivalent of the paragraph tag.
 */
export class InlineMarkupExtension extends NodeExtension {
  get name() {
    return 'inlineMarkup' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      content: 'text*',
      toDOM() {
        return ['span', 0];
      },
    };
  }
}

/**
 * Purely content for the DOM.
 */
export class BlockMarkupExtension extends NodeExtension {
  get name() {
    return 'blockMarkup' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      content: 'block',
      toDOM() {
        return ['div', 0];
      },
    };
  }
}

/**
 * Purely content
 */
export class WrappingMarkupExtension extends NodeExtension {
  get name() {
    return 'wrappingMarkup' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      content: 'inlineMarkup blockMarkup inlineMarkup',
      toDOM() {
        return ['div', 0];
      },
    };
  }
}

/**
 * Holds all the marks contained by the markup extension.
 */
export class MarkupExtension extends MarkExtension {
  get name() {
    return 'markup' as const;
  }

  createMarkSpec(extra: ApplySchemaAttributes): MarkExtensionSpec {
    return {
      attrs: {
        ...extra.defaults(),
        markType: {},
        nodeName: {
          default: 'span',
        },
      },
      // Allow the mark to be used multiple times for the same text.
      excludes: '',
    };
  }
}
