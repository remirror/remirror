import { extension, PlainExtension } from '@remirror/core';

export interface NativeBridgeOptions {}

/**
 * Support for communication between the webview and native editor.
 */
@extension<NativeBridgeOptions>({})
export class NativeBridgeExtension extends PlainExtension<NativeBridgeOptions> {
  get name() {
    return 'nativeBridge' as const;
  }
}
