import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { Annotation, AnnotationExtension } from '..';
import type { AnnotationOptions } from '../types';

extensionValidityTest(AnnotationExtension);

function create(options?: AnnotationOptions) {
  return renderEditor([new AnnotationExtension(options)]);
}

describe('commands', () => {
  it('#addAnnotation', () => {
    const {
      add,
      view,
      nodes: { p, doc },
      commands,
    } = create();

    add(doc(p('An <start>important<end> note')));
    commands.addAnnotation({ id: '1' });

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        An
        <span class="selection"
              style="background: rgb(215, 215, 255);"
        >
          important
        </span>
        note
      </p>
    `);
  });

  it('#updateAnnotation', () => {
    const {
      add,
      view,
      nodes: { p, doc },
      commands,
    } = create();

    const id = '1';

    add(doc(p('An <start>important<end> note')));
    commands.addAnnotation({ id });

    // Pre-condition
    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        An
        <span class="selection"
              style="background: rgb(215, 215, 255);"
        >
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
        <span class="selection updated"
              style="background: rgb(215, 215, 255);"
        >
          important
        </span>
        note
      </p>
    `);
  });

  it('#setAnnotations', () => {
    const {
      add,
      view,
      nodes: { p, doc },
      commands,
    } = create();

    add(doc(p('An important note')));
    commands.setAnnotations([
      {
        id: '1',
        from: 3,
        to: 13,
      },
    ]);

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
          <p>
            An
            <span style="background: rgb(215, 215, 255);">
              important
            </span>
            note
          </p>
        `);
  });

  it('#removeAnnotation', () => {
    const {
      add,
      view,
      nodes: { p, doc },
      commands,
    } = create();

    const id = '1';

    add(doc(p('An <start>important<end> note')));
    commands.addAnnotation({ id });
    // Pre-condition
    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        An
        <span class="selection"
              style="background: rgb(215, 215, 255);"
        >
          important
        </span>
        note
      </p>
    `);

    commands.removeAnnotations([id]);

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        An
        <span class="selection"
              style
        >
          important
        </span>
        note
      </p>
    `);
  });
});

describe('plugin#apply', () => {
  it('removes annotations when content is deleted', () => {
    const {
      add,
      helpers,
      nodes: { p, doc },
      commands,
    } = create();

    add(doc(p('<start>Hello<end>')));
    commands.addAnnotation({ id: '1' });

    // Pre-condition
    expect(helpers.getAnnotations()).toHaveLength(1);

    // Delete all annotated content
    commands.delete();

    expect(helpers.getAnnotations()).toHaveLength(0);
  });
});

describe('styling', () => {
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
        <span class="selection custom-annotation"
              style="background: rgb(215, 215, 255);"
        >
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

  it('#getAnnotations gracefully handle misplaced annotations', () => {
    const {
      add,
      helpers,
      nodes: { p, doc },
      commands,
    } = create();

    add(doc(p('Hello')));
    commands.setAnnotations([
      {
        id: '1',
        from: 100,
        to: 110,
      },
    ]);

    expect(helpers.getAnnotations()[0].text).toBeUndefined();
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
    selectText({ from: 5, to: 14 });
    commands.addAnnotation({ id: '2', tag: 'awesome', className: 'custom' });

    expect(dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        <span class
              style="background: rgb(215, 215, 255);"
        >
          Hell
        </span>
        <span class="selection custom"
              style="background: rgb(175, 175, 255);"
        >
          o
        </span>
        <span class="selection custom"
              style="background: rgb(215, 215, 255);"
        >
          my frie
        </span>
        nd
      </p>
    `);
  });
});

describe('custom styling', () => {
  interface ColoredAnnotation extends Annotation {
    color: string;
  }

  it('should use custom styling', () => {
    const getStyle = (annotations: Array<Omit<ColoredAnnotation, 'text'>>) => {
      return `background: ${annotations[0].color}`;
    };

    const {
      dom,
      add,
      nodes: { p, doc },
      commands,
    } = renderEditor([new AnnotationExtension<ColoredAnnotation>({ getStyle })]);

    add(doc(p('<start>Hello<end> my friend')));

    commands.addAnnotation({ id: '1', color: 'red' });

    expect(dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        <span class="selection"
              style="background: red;"
        >
          Hello
        </span>
        my friend
      </p>
    `);
  });
});
