import { Decoration } from 'remirror';
import type { AcceptUndefined } from '@remirror/core';

export enum ActionType {
  REDRAW_ENTITY_REFERENCES,
}
export interface Range {
  /**
   * Document position where the range starts
   */
  from: number;
  /**
   * Document position where the range ends
   */
  to: number;
}
export interface EntityReferenceMetaData extends Range {
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
  createId?: () => string;
}

export interface EntityReferencePluginState extends Required<EntityReferenceOptions> {
  entityReferences: EntityReferenceMetaData[][];
}
