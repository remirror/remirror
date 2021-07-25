import {
  ApplySchemaAttributes,
  extension,
  ExtensionPriority,
  ExtensionTag,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeViewMethod,
  setStyle,
} from '@remirror/core';

@extension<object>({
  defaultOptions: { priority: ExtensionPriority.High },
})
export class DebugExtension extends NodeExtension {
  get name() {
    return 'debug' as const;
  }

  createTags() {
    return [ExtensionTag.Block, ExtensionTag.ListContainerNode];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      content: 'paragraph+',
      ...override,
      attrs: {
        borderStyle: { default: 'dashed' },
        ...extra.defaults(),
      },
      parseDOM: [{ tag: 'blockquote[data-debug]', getAttrs: extra.parse }],
      toDOM: (node) => ['blockquote', { ...extra.dom(node), 'data-debug': '' }, 0],
    };
  }

  createNodeViews(): NodeViewMethod {
    return (node) => {
      console.log(`NodeViewMethod this.store.view exist: ${!!this.store.view}`);

      const dom = document.createElement('blockquote');
      dom.dataset.debug = '';
      setStyle(dom, {
        borderStyle: 'dashed',
        borderWidth: '1px',
        borderColor: 'red',
      });
      dom.addEventListener('click', () => {
        console.log(`onclick this.store.view exist: ${!!this.store.view}`);
      });
      const update = () => {
        console.log(`update this.store.view exist: ${!!this.store.view}`);
        const canUpdate = false;
        return canUpdate;
      };
      return { dom, contentDOM: dom, update };
    };
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      debug: DebugExtension;
    }
  }
}
