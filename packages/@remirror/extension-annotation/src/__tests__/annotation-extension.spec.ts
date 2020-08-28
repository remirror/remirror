import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { Annotation, AnnotationExtension } from '..';
import type { AnnotationOptions } from '../types';

extensionValidityTest(AnnotationExtension);

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

  it('#updateAnnotation', () => {
    const id = '1';

    add(doc(p('An <start>important<end> note')));
    commands.addAnnotation({ id });

    // Pre-condition
    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
          <p>
            An
            <span class="annotation">
              important
            </span>
            note
          </p>
        `);

    commands.updateAnnotation(id, {
      className: 'updated',
    });

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
          <p>
            An
            <span class="annotation updated">
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
    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
          <p>
            An
            <span class="annotation">
              important
            </span>
            note
          </p>
        `);

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

describe('helpers', () => {
  it('#getAnnotations', () => {
    const {
      add,
      helpers,
      nodes: { p, doc },
      commands,
    } = create();

    add(doc(p('<start>Hello<end>')));
    commands.addAnnotation({ id: '1' });

    expect(helpers.getAnnotations()).toEqual([
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
      helpers,
      nodes: { p, doc },
      commands,
    } = create();

    add(doc(p('An <start>important<end> note')));
    commands.addAnnotation({ id: '1' });

    expect(helpers.getAnnotationsAt(5)).toEqual([
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
      helpers,
      nodes: { p, doc },
      commands,
    } = create();

    add(doc(p('An <start>important<end> note')));
    commands.addAnnotation({ id: '1' });

    expect(helpers.getAnnotationsAt(2)).toEqual([]);
  });
});

describe('custom annotations', () => {
  interface MyAnnotation extends Annotation {
    tag: string;
  }

  it('should support custom annotations', () => {
    const {
      add,
      helpers,
      nodes: { p, doc },
      commands,
    } = renderEditor([new AnnotationExtension<MyAnnotation>()]);

    add(doc(p('<start>Hello<end>')));
    commands.addAnnotation({ id: '1', tag: 'tag' });

    expect(helpers.getAnnotations()).toEqual([
      {
        id: '1',
        from: 1,
        to: 6,
        tag: 'tag',
        text: 'Hello',
      },
    ]);
  });

  it('should support overlapping custom annotations', () => {
    const {
      dom,
      selectText,
      add,
      nodes: { p, doc },
      commands,
    } = renderEditor([new AnnotationExtension<MyAnnotation>()]);

    add(doc(p('<start>Hello<end> my friend')));

    commands.addAnnotation({ id: '1', tag: 'tag' });
    selectText(5, 14);
    commands.addAnnotation({ id: '2', tag: 'awesome', className: 'custom' });

    expect(dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        <span class="annotation">
          Hell
        </span>
        <span class="annotation custom">
          o
        </span>
        <span class="annotation custom">
          my frie
        </span>
        nd
      </p>
    `);
  });
});
