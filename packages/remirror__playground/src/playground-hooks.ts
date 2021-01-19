/**
 * @module
 *
 * A collection of playground specific hooks.
 */

import '@remirror/es-module-shims';

import { useLayoutEffect, useMemo, useState } from 'react';
import type { AnyFunction } from 'remirror';
import { debounce as debounceFn } from '@remirror/core-helpers';

import { LOCAL_MODULE_PREFIX, PLAYGROUND_EXPORTS } from './playground-constants';
import type { PlaygroundExports } from './playground-types';

// Store all the exports from the main playground entrypoint `index.tsx`.
const mainScriptContent = `\
import * as PlaygroundExports from '${LOCAL_MODULE_PREFIX}index.tsx';

window['${PLAYGROUND_EXPORTS}'] = PlaygroundExports;
`;

interface UseUpdateComponentProps {
  /**
   * The debounce timeout in milliseconds. If the value is `0` the debounce will
   * be removed.
   *
   * @default 200
   */
  debounceMs?: number;
}

/**
 * Extracts the `PlaygroundExports` from the window object and provides an
 * update function which can be called to force an update when content changes.
 *
 * Currently this is contained within the same frame as the playground editor.
 * Eventually the renderer and the editor will be hosted on separate domains and
 * communicate with each other via messaging.
 *
 * This model should still work in that environment.
 */
export function usePlaygroundExports(
  props: UseUpdateComponentProps = {},
): [exports: PlaygroundExports | undefined, updateComponent: () => void] {
  const { debounceMs = 200 } = props;
  const [playgroundExports, setPlaygroundExports] = useState<PlaygroundExports>();
  const [unstableValue, forceUpdate] = useState({});

  // Call this to trigger an update in the rendered editor.
  const updateComponent = useMemo(
    () =>
      debounce(debounceMs, () => {
        return forceUpdate({});
      }),
    [debounceMs],
  );

  useLayoutEffect(() => {
    const { promise, dispose } = loadShimScript<PlaygroundExports>(
      mainScriptContent,
      (resolve) => {
        const value = window[PLAYGROUND_EXPORTS];

        if (value) {
          resolve(value);
        }
      },
      {
        // Remove the reference to the
        cleanup: () => {
          window[PLAYGROUND_EXPORTS] = undefined;
        },
      },
    );

    promise.then((value) => {
      setPlaygroundExports(value);
    });

    return dispose;
  }, [unstableValue]);

  return [playgroundExports, updateComponent];
}

/**
 * A debounce function wrapper that only debounces the callback when the timeout
 * is greater than 0.
 */
function debounce<Callback extends AnyFunction>(timeout: number, callback: Callback): Callback {
  return timeout > 0 ? debounceFn(timeout, callback) : callback;
}

interface LoadShimScriptOptions {
  /**
   * Clean up any globals before the first time the capture callback is run..
   */
  cleanup?: () => void;

  /**
   * Maximum time to run the checks for in milliseconds.
   *
   * @default 2500
   */
  timeout?: number;
}

// Defaults used for the `loadScript` method.
const DEFAULT_TIMEOUT = 2500;

/**
 * A utility method for loading a script with a checker method.
 *
 * - The script should only be loaded once in the session.
 * - The promise should resolve only when the check has successfully passed.
 *
 * @param textContent - the content in the editor
 * @param capture - A function which receives a capture callback for capturing
 * the value provided by the script. It is a wrapper around `Promise.resolve()`.
 * When capture is called, the script is defined as loaded. This is run with
 * `requestAnimationFrame` for every render.
 */
function loadShimScript<Value>(
  textContent: string,
  capture: (fn: (value: Value) => void) => void,
  options: LoadShimScriptOptions = {},
): { promise: Promise<Value>; dispose: () => void } {
  const { timeout = DEFAULT_TIMEOUT, cleanup } = options;

  const script = document.createElement('script');
  script.type = 'module-shim';
  script.textContent = textContent;
  type State = 'init' | 'checking' | 'disposed' | 'resolved';
  let state: State = 'init';

  const promise = new Promise<Value>((resolve, reject) => {
    document.head.append(script);
    importShim.load();

    function captureFn(value: Value) {
      resolve(value);
      state = 'resolved';
    }

    const startTime = Date.now();

    function onLoad() {
      if (state === 'init') {
        cleanup?.();
        state = 'checking';
      }

      if (state === 'disposed') {
        return;
      }

      if (Date.now() - startTime >= timeout) {
        reject(new Error('Maximum timeout for capturing a value exceeded.'));
        return;
      }

      capture(captureFn);

      if (state === 'resolved') {
        return;
      }

      // Recursively call `onLoad` in the next animation frame.
      requestAnimationFrame(onLoad);
    }

    onLoad();

    // Add event listeners which are triggered once only.
    // script.addEventListener('load', onLoad, { once: true });
    // script.addEventListener('error', reject, { once: true });
  });

  return {
    promise,
    dispose: () => {
      state = 'disposed';
      cleanup?.();
      script.remove();
    },
  };
}

declare global {
  interface Window {
    [PLAYGROUND_EXPORTS]: PlaygroundExports | undefined;
  }
}
