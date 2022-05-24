import type { GetHandler } from '@remirror/core';
import { DocChangedExtension, DocChangedOptions } from '@remirror/core';

import { useExtensionEvent } from './use-extension-event';

/**
 * A hook for subscribing to transactions that change the document
 */
export function useDocChanged(
  handler: NonNullable<GetHandler<DocChangedOptions>['docChanged']>,
): void {
  useExtensionEvent(DocChangedExtension, 'docChanged', handler);
}
