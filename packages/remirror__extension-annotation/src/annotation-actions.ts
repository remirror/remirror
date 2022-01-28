import type { Annotation, OmitText, OmitTextAndPosition } from './annotation-types';

export enum ActionType {
  ADD_ANNOTATION,
  REDRAW_ANNOTATIONS,
  REMOVE_ANNOTATIONS,
  SET_ANNOTATIONS,
  UPDATE_ANNOTATION,
}

export interface AddAnnotationAction<Type extends Annotation> {
  type: ActionType.ADD_ANNOTATION;
  from: number;
  to: number;
  annotationData: OmitTextAndPosition<Type>;
}

export interface UpdateAnnotationAction<Type extends Annotation> {
  type: ActionType.UPDATE_ANNOTATION;
  annotationId: string;
  annotationData: OmitTextAndPosition<Type>;
}

export interface RemoveAnnotationsAction {
  type: ActionType.REMOVE_ANNOTATIONS;
  annotationIds: string[];
}

export interface SetAnnotationsAction<Type extends Annotation> {
  type: ActionType.SET_ANNOTATIONS;
  annotations: Array<OmitText<Type>>;
}
