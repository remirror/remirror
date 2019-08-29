import { useId } from '@reach/auto-id';
import { usePrevious } from '@remirror/react-hooks';
import { useReducer, useRef } from 'react';
import { useSetA11y } from './multishift-hook-a11y';
import * as MultishiftActions from './multishift-hook-actions';
import { multishiftReducer } from './multishift-hook-reducer';
import {
  MultishiftIdProps,
  MultishiftProps,
  MultishiftRootActions,
  MultishiftState,
} from './multishift-hook-types';
import { callChangeHandlers, getElementIds, getInitialStateProps } from './multishift-hook-utils';

/**
 * Creates the reducer for managing the multishift internal state.
 */
export const useMultishiftReducer = <GItem = any>({ stateReducer, ...props }: MultishiftProps<GItem>) => {
  const initialState = getInitialStateProps<GItem>(props);

  return useReducer((prevState: MultishiftState<GItem>, action: MultishiftRootActions) => {
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
export const useElementIds = (props: MultishiftIdProps) => {
  const defaultId = useId();

  return getElementIds(defaultId, props);
};

/**
 * Get the element references.
 */
const useElementRefs = <GItem = any>() => {
  const toggleButton = useRef(null);
  const input = useRef(null);
  const menu = useRef(null);
  const comboBox = useRef(null);
  const items = useRef<GItem[]>([]);
  items.current = [];

  return {
    toggleButton,
    input,
    menu,
    comboBox,
    items,
  };
};

export const useMultishift = <GItem = any>(props: MultishiftProps<GItem>) => {
  const { customA11yStatusMessage: customStatusMessage, getA11yStatusMessage, a11yStatusTimeout } = props;
  const [state, dispatch] = useMultishiftReducer<GItem>(props);

  const [a11yStatus, setA11yStatus] = useSetA11y({
    state,
    items: props.items,
    customStatusMessage,
    getA11yStatusMessage,
    timeout: a11yStatusTimeout,
  });

  const { highlightedIndexes, highlightedGroupEndIndex, highlightedGroupStartIndex } = state;

  const previousHighlights = usePrevious({
    highlightedIndexes,
    highlightedGroupEndIndex,
    highlightedGroupStartIndex,
  });

  /* Refs */
  const refs = useElementRefs();
  const shouldScroll = useRef(true);

  return {
    a11yStatus,
    setA11yStatus,
    dispatch,

    // Actions
    selectItems: MultishiftActions.selectItems,
    selectItem: MultishiftActions.selectItem,
    setHoverItemIndex: MultishiftActions.setHoverItemIndex,
    toggleMenu: MultishiftActions.toggleMenu,
    closeMenu: MultishiftActions.closeMenu,
    openMenu: MultishiftActions.openMenu,
    setHighlightedIndexes: MultishiftActions.setHighlightedIndexes,
    setHighlightedIndex: MultishiftActions.setHighlightedIndex,
    reset: MultishiftActions.reset,
  };
};
