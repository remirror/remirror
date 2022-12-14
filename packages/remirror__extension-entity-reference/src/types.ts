import type {
  AcceptUndefined,
  Decoration,
  FromToProps,
  Handler,
  ProsemirrorAttributes,
} from '@remirror/core';

export interface EntityReferenceAttributes {
  /**
   * Unique identifier of the entity references
   */
  id: string;
}

export interface EntityReferenceMetaData extends EntityReferenceAttributes, FromToProps {
  /**
   * Text content of the node
   */
  text: string;

  /**
   * Only present if you have configured extra attributes for the entity reference mark
   */
  attrs?: ProsemirrorAttributes;
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
  onClick?: Handler<(entityReference: EntityReferenceMetaData) => void>;
}

export interface EntityReferencePluginState extends Required<EntityReferenceOptions> {
  entityReferences: EntityReferenceMetaData[][];
}
