import { extension, ExtensionPriority, OnSetOptionsProps, PlainExtension } from '@remirror/core';
import { PlaceholderOptions } from '@remirror/extension-placeholder';
import {
  ReactComponentExtension,
  ReactComponentOptions,
} from '@remirror/extension-react-component';
import { ReactSsrExtension, ReactSsrOptions } from '@remirror/extension-react-ssr';

import { ReactPlaceholderExtension } from './react-placeholder-extension';

const DEFAULT_OPTIONS = {
  ...ReactSsrExtension.defaultOptions,
  ...ReactPlaceholderExtension.defaultOptions,
  ...ReactComponentExtension.defaultOptions,
};

const STATIC_KEYS = [
  ...ReactSsrExtension.staticKeys,
  ...ReactPlaceholderExtension.staticKeys,
  ...ReactComponentExtension.staticKeys,
];

export interface ReactExtensionOptions
  extends ReactSsrOptions,
    PlaceholderOptions,
    ReactComponentOptions {}

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
    this.getExtension(ReactPlaceholderExtension).setOptions(pickChanged(['placeholder']));
  }

  createExtensions() {
    const {
      transformers,
      emptyNodeClass,
      placeholder,
      defaultBlockNode,
      defaultContentNode,
      defaultEnvironment,
      defaultInlineNode,
      nodeViewComponents,
    } = this.options;

    return [
      new ReactSsrExtension({ transformers }),
      new ReactPlaceholderExtension({
        emptyNodeClass,
        placeholder,
        priority: ExtensionPriority.Medium,
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
