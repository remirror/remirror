import type { AcceptUndefined, Decoration, FromToProps } from '@remirror/core';

export interface EntityReferenceMetaData extends FromToProps {
  /**
   * Unique identifier of the entity references
   */
  id: string;
  /**
   * Text content of the node
   */
  text: string;
}

export type OmitId<Type extends EntityReferenceMetaData> = Omit<Type, 'id'>;

export interface EntityReferenceOptions {
  /**
   * Method to calculate styles
   *
   * @remarks
   *
   * This can be used e.g. to assign different shades of a color depending on
   * the amount of entity references in a segment.
   */
  getStyle?: (entityReferences: EntityReferenceMetaData[][]) => Decoration[];
  blockSeparator?: AcceptUndefined<string>;
  onClickMark?: (entityReferences?: EntityReferenceMetaData[]) => void;
}

export interface EntityReferencePluginState extends Required<EntityReferenceOptions> {
  entityReferences: EntityReferenceMetaData[][];
}
