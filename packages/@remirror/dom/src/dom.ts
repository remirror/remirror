import type {
  AnyExtension,
  BuiltinPreset,
  EditorState,
  GetSchema,
  PrimitiveSelection,
  RemirrorContentType,
} from '@remirror/core';
import { getDocument, isArray, RemirrorManager } from '@remirror/core';
import { CorePreset, createCoreManager, CreateCoreManagerOptions } from '@remirror/preset-core';

import { DomFramework, DomFrameworkOutput, DomFrameworkProps } from './dom-framework';

/**
 * Create an editor manager. It comes with the `CorePreset` already available.
 */
export function createDomManager<ExtensionUnion extends AnyExtension>(
  extensions: ExtensionUnion[] | (() => ExtensionUnion[]),
  options?: CreateCoreManagerOptions,
): RemirrorManager<CorePreset | BuiltinPreset | ExtensionUnion> {
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
 * const manager = createDomManager([], {});
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
export function createDomEditor<ExtensionUnion extends AnyExtension>(
  props: DomFrameworkProps<ExtensionUnion>,
): DomFrameworkOutput<ExtensionUnion> {
  const { stringHandler, onError, manager, forceEnvironment, element } = props;

  function createStateFromContent(
    content: RemirrorContentType,
    selection?: PrimitiveSelection,
  ): EditorState<GetSchema<ExtensionUnion>> {
    return manager.createState({
      content,
      document: getDocument(forceEnvironment),
      stringHandler,
      selection,
      onError,
    });
  }

  // Create an empty document.
  const fallback = manager.createEmptyDoc();

  const [initialContent, initialSelection] = isArray(props.initialContent)
    ? props.initialContent
    : ([props.initialContent ?? fallback] as const);
  const initialEditorState = createStateFromContent(initialContent, initialSelection);

  const framework = new DomFramework<ExtensionUnion>({
    createStateFromContent,
    getProps: () => props,
    initialEditorState,
    element,
  });

  framework.onFirstRender();

  return framework.frameworkOutput;
}
