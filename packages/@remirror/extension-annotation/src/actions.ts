import type { Annotation, AnnotationData } from './types';

export enum ActionType {
  ADD_ANNOTATION,
  REMOVE_ANNOTATIONS,
  SET_ANNOTATIONS,
}

export interface AddAnnotationAction<A extends Annotation> {
  type: ActionType.ADD_ANNOTATION;
  from: number;
  to: number;
  annotationData: AnnotationData<A>;
}

export interface RemoveAnnotationsAction {
  type: ActionType.REMOVE_ANNOTATIONS;
  annotationIds: string[];
}

export interface SetAnnotationsAction<A extends Annotation> {
  type: ActionType.SET_ANNOTATIONS;
  annotations: A[];
}
