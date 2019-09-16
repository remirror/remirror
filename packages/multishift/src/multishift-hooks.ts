import { useId } from '@reach/auto-id';
import VisuallyHidden from '@reach/visually-hidden';
import { debounce } from '@remirror/core-helpers';
import { useEffectOnce, useEffectOnUpdate } from '@remirror/react-hooks';
import { createElement, useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { multishiftReducer } from './multishift-reducer';
import {
  A11yStatusMessageParams,
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
  getElementIds,
  getInitialStateProps,
  isOrContainsNode,
} from './multishift-utils';

/**
 * Creates the reducer for managing the multishift internal state.
 */
export const useMultishiftReducer = <GItem = any>({ stateReducer, ...props }: MultishiftProps<GItem>) => {
  const initialState = getInitialStateProps<GItem>(props);

  return useReducer((prevState: MultishiftState<GItem>, action: MultishiftRootActions<GItem>) => {
    const [state, changes] = multishiftReducer(prevState, action, props);
    const changeset = { changes, state, prevState };

    callChangeHandlers(props, changeset);

    if (stateReducer) {
      return stateReducer(changeset, action, props);
    }

    return state;
  }, initialState);
};

/**
 * Creates the ids for identifying the elements in the app.
 */
export const useElementIds = (props: MultishiftA11yIdProps) => {
  const defaultId = useId();

  return getElementIds(defaultId, props);
};

/**
 * Get the element references.
 */
export const useElementRefs = () => {
  const items = useRef<HTMLElement[]>([]);
  const ignored = useRef<HTMLElement[]>([]);
  const toggleButton = useRef<HTMLElement>();
  const input = useRef<HTMLElement>();
  const menu = useRef<HTMLElement>();
  const comboBox = useRef<HTMLElement>();

  // Reset the items ref nodes on each call render.
  items.current = [];
  ignored.current = [];

  return {
    toggleButton,
    input,
    menu,
    comboBox,
    items,
    ignored,
  };
};

const DEFAULT_TIMEOUT = 500;

/**
 * A default getA11yStatusMessage function is provided that will check `items.current.length`
 * and return "No results." or if there are results but no item is highlighted,
 * "resultCount results are available, use up and down arrow keys to navigate."
 * If items are highlighted it will run `itemToString(highlightedItem)` and display
 * the value of the `highlightedItem`.
 */
const defaultGetA11yStatusMessage = <GItem = any>({
  items,
  state: { selectedItems, isOpen },
  itemsToString = defaultItemsToString,
}: A11yStatusMessageParams<GItem>) => {
  if (selectedItems.length) {
    return `${itemsToString(selectedItems)} has been selected.`;
  }

  if (!items) {
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

/**
 * Creates a status element that can be placed in the dom to notify
 *
 * @param status - the message to set as the status
 * @param timeout - the length of time to leave the status active for.
 */
const useA11yStatus = (status: string, timeout = DEFAULT_TIMEOUT) => {
  const [displayedStatus, setDisplayedStatus] = useState('');

  /**
   * Clear the status after a short delay
   */
  const clearStatus = useCallback(
    debounce(timeout, () => {
      setDisplayedStatus('');
    }),
    [setDisplayedStatus],
  );

  useEffect(() => {
    if (!status) {
      return;
    }

    setDisplayedStatus(status);
    clearStatus();
  }, [status]);

  return createElement(
    VisuallyHidden,
    {
      role: 'status',
      'aria-live': 'polite',
      'aria-relevant': 'additions text',
    },
    displayedStatus,
  );
};

interface UseSetA11yProps<GItem = any> {
  state: MultishiftState<GItem>;
  items: GItem[];
  itemsToString?: ItemsToString<GItem>;
  timeout?: number;
  getA11yStatusMessage?: GetA11yStatusMessage<GItem>;
  customA11yStatusMessage?: string;
}

export const useSetA11y = <GItem = any>({
  state,
  items,
  itemsToString = defaultItemsToString,
  timeout = DEFAULT_TIMEOUT,
  getA11yStatusMessage = defaultGetA11yStatusMessage,
  customA11yStatusMessage = '',
}: UseSetA11yProps<GItem>) => {
  const automaticMessage = getA11yStatusMessage({
    state,
    items,
    itemsToString,
  });

  const [status, setStatus] = useState(automaticMessage);

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

  return [useA11yStatus(status, timeout), setStatus] as const;
};

/**
 * This is a hook that listens for events mouse and touch events.
 *
 * When something does occur outside of the registered elements it will dispatch
 * the relevant action.
 */
export const useOuterEventListener = <GItem = any>(
  refs: ReturnType<typeof useElementRefs>,
  state: MultishiftState<GItem>,
  { outerMouseUp, outerTouchEnd }: { outerMouseUp: () => void; outerTouchEnd: () => void },
) => {
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
    ].some(node => {
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
};
