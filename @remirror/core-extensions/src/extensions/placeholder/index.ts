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
      additionalStyles: {},
    };
  }

  public plugin(): Plugin<PlaceholderPluginState> {
    return createPlaceholderPlugin(this);
  }
}
