import type { AnyExtension, BuiltinPreset } from '@remirror/core';
import { isArray, RemirrorManager } from '@remirror/core';
import { CorePreset, createCoreManager, CreateCoreManagerOptions } from '@remirror/preset-core';

import { DomFramework, DomFrameworkOutput, DomFrameworkProps } from './dom-framework';

/**
 * Create an editor manager. It comes with the `CorePreset` already available.
 */
export function createDomManager<Extension extends AnyExtension>(
  extensions: Extension[] | (() => Extension[]),
  options?: CreateCoreManagerOptions,
): RemirrorManager<CorePreset | BuiltinPreset | Extension> {
  return createCoreManager(extensions, options);
}

/**
 * Create the `remirror` editor for the DOM environment.
 *
 * ```ts
 * // Get the element to append the editor to.
 * const element = document.querySelector('#editor');
 *
 * // Create the manager.
 * const manager = createDomManager(() => [], {});
 *
 * // Create the dom editor.
 * const editor = createDomEditor({ element, manager });
 *
 * // Focus at the end of the editor.
 * editor.focus('end');
 *
 * // Insert some text.
 * editor.commands.insertText('Hello Friend!');
 * ```
 */
export function createDomEditor<Extension extends AnyExtension>(
  props: DomFrameworkProps<Extension>,
): DomFrameworkOutput<Extension> {
  const { manager, element } = props;

  // Create an empty document.
  const fallback = manager.createEmptyDoc();

  const [initialContent, initialSelection] = isArray(props.initialContent)
    ? props.initialContent
    : ([props.initialContent ?? fallback] as const);
  const initialEditorState = manager.createState({
    content: initialContent,
    selection: initialSelection,
  });

  const framework = new DomFramework<Extension>({
    getProps: () => props,
    initialEditorState,
    element,
  });

  framework.onFirstRender();

  return framework.frameworkOutput;
}
