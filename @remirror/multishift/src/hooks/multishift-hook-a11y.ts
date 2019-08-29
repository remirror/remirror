import VisuallyHidden from '@reach/visually-hidden';
import { debounce } from '@remirror/core-helpers';
import { useEffectOnUpdate } from '@remirror/react-hooks';
import { createElement, useCallback, useEffect, useState } from 'react';
import {
  A11yStatusMessageParams,
  GetA11yStatusMessage,
  ItemsToString,
  MultishiftState,
} from './multishift-hook-types';
import { defaultItemsToString } from './multishift-hook-utils';

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
  customStatusMessage?: string;
}

export const useSetA11y = <GItem = any>({
  state,
  items,
  itemsToString = defaultItemsToString,
  timeout = DEFAULT_TIMEOUT,
  getA11yStatusMessage = defaultGetA11yStatusMessage,
  customStatusMessage = '',
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

  // Sets a11y status message on changes in customStatusMessage
  useEffect(() => {
    if (customStatusMessage) {
      setStatus(customStatusMessage);
    }
  }, [customStatusMessage]);

  return [useA11yStatus(status, timeout), setStatus] as const;
};
