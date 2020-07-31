import { extensionDecorator, PlainExtension } from '@remirror/core';

export interface AnnotationOptions {}

/**
 * An extension for the remirror editor. CHANGE ME.
 */
@extensionDecorator<AnnotationOptions>({})
export class AnnotationExtension extends PlainExtension<AnnotationOptions> {
  get name() {
    return 'annotation' as const;
  }
}
