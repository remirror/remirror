import { renderEditor } from 'jest-remirror';

import { isExtensionValid } from '@remirror/testing';

import { Annotation, AnnotationExtension } from '..';
import { AnnotationOptions } from '../types';

test('is valid', () => {
  expect(isExtensionValid(AnnotationExtension, {}));
});

function create(options?: AnnotationOptions) {
  const extension = new AnnotationExtension(options);
  const editor = renderEditor([extension]);
  return Object.assign(editor, {
    extension,
  });
}

describe('commands', () => {
  const {
    add,
    view,
    nodes: { p, doc },
    commands,
  } = create();

  it('#addAnnotation', () => {
    add(doc(p('An <start>important<end> note')));
    commands.addAnnotation({ id: '1' });

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
          <p>
            An
            <span class="annotation">
              important
            </span>
            note
          </p>
        `);
  });

  it('#setAnnotations', () => {
    add(doc(p('An important note')));
    commands.setAnnotations([
      {
        id: '1',
        from: 3,
        to: 13,
        text: '<IGNORE>>',
      },
    ]);

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
          <p>
            An
            <span class="annotation">
              important
            </span>
            note
          </p>
        `);
  });

  it('#removeAnnotation', () => {
    const id = '1';

    add(doc(p('An <start>important<end> note')));
    commands.addAnnotation({ id });
    // Pre-condition
    expect(view.dom.innerHTML).toMatchInlineSnapshot(
      `
          <p>
            An
            <span class="annotation">
              important
            </span>
            note
          </p>
        `,
    );

    commands.removeAnnotations([id]);

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
          <p>
            An important note
          </p>
        `);
  });
});

describe('styling', () => {
  it('options', () => {
    const {
      add,
      view: { dom },
      nodes: { p, doc },
      commands,
    } = create({ annotationClassName: 'test-class-name' });

    add(doc(p('<start>Hello<end>')));
    commands.addAnnotation({ id: '1' });

    expect(dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        <span class="test-class-name">
          Hello
        </span>
      </p>
    `);
  });

  it('annotation-specific classname', () => {
    const {
      add,
      view: { dom },
      nodes: { p, doc },
      commands,
    } = create();

    add(doc(p('<start>Hello<end>')));
    commands.addAnnotation({ id: '1', className: 'custom-annotation' });

    expect(dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        <span class="annotation custom-annotation">
          Hello
        </span>
      </p>
    `);
  });
});

describe('getters', () => {
  it('#getAnnotations', () => {
    const {
      add,
      extension,
      nodes: { p, doc },
      commands,
      view,
    } = create();

    add(doc(p('<start>Hello<end>')));
    commands.addAnnotation({ id: '1' });

    expect(extension.getAnnotations(view.state)).toEqual([
      {
        id: '1',
        from: 1,
        to: 6,
        text: 'Hello',
      },
    ]);
  });

  it('#getAnnotationsAt', () => {
    const {
      add,
      extension,
      nodes: { p, doc },
      commands,
      view,
    } = create();

    add(doc(p('An <start>important<end> note')));
    commands.addAnnotation({ id: '1' });

    expect(extension.getAnnotationsAt(view.state, 5)).toEqual([
      {
        id: '1',
        from: 4,
        to: 13,
        text: 'important',
      },
    ]);
  });

  it('#getAnnotationsAt (unannotated)', () => {
    const {
      add,
      extension,
      nodes: { p, doc },
      commands,
      view,
    } = create();

    add(doc(p('An <start>important<end> note')));
    commands.addAnnotation({ id: '1' });

    expect(extension.getAnnotationsAt(view.state, 2)).toEqual([]);
  });
});

describe('custom annotation type', () => {
  interface MyAnnotation extends Annotation {
    tag: string;
  }

  const extension = new AnnotationExtension<MyAnnotation>();
  const {
    add,
    nodes: { p, doc },
    commands,
    view,
  } = renderEditor([extension]);

  add(doc(p('<start>Hello<end>')));
  commands.addAnnotation({ id: '1', tag: 'tag' });

  expect(extension.getAnnotations(view.state)).toEqual([
    {
      id: '1',
      from: 1,
      to: 6,
      tag: 'tag',
      text: 'Hello',
    },
  ]);
});
