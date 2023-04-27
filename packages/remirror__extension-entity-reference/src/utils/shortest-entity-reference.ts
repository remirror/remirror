import { EntityReferenceMetaData } from '../types';

type EntityReferenceMarkText = Pick<EntityReferenceMetaData, 'text'>;

/**
 * This helper can be used when reacting to clicks on overlapping highlights.
 * In that case, the app should show the shortest entity because longer entities
 * typical have other click areas.
 *
 * @param entityReferences
 * @returns entity references with the shortest text
 */
export const getShortestEntityReference = <T extends EntityReferenceMarkText>(
  entityReferences: T[],
): T | undefined => entityReferences.sort(({ text: a }, { text: b }) => a.length - b.length)[0];
