import { Annotation } from '.';
import {
  AnnotationStore,
  MapLike,
  OmitText,
  OmitTextAndPosition,
  TransformedAnnotation,
} from './annotation-types';

export class MapLikeAnnotationStore<Type extends Annotation> implements AnnotationStore<Type> {
  /**
   * @param map a custom map-like object for storing internal annotations
   */
  constructor(
    protected readonly map: MapLike<string, TransformedAnnotation<OmitText<Type>>> = new Map(),
    private readonly positionToStored: (pos: number) => any = (pos) => pos,
    private readonly positionFromStored: (storedPos: any) => number | null = (storedPos) =>
      storedPos,
  ) {}

  addAnnotation({ from, to, ...annotation }: OmitText<Type>): void {
    // XXX: Review cast
    const storedAnnotation: TransformedAnnotation<OmitText<Type>> = {
      from: this.positionToStored(from),
      to: this.positionToStored(to),
      ...annotation,
    } as TransformedAnnotation<OmitText<Type>>;
    this.map.set(annotation.id, storedAnnotation);
  }

  updateAnnotation(id: string, data: OmitTextAndPosition<Type>): void {
    const existing = this.map.get(id);

    if (!existing) {
      return;
    }

    this.map.set(id, {
      ...existing,
      ...data,
    });
  }

  removeAnnotations(ids: string[]): void {
    ids.forEach((id) => {
      this.map.delete(id);
    });
  }

  setAnnotations(annotations: Array<OmitText<Type>>): void {
    // `clear` is optional for historic reasons: Older versions of the Yjs maps
    // didn't provide it.
    if (typeof this.map.clear === 'function') {
      this.map.clear();
    } else {
      this.map.forEach((annotation) => this.map.delete(annotation.id));
    }

    annotations.forEach((annotation) => {
      this.addAnnotation(annotation);
    });
  }

  formatAnnotations(): Array<OmitText<Type>> {
    const annotations: Array<OmitText<Type>> = [];

    this.map.forEach(({ from: storedFrom, to: storedTo, ...storedData }) => {
      const from = this.positionFromStored(storedFrom);
      const to = this.positionFromStored(storedTo);

      if (!from || !to) {
        return;
      }

      // XXX: Review cast
      const annotation: OmitText<Type> = {
        from,
        to,
        ...storedData,
      } as unknown as OmitText<Type>;
      annotations.push(annotation);
    });

    return annotations;
  }
}
