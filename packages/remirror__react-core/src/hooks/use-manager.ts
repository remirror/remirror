import { useEffect, useRef, useState } from 'react';
import type { AnyExtension, RemirrorManager } from '@remirror/core';

import { createReactManager } from '../react-helpers';
import type { CreateReactManagerOptions, ReactExtensions } from '../react-types';

/**
 * A hook for creating the editor manager directly in the react component.
 *
 * @remarks
 *
 * The manager is a singleton and doesn't rerender until `manager.destroy()` is
 * called. You should call this method in a `useEffect`
 *
 * This is intentional. However, it's something that can be addressed if it
 * causes issues.
 *
 * ```tsx
 * import { useExtension } from '@remirror/react';
 * import { PresetCore } from 'remirror/preset-core';
 * import { BoldExtension } from 'remirror/extension-bold';
 *
 * const Framework = () => {
 *   const manager = useManager([new BoldExtension(), new CorePreset()]);
 *
 *   <Remirror >
 *     <MyEditor />
 *   </Remirror>;
 * }
 * ```
 *
 * This is intended for internal usage only.
 *
 * @internal
 */
export function useManager<Extension extends AnyExtension = Remirror.Extensions>(
  extensions: (() => Extension[]) | RemirrorManager<ReactExtensions<Extension>>,
  options: CreateReactManagerOptions = {},
): RemirrorManager<ReactExtensions<Extension>> {
  // Store the value in refs so that they can be used in the `useEffect` hook
  // without being passed as dependencies.
  const extensionsRef = useRef(extensions);
  const optionsRef = useRef(options);

  const [manager, setManager] = useState(() => createReactManager(extensions, options));

  // Keep the parameter refs up to date with the latest value.
  extensionsRef.current = extensions;
  optionsRef.current = options;

  // Add a manager destroyed listener to only cleanup the manager when it is
  // destroyed.
  useEffect(() => {
    return manager.addHandler('destroy', () => {
      // `clone` is used to ensure that that any stale extensions are
      // reinitialized.
      setManager(() => createReactManager(extensionsRef.current, optionsRef.current));
    });
  }, [manager]);

  return manager;
}
