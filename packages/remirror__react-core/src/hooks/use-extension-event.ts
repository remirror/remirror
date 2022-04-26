import { useCallback } from 'react';
import {
  AnyExtensionConstructor,
  CustomHandler,
  GetCustomHandler,
  GetHandler,
  Handler,
  OptionsOfConstructor,
} from '@remirror/core';

import { useExtension } from './use-extension';

/**
 * Dynamically add event handlers to your extension.
 *
 * @remarks
 *
 * Please note that every time the properties change your extension is updated.
 * You will want to memoize or prevent needless updates somehow to the
 * properties passed in.
 *
 * This is only available within the context of the `Remirror` it will
 * throw an error otherwise.
 *
 * ```tsx
 * import { useCallback } from 'react';
 * import { HistoryExtension } from 'remirror/extensions';
 * import { useExtensionEvent } from '@remirror/react';
 *
 * const Editor = ({ placeholder = 'Your magnum opus' }) => {
 *   useExtensionEvent(
 *     HistoryExtension,
 *     'onRedo',
 *     useCallback(
 *       () => log('a redo just happened'),
 *       [],
 *     ),
 *   );
 *
 *   return null;
 * };
 * ```
 *
 * These hooks can serve as the building blocks when customizing your editor
 * experience with `remirror`.
 */
export function useExtensionEvent<
  Type extends AnyExtensionConstructor,
  Key extends keyof GetHandler<OptionsOfConstructor<Type>>,
>(
  extension: Type,
  event: Key,
  memoizedHandler: Handler<GetHandler<OptionsOfConstructor<Type>>[Key]>,
): void {
  return useExtension(
    extension,
    useCallback(({ addHandler }) => addHandler(event, memoizedHandler), [memoizedHandler, event]),
    [],
  );
}

/**
 * Dynamically add custom event handlers to your extension.
 *
 * @remarks
 *
 * Please note that every time the properties change your extension is updated.
 * You will want to memoize or prevent needless updates somehow to the
 * properties passed in.
 *
 * This is only available within the context of the `Remirror` it will
 * throw an error otherwise.
 *
 * These hooks can serve as the building blocks when customizing your editor
 * experience with `remirror`.
 */
export function useExtensionCustomEvent<
  Type extends AnyExtensionConstructor,
  Key extends keyof GetCustomHandler<OptionsOfConstructor<Type>>,
>(
  extension: Type,
  event: Key,
  memoizedCustomHandler: CustomHandler<GetCustomHandler<OptionsOfConstructor<Type>>[Key]>,
): void {
  return useExtension(
    extension,
    useCallback(
      ({ addCustomHandler }) => addCustomHandler(event, memoizedCustomHandler),
      [memoizedCustomHandler, event],
    ),
    [],
  );
}
