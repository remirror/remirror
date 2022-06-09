import { EntityReferenceMetaData } from '../types';
import { findMinMaxRange } from './ranges';

/**
 * Util function to partition an array of entityReferences into two
 * sub-arrays based on the passed callback `filter`
 */
function partitionEntityReferences<EntityReferenceMetaData>(
  array: EntityReferenceMetaData[],
  filter: (val: EntityReferenceMetaData) => boolean,
): [EntityReferenceMetaData[], EntityReferenceMetaData[]] {
  const matches = array.filter((e) => filter(e));
  const notMatches = array.filter((e) => !filter(e));
  return [matches, notMatches];
}

const joinDisjoinedEntityReference = (
  entityReferences: EntityReferenceMetaData[],
  entityReference: EntityReferenceMetaData,
) => {
  const { id, text } = entityReference;

  if (entityReference.from >= entityReference.to) {
    return entityReferences; // Sanity check.
  }

  // Find outer bound of all marks belong to the entityReference
  const [same, diff] = partitionEntityReferences(entityReferences, (h) => h.id === id);
  const [from, to] = findMinMaxRange([...same, entityReference]);
  let fullText = same.map((h) => h.text).join(' ');
  // Respect existing keys and merge them into the new entityReference.
  const newEntityReference: EntityReferenceMetaData = {
    ...entityReference,
    from,
    to,
    text: (fullText += text),
  };
  return [...diff, newEntityReference];
};

/**
 * @returns entityReferences joined by ID
 */
export const joinDisjoinedEntityReferences = (
  disjoinedEntityReferences: EntityReferenceMetaData[],
): EntityReferenceMetaData[] => {
  let joinedEntityReferences: EntityReferenceMetaData[] = [];

  for (const disjoinedEntityReference of disjoinedEntityReferences) {
    joinedEntityReferences = joinDisjoinedEntityReference(
      joinedEntityReferences,
      disjoinedEntityReference,
    );
  }

  return joinedEntityReferences;
};
