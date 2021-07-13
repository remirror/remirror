import { extension, OnSetOptionsProps, PlainExtension, ProsemirrorPlugin } from '@remirror/core';
import { trailingNode, TrailingNodePluginOptions } from '@remirror/pm/trailing-node';

export interface TrailingNodeOptions extends TrailingNodePluginOptions {
  /**
   * By default this extension will set trailing nodes for all nodes except for
   * the ones that have the tag `Tags.LastNodeCompatible`. Setting this to true
   * means that the only nodes that will be ignored are those passed to the
   * `ignoredNodes` array.
   *
   * @default false
   */
  disableTags?: boolean;
}

/**
 * Ensure that there's always a trailing paragraph at the end of the document.
 *
 * Why? In some scenarios it is difficult to place a cursor after the last element.
 * This ensures there's always space to select the position afterward.
 *
 */
@extension<TrailingNodeOptions>({
  defaultOptions: {
    ignoredNodes: [],
    disableTags: false,
    nodeName: 'paragraph',
  },
})
export class TrailingNodeExtension extends PlainExtension<TrailingNodeOptions> {
  get name() {
    return 'trailingNode' as const;
  }

  /**
   * Whenever the options are changed make sure to update the plugin with the
   * new values and trigger a state update.
   */
  protected onSetOptions(props: OnSetOptionsProps<TrailingNodeOptions>): void {
    const { changes } = props;

    if (changes.disableTags.changed || changes.ignoredNodes.changed || changes.nodeName.changed) {
      this.store.updateExtensionPlugins(this);
    }
  }

  /**
   * Add the trailing node plugin to the editor.
   */
  createExternalPlugins(): ProsemirrorPlugin[] {
    const { tags } = this.store;
    const { disableTags, nodeName } = this.options;

    // The names of the nodes for which this rule should not be applied.
    const ignoredNodes: string[] = disableTags
      ? [...this.options.ignoredNodes]
      : [...this.options.ignoredNodes, ...tags.lastNodeCompatible];

    return [trailingNode({ ignoredNodes, nodeName })];
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      trailingNode: TrailingNodeExtension;
    }
  }
}
