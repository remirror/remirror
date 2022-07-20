import { extension, ExtensionPriority, OnSetOptionsProps, PlainExtension } from '@remirror/core';
import { PlaceholderExtension, PlaceholderOptions } from '@remirror/extension-placeholder';
import {
  ReactComponentExtension,
  ReactComponentOptions,
} from '@remirror/extension-react-component';

const DEFAULT_OPTIONS = {
  ...PlaceholderExtension.defaultOptions,
  ...ReactComponentExtension.defaultOptions,
};

const STATIC_KEYS = [...PlaceholderExtension.staticKeys, ...ReactComponentExtension.staticKeys];

export interface ReactExtensionOptions extends PlaceholderOptions, ReactComponentOptions {}

/**
 * This extension supplies all required extensions for the functionality of the
 * `React` framework implementation.
 *
 * Provides support for SSR, Placeholders and React components for components
 * when using **remirror** with React.
 */
@extension<ReactExtensionOptions>({
  defaultOptions: DEFAULT_OPTIONS,
  staticKeys: STATIC_KEYS as any,
})
export class ReactExtension extends PlainExtension<ReactExtensionOptions> {
  get name() {
    return 'react' as const;
  }

  protected onSetOptions(props: OnSetOptionsProps<ReactExtensionOptions>): void {
    const { pickChanged } = props;
    this.getExtension(PlaceholderExtension).setOptions(pickChanged(['placeholder']));
  }

  createExtensions() {
    const {
      emptyNodeClass,
      placeholder,
      defaultBlockNode,
      defaultContentNode,
      defaultEnvironment,
      defaultInlineNode,
      nodeViewComponents,
    } = this.options;

    return [
      new PlaceholderExtension({
        emptyNodeClass,
        placeholder,
        priority: ExtensionPriority.Low,
      }),
      new ReactComponentExtension({
        defaultBlockNode,
        defaultContentNode,
        defaultEnvironment,
        defaultInlineNode,
        nodeViewComponents,
      }),
    ];
  }
}
