import { EntityReferenceMetaData } from '../types';

/**
 * Helper function to extract the extreme boundaries of the passed array of highlights.
 * minimum `from` and the maximum `to`
 */
export const findMinMaxRange = (
  array: Array<Pick<EntityReferenceMetaData, 'from' | 'to'>>,
): [number, number] => {
  const min = Math.min(...array.map((a) => a.from));
  const max = Math.max(...array.map((a) => a.to));
  return [min, max];
};
