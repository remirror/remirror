import { isNumber, pick, sort, uniqueArray } from '@remirror/core-helpers';
import { AnyFunction } from '@remirror/core-types';
import Downshift from 'downshift';
import { SyntheticEvent } from 'react';
import {
  AllStateChangeTypes,
  MultishiftStateChangeOptions,
  SetMultiHighlightIndexesParam,
} from './multishift-types';

/**
 * This is intended to be used to compose event handlers.
 * They are executed in order until one of them sets
 * `event.preventDownshiftDefault = true`.
 */
export const callAllEventHandlers = <
  GEvent extends Event = any,
  GElement extends Element = any,
  GSyntheticEvent extends SyntheticEvent<GElement, GEvent> = SyntheticEvent<GElement, GEvent>,
  GFunction extends (event: GSyntheticEvent, ...args: any[]) => void = AnyFunction
>(
  ...fns: Array<GFunction | undefined | null | false>
) => {
  return (event: GSyntheticEvent, ...args: any[]) => {
    fns.some(fn => {
      if (fn) {
        fn(event, ...args);
      }

      return (
        event.preventDownshiftDefault ||
        (event.hasOwnProperty('nativeEvent') && event.nativeEvent.preventDownshiftDefault)
      );
    });
  };
};

/**
 * Pick the keys from the state.
 */
export const pickStateKeysOnly = (state: Partial<MultishiftStateChangeOptions> = {}) =>
  pick(state, [
    'multiHighlightEndIndex',
    'highlightedIndex',
    'multiHighlightStartIndex',
    'multiHighlightIndexes',
    'inputValue',
    'isOpen',
    'selectedItems',
    'type',
  ]);

/**
 * The default selectedItemsToString function.
 *
 * Creates a comma separated string of the item string values.
 *
 * @param selectedItems - the list of all selected items
 * @param itemToString - retrieve the string from an individual
 */
export const defaultSelectedItemsToString = <GItem extends unknown = any>(
  selectedItems: GItem[],
  itemToString: (item: GItem) => string = item => String(item),
) => selectedItems.map(itemToString!).join(', ');

/**
 * Check that a number is within the minimum and maximum bounds of a set of numbers.
 */
export const within = (value: number, ...rest: Array<number | undefined | null>) => {
  const numbers: number[] = rest.filter<number>(isNumber);
  return value >= Math.min(...numbers) && value <= Math.max(...numbers);
};

/**
 * Check if the browser is a mac.
 */
export const isMac = () => /Mac/.test(navigator.platform);

/**
 * Get an array of the event modifiers
 */
export const getModifiers = (event: {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}) => (['altKey', 'shiftKey', 'metaKey', 'ctrlKey'] as const).filter(key => event[key]);

/**
 * Ensure the provided object has a type to the object when not provided.
 */
export const withType = <GType extends { type?: AllStateChangeTypes }>({ type, ...rest }: GType) => ({
  ...rest,
  type: type || Downshift.stateChangeTypes.unknown,
});

/**
 * Normalizes the 'key' property of a KeyboardEvent in IE/Edge
 *
 * @param event - the keyboard event
 */
export const normalizeArrowKey = <GEvent extends KeyboardEvent = any>(event: GEvent) => {
  // tslint:disable-next-line: deprecation
  const { key, keyCode } = event;

  if (keyCode >= 37 && keyCode <= 40 && key.indexOf('Arrow') !== 0) {
    return `Arrow${key}`;
  }

  if (key === 'Esc') {
    return 'Escape';
  }

  if (key === 'Del') {
    return 'Delete';
  }

  return key;
};

/**
 * Create a range from start to end.
 *
 * If only start is provided it creates an array of the size provided.
 * if start and end are provided it creates an array who's first position is
 * start and final position is end. i.e. `length = (end - start) + 1`
 */
export const range = (start: number, end?: number) => {
  return !isNumber(end)
    ? Array.from({ length: Math.abs(start) }, (_, index) => (start < 0 ? -1 : 1) * index)
    : start <= end
    ? Array.from({ length: end + 1 - start }, (_, index) => index + start)
    : Array.from({ length: start + 1 - end }, (_, index) => -1 * index + start);
};

export const getAllMultiHighlightIndexes = ({ start, end, indexes }: SetMultiHighlightIndexesParam) => {
  const extra = isNumber(start) ? range(start, end || start) : [];
  return uniqueAndSortedIndexes([...indexes, ...extra]);
};

export const uniqueAndSortedIndexes = (indexes: number[]) => {
  return uniqueArray(sort(indexes, (a, b) => a - b));
};

export const checkItemHighlighted = (index: number, { start, end, indexes }: SetMultiHighlightIndexesParam) =>
  indexes.includes(index) || within(index, start, end);
