/**
 * Add styles to the provided element.
 *
 * This is useful when using the pure dom to control styles.
 *
 * ```ts
 * import { createDomManager, createDomEditor } from 'remirror/dom';
 * import { BoldExtension } from 'remirror/extensions';
 * import { addStylesToElement, allStyles } from 'remirror/styles/dom';
 *
 * const manager = createDomManager(() => [new BoldExtension()]);
 * const wrapperElement = document.createElement('div');
 * const editor = createDomEditor({ manager, element: wrapperElement });
 *
 * addStylesToElement(wrapperElement, allStyles); // Styles added to element.
 * ```
 *
 * The above snippet will add all styles to the element and all elements it
 * contains.
 */
export function addStylesToElement(element: Element, css: string): void {
  element.classList.add(css);
}
