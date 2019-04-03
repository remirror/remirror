import { Extension, Plugin } from '@remirror/core';
import { EMPTY_NODE_CLASS_NAME } from '../../constants';
import { PlaceholderOptions, PlaceholderPluginState } from '../types';
import { createPlaceholderPlugin } from './plugin';

export class Placeholder extends Extension<PlaceholderOptions> {
  get name() {
    return 'placeholder' as const;
  }

  get defaultOptions() {
    return {
      emptyNodeClass: EMPTY_NODE_CLASS_NAME,
      placeholderStyles: {},
    };
  }

  public styles() {
    const selector = `.${this.options.emptyNodeClass}:first-of-type::before`;
    return [
      `
       ${selector} {
        position: absolute;
        color: #aaa;
        pointer-events: none;
        height: 0;
        font-style: italic;
        content: attr(data-placeholder);
      }
    `,
      { [selector]: this.options.placeholderStyle },
    ];
  }

  public plugin(): Plugin<PlaceholderPluginState> {
    return createPlaceholderPlugin(this);
  }

  /**
   * When the view becomes available set the aria placeholder property.
   */
  public attributes() {
    return { 'aria-placeholder': this.options.placeholder };
  }
}
