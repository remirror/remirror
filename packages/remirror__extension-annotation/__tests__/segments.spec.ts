import type { Annotation } from '../';
import { toSegments } from '../src/annotation-segments';

let idCounter = 0;

function createAnnotation(from: number, to: number): Annotation {
  return {
    id: `a-${idCounter++}`,
    from,
    to,
    text: '-',
  };
}

describe('#toSegments', () => {
  it('creates segment for single annotation', () => {
    const annotation1 = createAnnotation(2, 4);

    const segments = toSegments([annotation1]);

    expect(segments).toEqual([
      {
        from: 2,
        to: 4,
        annotations: [annotation1],
      },
    ]);
  });

  it('creates segments for non-overlapping annotations', () => {
    const annotation1 = createAnnotation(2, 4);
    const annotation2 = createAnnotation(6, 8);

    const segments = toSegments([annotation1, annotation2]);

    expect(segments).toEqual([
      {
        from: 2,
        to: 4,
        annotations: [annotation1],
      },
      {
        from: 6,
        to: 8,
        annotations: [annotation2],
      },
    ]);
  });

  it('creates segments for overlapping annotations', () => {
    const annotation1 = createAnnotation(2, 4);
    const annotation2 = createAnnotation(3, 5);

    const segments = toSegments([annotation1, annotation2]);

    expect(segments).toEqual([
      {
        from: 2,
        to: 3,
        annotations: [annotation1],
      },
      {
        from: 3,
        to: 4,
        annotations: [annotation1, annotation2],
      },
      {
        from: 4,
        to: 5,
        annotations: [annotation2],
      },
    ]);
  });

  it('returns empty for no annotations', () => {
    expect(toSegments([])).toEqual([]);
  });

  it('creates segment for annotation at begin of content', () => {
    const annotation1 = createAnnotation(0, 2);

    const segments = toSegments([annotation1]);

    expect(segments).toEqual([
      {
        from: 0,
        to: 2,
        annotations: [annotation1],
      },
    ]);
  });

  it('creates segments for multiple overlapping annotations', () => {
    const annotation1 = createAnnotation(2, 4);
    const annotation2 = createAnnotation(3, 5);
    const annotation3 = createAnnotation(4, 6);

    const segments = toSegments([annotation1, annotation2, annotation3]);

    expect(segments).toEqual([
      {
        from: 2,
        to: 3,
        annotations: [annotation1],
      },
      {
        from: 3,
        to: 4,
        annotations: [annotation1, annotation2],
      },
      {
        from: 4,
        to: 5,
        annotations: [annotation2, annotation3],
      },
      {
        from: 5,
        to: 6,
        annotations: [annotation3],
      },
    ]);
  });
});
