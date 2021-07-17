import { useId } from '@reach/auto-id';
import { setStatus } from 'a11y-status';
import type { DependencyList, Dispatch, EffectCallback, MutableRefObject } from 'react';
import { useEffect, useReducer, useRef } from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import useShallowCompareEffect from 'react-use/lib/useShallowCompareEffect';
import { isEmptyArray } from '@remirror/core-helpers';

import { multishiftReducer } from './multishift-reducer';
import type {
  A11yStatusMessageProps,
  GetA11yStatusMessage,
  ItemsToString,
  MultishiftA11yIdProps,
  MultishiftProps,
  MultishiftRootActions,
  MultishiftState,
} from './multishift-types';
import {
  callChangeHandlers,
  defaultItemsToString,
  GetElementIds,
  getElementIds,
  getInitialStateProps,
  isOrContainsNode,
} from './multishift-utils';

/**
 * Creates the reducer for managing the multishift internal state.
 */
export function useMultishiftReducer<Item = any>(
  props: MultishiftProps<Item>,
): [MultishiftState<Item>, Dispatch<MultishiftRootActions<Item>>] {
  const { stateReducer, ...rest } = props;
  const initialState = getInitialStateProps<Item>(rest);

  return useReducer((prevState: MultishiftState<Item>, action: MultishiftRootActions<Item>) => {
    const [state, changes] = multishiftReducer(prevState, action, rest);
    const changeset = { changes, state, prevState };

    callChangeHandlers(rest, changeset);

    if (stateReducer) {
      return stateReducer(changeset, action, rest);
    }

    return state;
  }, initialState);
}

/**
 * Creates the ids for identifying the elements in the app.
 */
export function useElementIds(props: MultishiftA11yIdProps): GetElementIds {
  const defaultId = useId();

  return getElementIds(defaultId ?? '', props);
}

interface UseElementRefs {
  toggleButton: MutableRefObject<HTMLElement | undefined>;
  input: MutableRefObject<HTMLElement | undefined>;
  menu: MutableRefObject<HTMLElement | undefined>;
  comboBox: MutableRefObject<HTMLElement | undefined>;
  items: MutableRefObject<HTMLElement[]>;
  ignored: MutableRefObject<HTMLElement[]>;
}

/**
 * Get the element references.
 */
export function useElementRefs(): UseElementRefs {
  const items = useRef<HTMLElement[]>([]);
  const ignored = useRef<HTMLElement[]>([]);
  const toggleButton = useRef<HTMLElement>();
  const input = useRef<HTMLElement>();
  const menu = useRef<HTMLElement>();
  const comboBox = useRef<HTMLElement>();

  // Reset the items ref nodes on each call render.
  items.current = [];
  ignored.current = [];

  return useRef({ toggleButton, input, menu, comboBox, items, ignored }).current;
}

/**
 * A default getA11yStatusMessage function is provided that will check `items.current.length`
 * and return "No results." or if there are results but no item is highlighted,
 * "resultCount results are available, use up and down arrow keys to navigate."
 * If items are highlighted it will run `itemToString(highlightedItem)` and display
 * the value of the `highlightedItem`.
 */
const defaultGetA11yStatusMessage = <Item = any>({
  items,
  state: { selectedItems, isOpen },
  itemsToString = defaultItemsToString,
}: A11yStatusMessageProps<Item>) => {
  if (!isEmptyArray(selectedItems)) {
    return `${itemsToString(selectedItems)} has been selected.`;
  }

  if (isEmptyArray(items)) {
    return '';
  }

  const resultCount = items.length;

  if (isOpen) {
    if (resultCount === 0) {
      return 'No results are available';
    }

    return `${resultCount} result${
      resultCount === 1 ? ' is' : 's are'
    } available, use up and down arrow keys to navigate. Press Enter key to select.`;
  }

  return '';
};

interface UseSetA11yProps<Item = any> {
  state: MultishiftState<Item>;
  items: Item[];
  itemsToString?: ItemsToString<Item>;
  getA11yStatusMessage?: GetA11yStatusMessage<Item>;
  customA11yStatusMessage?: string;
}

export function useSetA11y<Item = any>(props: UseSetA11yProps<Item>): void {
  const {
    state,
    items,
    itemsToString = defaultItemsToString,
    getA11yStatusMessage = defaultGetA11yStatusMessage,
    customA11yStatusMessage = '',
  } = props;
  const automaticMessage = getA11yStatusMessage({
    state,
    items,
    itemsToString,
  });

  // Sets a11y status message on changes to relevant state values.
  useEffectOnUpdate(() => {
    setStatus(automaticMessage);
  }, [state.isOpen, state.selectedItems]);

  // Sets a11y status message on changes in customA11yStatusMessage
  useEffect(() => {
    if (customA11yStatusMessage) {
      setStatus(customA11yStatusMessage);
    }
  }, [customA11yStatusMessage]);
}

/**
 * This is a hook that listens for events mouse and touch events.
 *
 * When something does occur outside of the registered elements it will dispatch
 * the relevant action.
 */
export function useOuterEventListener<Item = any>(
  refs: ReturnType<typeof useElementRefs>,
  state: MultishiftState<Item>,
  { outerMouseUp, outerTouchEnd }: { outerMouseUp: () => void; outerTouchEnd: () => void },
): MutableRefObject<{
  isMouseDown: boolean;
  isTouchMove: boolean;
  lastBlurred: HTMLElement | undefined;
}> {
  const context = useRef({
    isMouseDown: false,
    isTouchMove: false,
    lastBlurred: undefined as HTMLElement | undefined,
  });

  const isOpen = useRef(state.isOpen);
  isOpen.current = state.isOpen;

  const targetWithinMultishift = (target: Node | null, checkActiveElement = true) => {
    return [
      refs.comboBox.current,
      refs.menu.current,
      refs.toggleButton.current,
      refs.input.current,
      ...refs.ignored.current,
      ...refs.items.current,
    ].some((node) => {
      return (
        node &&
        (isOrContainsNode(node, target) ||
          (checkActiveElement && isOrContainsNode(node, window.document.activeElement)))
      );
    });
  };

  useEffectOnce(() => {
    // Borrowed from `downshift`
    // context.current.isMouseDown helps us track whether the mouse is currently held down.
    // This is useful when the user clicks on an item in the list, but holds the mouse
    // down long enough for the list to disappear (because the blur event fires on the input)
    // context.current.isMouseDown is used in the blur handler on the input to determine whether the blur event should
    // trigger hiding the menu.
    const onMouseDown = () => {
      context.current.isMouseDown = true;
    };

    const onMouseUp = (event: MouseEvent) => {
      context.current.isMouseDown = false;
      // if the target element or the activeElement is within a multishift node
      // then we don't want to reset multishift
      const contextWithinMultishift = targetWithinMultishift(event.target as Node);

      if (!contextWithinMultishift && isOpen.current) {
        outerMouseUp();
      }
    };

    // Borrowed from `downshift`
    // Touching an element in iOS gives focus and hover states, but touching out of
    // the element will remove hover, and persist the focus state, resulting in the
    // blur event not being triggered.
    // context.current.isTouchMove helps us track whether the user is tapping or swiping on a touch screen.
    // If the user taps outside of Multishift, the component should be reset,
    // but not if the user is swiping
    const onTouchStart = () => {
      context.current.isTouchMove = false;
    };

    const onTouchMove = () => {
      context.current.isTouchMove = true;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const contextWithinMultishift = targetWithinMultishift(event.target as Node, false);

      if (!context.current.isTouchMove && !contextWithinMultishift && isOpen.current) {
        outerTouchEnd();
      }
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  });

  return context;
}

/**
 * A hook for managing multiple timeouts.
 *
 * @remarks
 *
 * All timeouts are automatically cleared when un-mounting.
 */
export function useTimeouts(): Readonly<[(fn: () => void, time?: number) => void, () => void]> {
  const timeoutIds = useRef<any[]>([]);

  const setHookTimeout = (fn: () => void, time = 1) => {
    const id = setTimeout(() => {
      timeoutIds.current = timeoutIds.current.filter((timeoutId) => timeoutId !== id);
      fn();
    }, time);

    timeoutIds.current.push(id);
  };

  const clearHookTimeouts = () => {
    timeoutIds.current.forEach((id) => {
      clearTimeout(id);
    });

    timeoutIds.current = [];
  };

  // Clear the timeouts on dismount
  useEffectOnce(() => clearHookTimeouts);

  return [setHookTimeout, clearHookTimeouts] as const;
}

/**
 * React effect hook that ignores the first invocation (e.g. on mount).
 *
 * @remarks
 *
 * The signature is exactly the same as the useEffect hook.
 *
 * ```tsx
 * import React from 'react'
 * import { useEffectOnUpdate } from 'react-use';
 *
 * const Demo = () => {
 *   const [count, setCount] = React.useState(0);
 *
 *   React.useEffect(() => {
 *     const interval = setInterval(() => {
 *       setCount(count => count + 1)
 *     }, 1000)
 *
 *     return () => {
 *       clearInterval(interval)
 *     }
 *   }, [])
 *
 *   useEffectOnUpdate(() => {
 *     log('count', count) // will only show 1 and beyond
 *
 *     return () => { // *OPTIONAL*
 *       // do something on unmount
 *     }
 *   }) // you can include deps array if necessary
 *
 *   return <div>Count: {count}</div>
 * };
 * ```
 */
export function useEffectOnUpdate(effect: EffectCallback, dependencies: DependencyList): void {
  const isInitialMount = useRef(true);

  useShallowCompareEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      return effect();
    }
  }, [dependencies]);
}

/**
 * React lifecycle hook that calls a function when the component will unmount.
 *
 * @remarks
 *
 * Try `useEffectOnce` if you need both a mount and unmount function.
 *
 * ```jsx
 * import {useUnmount} from 'react-use';
 *
 * const Demo = () => {
 *   useUnmount(() => log('UNMOUNTED'));
 *   return null;
 * };
 * ```
 */
export function useUnmount(fn: () => void | undefined): void {
  useEffectOnce(() => fn);
}
