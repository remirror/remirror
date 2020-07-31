import { renderEditor } from 'jest-remirror';

import { isExtensionValid } from '@remirror/testing';

import { AnnotationExtension } from '..';
import { AnnotationOptions } from '../types';

test('is valid', () => {
  expect(isExtensionValid(AnnotationExtension, {}));
});

function create(options?: AnnotationOptions) {
  return renderEditor([new AnnotationExtension(options)]);
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
  const extension = new AnnotationExtension();
  const {
    add,
    nodes: { p, doc },
    commands,
    view,
  } = renderEditor([extension]);

  it.skip('#getAnnotations', () => {
    add(doc(p('<start>Hello<end>')));
    commands.addAnnotation({ id: '1' });

    expect(extension.getAnnotations(view.state)).toEqual([
      {
        id: '1',
        from: 1,
        to: 5,
        text: 'Hello',
      },
    ]);
  });

  // #getAnnotationsAt (where there are annotations)
  // #getAnnotationsAt (where there aren't annotations)
  // Keep fields from custom annotation type
});
