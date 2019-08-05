import { css } from '@emotion/core';
import { Extension, Plugin } from '@remirror/core';
import { createMulticursorPlugin } from './multicursor-plugin';
import { MulticursorExtensionOptions } from './multicursor-types';
import { blink } from './multicursor-utils';

export class MulticursorExtension extends Extension<MulticursorExtensionOptions> {
  get name() {
    return 'multicursor' as const;
  }

  get defaultOptions() {
    return {
      cursor: '|',
      cursorClassName: 'multicursor-blinking',
      clickActivationKey: 'metaKey' as 'metaKey',
      cursorColor: 'black',
    };
  }

  /**
   * Add cursor blinking styles for the editor.
   */
  public styles() {
    return css`
      .multicursor-blinking {
        box-sizing: border-box;
        border-left: 1px solid;
        animation: ${blink(this.options.cursorColor)} 1s step-end infinite;
      }
      .multicursor-selection {
        display: inherit; /* FIXME me! */
      }
    `;
  }

  public enabled() {
    return {
      add: () => true,
      toggle: () => true,
    };
  }

  public active() {
    return {
      add: () => true,
      toggle: () => true,
    };
  }

  public commands() {
    return {
      addMulticursor: () => () => true,
      toggleMulticursor: () => () => true,
    };
  }

  public plugin(): Plugin {
    return createMulticursorPlugin(this);
  }
}
