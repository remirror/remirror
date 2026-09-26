import { extensionValidityTest, renderEditor } from 'jest-remirror';

import type { AnnotationOptions } from '../';
import { Annotation, AnnotationExtension } from '../';
import { MapLikeAnnotationStore } from '../src/annotation-store';

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
        <span style="background: rgb(215, 215, 255);">
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
        <span style="background: rgb(215, 215, 255);">
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
        <span
          style="background: rgb(215, 215, 255);"
          class="updated"
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
        <span style="background: rgb(215, 215, 255);">
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

  it('#redrawAnnotations', () => {
    let color = 'red';
    const getStyle = () => `background: ${color};`;

    const {
      add,
      view,
      nodes: { p, doc },
      commands,
    } = create({ getStyle });

    const id = '1';

    add(doc(p('<start>Hello<end>')));
    commands.addAnnotation({ id });
    // Pre-condition
    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        <span style="background: red;">
          Hello
        </span>
      </p>
    `);

    color = 'green';
    commands.redrawAnnotations();

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        <span style="background: green;">
          Hello
        </span>
      </p>
    `);
  });

  it('supports chaining commands', () => {
    const {
      manager,
      add,
      view,
      nodes: { p, doc },
      chain,
    } = create();

    const id = '1';

    add(doc(p('An <start>important<end> note')));
    chain.addAnnotation({ id }).selectText('end').insertText(' awesome!').tr();

    expect(manager.tr.getMeta(AnnotationExtension.name)).toMatchInlineSnapshot(`
      {
        "annotationData": {
          "id": "1",
        },
        "from": 4,
        "to": 13,
        "type": 0,
      }
    `);
    expect(manager.tr.steps).toHaveLength(1);

    chain.run();
    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        An
        <span style="background: rgb(215, 215, 255);">
          important
        </span>
        note awesome!
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

  it('updates annotation when content is added within an annotation', () => {
    const {
      add,
      helpers,
      nodes: { p, doc },
      commands,
    } = create();

    add(doc(p('<start>Hello<end>')));
    commands.addAnnotation({ id: '1' });

    // Pre-condition
    expect(helpers.getAnnotations()[0]?.text).toBe('Hello');

    commands.insertText('ADDED', { from: 3 });

    expect(helpers.getAnnotations()[0]?.text).toBe('HeADDEDllo');
  });

  it("doesn't extend annotation when content is added at the beginning of an annotation", () => {
    const {
      add,
      helpers,
      nodes: { p, doc },
      commands,
    } = create();

    add(doc(p('<start>Hello<end>')));
    commands.addAnnotation({ id: '1' });

    // Pre-condition
    expect(helpers.getAnnotations()[0]?.text).toBe('Hello');

    commands.insertText('ADDED', { from: 0 });

    expect(helpers.getAnnotations()[0]?.text).toBe('Hello');
  });

  it("doesn't extend annotation when content is added at the end of an annotation", () => {
    const {
      add,
      helpers,
      nodes: { p, doc },
      commands,
    } = create();

    add(doc(p('<start>Hello<end>')));
    commands.addAnnotation({ id: '1' });

    // Pre-condition
    expect(helpers.getAnnotations()[0]?.text).toBe('Hello');

    commands.insertText('ADDED', { from: 6 });

    expect(helpers.getAnnotations()[0]?.text).toBe('Hello');
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
        <span
          class="custom-annotation"
          style="background: rgb(215, 215, 255);"
        >
          Hello
        </span>
      </p>
    `);
  });
});

describe('helpers', () => {
  describe('#getAnnotations', () => {
    it('returns the same array when annotation data and text have not changed', () => {
      const {
        add,
        helpers,
        nodes: { p, doc },
        commands,
      } = create();

      add(doc(p('<start>Hello<end> world')));
      commands.addAnnotation({ id: '1' });
      const annotations = helpers.getAnnotations();

      expect(helpers.getAnnotations()).toBe(annotations);
      commands.selectText({ from: 7, to: 12 });
      expect(helpers.getAnnotations()).toBe(annotations);
      commands.insertText('!', { from: 12 });
      expect(helpers.getAnnotations()).toBe(annotations);
    });

    it('keeps empty results stable and invalidates added, changed and removed annotations', () => {
      const {
        add,
        helpers,
        commands,
        nodes: { p, doc },
        view,
      } = create();
      add(doc(p('Hello world')));
      const empty = helpers.getAnnotations();
      expect(helpers.getAnnotations()).toBe(empty);
      commands.setAnnotations([{ id: '1', from: 1, to: 6 }]);
      const first = helpers.getAnnotations();
      expect(first).not.toBe(empty);

      view.dispatch(view.state.tr.insertText('J', 1, 2));
      const edited = helpers.getAnnotations();
      expect(edited).not.toBe(first);
      expect(edited[0]?.text).toBe('Jello');
      expect(helpers.getAnnotations()).toBe(edited);

      commands.insertText('x', { from: 1 });
      const moved = helpers.getAnnotations();
      expect(moved).not.toBe(edited);
      expect(moved[0]).toMatchObject({ from: 2, to: 7, text: 'Jello' });

      commands.removeAnnotations(['1']);
      const removed = helpers.getAnnotations();
      expect(removed).toEqual([]);
      expect(removed).not.toBe(moved);
      expect(helpers.getAnnotations()).toBe(removed);
    });

    it('compares custom metadata by value while retaining the original metadata references', () => {
      interface TaggedAnnotation extends Annotation {
        metadata: { tags: string[] };
      }
      type Extension = AnnotationExtension<TaggedAnnotation>;
      const extension = new AnnotationExtension<TaggedAnnotation>();
      const {
        add,
        helpers,
        commands,
        nodes: { p, doc },
      } = renderEditor<Extension>([extension]);
      const metadata = { tags: ['review'] };
      add(doc(p('Hello')));
      commands.setAnnotations([{ id: '1', from: 1, to: 6, metadata }]);
      const initial = helpers.getAnnotations();
      expect(initial[0]?.metadata).toBe(metadata);

      commands.updateAnnotation('1', { metadata: { tags: ['review'] } });
      expect(helpers.getAnnotations()).toBe(initial);

      commands.updateAnnotation('1', { metadata });
      metadata.tags.push('approved');
      commands.redrawAnnotations();
      const changed = helpers.getAnnotations();
      expect(changed).not.toBe(initial);
      expect(changed[0]?.metadata).toBe(metadata);
      expect(changed[0]?.metadata.tags).toEqual(['review', 'approved']);
      expect(helpers.getAnnotations()).toBe(changed);
    });

    it('does not reuse a returned array whose order or annotation data was changed by the caller', () => {
      const {
        add,
        helpers,
        commands,
        nodes: { p, doc },
      } = create();
      add(doc(p('Hello world')));
      commands.setAnnotations([
        { id: '1', from: 1, to: 6, className: 'first' },
        { id: '2', from: 7, to: 12 },
      ]);
      const initial = helpers.getAnnotations();
      initial.reverse();
      const restoredOrder = helpers.getAnnotations();
      expect(restoredOrder).not.toBe(initial);
      expect(restoredOrder.map(({ id }) => id)).toEqual(['1', '2']);
      restoredOrder[0]!.className = 'modified by caller';
      const restoredData = helpers.getAnnotations();
      expect(restoredData).not.toBe(restoredOrder);
      expect(restoredData[0]?.className).toBe('first');
      expect(helpers.getAnnotations()).toBe(restoredData);

      commands.setAnnotations([
        { id: '2', from: 7, to: 12 },
        { id: '1', from: 1, to: 6, className: 'first' },
      ]);
      const reordered = helpers.getAnnotations();
      expect(reordered).not.toBe(restoredData);
      expect(reordered.map(({ id }) => id)).toEqual(['2', '1']);
    });

    it('invalidates only when changing blockSeparator changes the returned text', () => {
      const extension = new AnnotationExtension({ blockSeparator: ' ' });
      const {
        add,
        helpers,
        commands,
        nodes: { p, doc },
      } = renderEditor<typeof extension>([extension]);
      add(doc(p('Hello'), p('World')));
      commands.setAnnotations([{ id: '1', from: 1, to: 13 }]);
      const initial = helpers.getAnnotations();
      extension.setOptions({ blockSeparator: '\n' });
      const changed = helpers.getAnnotations();
      expect(changed).not.toBe(initial);
      expect(changed[0]?.text).toBe('Hello\nWorld');
      commands.setAnnotations([{ id: '1', from: 1, to: 6 }]);
      const singleBlock = helpers.getAnnotations();
      extension.setOptions({ blockSeparator: ' ' });
      expect(helpers.getAnnotations()).toBe(singleBlock);
    });

    it('does not share cached results between editors', () => {
      const first = create();
      const second = create();
      first.add(first.nodes.doc(first.nodes.p('Hello')));
      second.add(second.nodes.doc(second.nodes.p('Hello')));
      first.commands.setAnnotations([{ id: '1', from: 1, to: 6 }]);
      second.commands.setAnnotations([{ id: '1', from: 1, to: 6 }]);
      expect(first.helpers.getAnnotations()).toEqual(second.helpers.getAnnotations());
      expect(first.helpers.getAnnotations()).not.toBe(second.helpers.getAnnotations());
    });

    it('tracks Map keys, ordered collection values and circular metadata without losing reference stability', () => {
      interface RichAnnotation extends Annotation {
        metadata: Map<{ label: string; parent?: unknown }, string[]>;
      }
      const extension = new AnnotationExtension<RichAnnotation>();
      const {
        add,
        helpers,
        commands,
        nodes: { p, doc },
      } = renderEditor<typeof extension>([extension]);
      const key: { label: string; parent?: unknown } = { label: 'key' };
      const metadata = new Map([[key, ['first', 'second']]]);
      key.parent = metadata;
      add(doc(p('Hello')));
      commands.setAnnotations([{ id: '1', from: 1, to: 6, metadata }]);
      const initial = helpers.getAnnotations();
      expect(helpers.getAnnotations()).toBe(initial);
      key.label = 'changed';
      commands.redrawAnnotations();
      const changedKey = helpers.getAnnotations();
      expect(changedKey).not.toBe(initial);
      expect(helpers.getAnnotations()).toBe(changedKey);
      metadata.get(key)!.reverse();
      commands.redrawAnnotations();
      const changedOrder = helpers.getAnnotations();
      expect(changedOrder).not.toBe(changedKey);
      expect(changedOrder[0]?.metadata).toBe(metadata);
      expect(helpers.getAnnotations()).toBe(changedOrder);
    });

    it.each([
      [
        'Date',
        () => ({
          value: new Date(0),
          mutate(value: Date) {
            value.setTime(1);
          },
        }),
      ],
      [
        'Set',
        () => ({
          value: new Set([['first', 'second']]),
          mutate(value: Set<string[]>) {
            [...value][0]!.reverse();
          },
        }),
      ],
      [
        'typed array',
        () => ({
          value: new Uint8Array([1, 2]),
          mutate(value: Uint8Array) {
            value[0] = 3;
          },
        }),
      ],
      [
        'DataView window',
        () => ({
          value: new DataView(new ArrayBuffer(8), 2, 4),
          mutate(value: DataView) {
            value.setUint8(0, 3);
          },
        }),
      ],
      [
        'symbol field',
        () => {
          const key = Symbol('metadata');
          return {
            value: { [key]: 'before' },
            mutate(value: Record<symbol, string>) {
              value[key] = 'after';
            },
          };
        },
      ],
    ])('detects in-place changes to %s metadata', (_label, makeValue) => {
      interface RichAnnotation extends Annotation {
        metadata: unknown;
      }
      const extension = new AnnotationExtension<RichAnnotation>();
      const {
        add,
        helpers,
        commands,
        nodes: { p, doc },
      } = renderEditor<typeof extension>([extension]);
      const { value, mutate } = makeValue();
      add(doc(p('Hello')));
      commands.setAnnotations([{ id: '1', from: 1, to: 6, metadata: value }]);
      const initial = helpers.getAnnotations();
      expect(helpers.getAnnotations()).toBe(initial);
      // Each row supplies the mutator for its own value type.
      (mutate as (value: unknown) => void)(value);
      commands.redrawAnnotations();
      const changed = helpers.getAnnotations();
      expect(changed).not.toBe(initial);
      expect(changed[0]?.metadata).toBe(value);
      expect(helpers.getAnnotations()).toBe(changed);
    });

    it('compares opaque metadata by reference and preserves annotations which cannot be inspected', () => {
      interface CustomAnnotation extends Annotation {
        metadata: unknown;
      }
      const extension = new AnnotationExtension<CustomAnnotation>();
      const {
        add,
        helpers,
        commands,
        nodes: { p, doc },
      } = renderEditor<typeof extension>([extension]);
      add(doc(p('Hello')));
      const error = new Error('same message');
      commands.setAnnotations([{ id: '1', from: 1, to: 6, metadata: error }]);
      const initial = helpers.getAnnotations();
      expect(helpers.getAnnotations()).toBe(initial);
      commands.updateAnnotation('1', { metadata: new Error('same message') });
      expect(helpers.getAnnotations()).not.toBe(initial);

      const metadata = Object.defineProperty({}, 'unreadable', {
        enumerable: true,
        get() {
          throw new Error('not inspectable');
        },
      });
      commands.updateAnnotation('1', { metadata });
      const first = helpers.getAnnotations();
      const second = helpers.getAnnotations();
      expect(second).not.toBe(first);
      expect(second[0]?.metadata).toBe(metadata);
      expect(helpers.getAnnotations()[0]?.text).toBe('Hello');
    });

    it('default', () => {
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

    it('gracefully handles misplaced annotations', () => {
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

      expect(helpers.getAnnotations()[0]?.text).toBeUndefined();
    });

    it('concats multi-block content with configured blockseparator', () => {
      const {
        add,
        helpers,
        nodes: { p, doc },
        commands,
      } = create({
        blockSeparator: '<NEWLINE>',
      });

      add(doc(p('Hello'), p('World')));
      commands.setAnnotations([
        {
          id: '1',
          from: 1,
          to: 13,
        },
      ]);

      expect(helpers.getAnnotations()[0]?.text).toBe('Hello<NEWLINE>World');
    });

    it('maps annotations positions on doc change', () => {
      const {
        add,
        helpers,
        nodes: { p, doc },
        commands,
        view,
      } = create();

      add(doc(p('This is my <start>annotated<end> text.')));
      commands.addAnnotation({ id: '1' });
      expect(helpers.getAnnotations()).toMatchInlineSnapshot(`
        [
          {
            "from": 12,
            "id": "1",
            "text": "annotated",
            "to": 21,
          },
        ]
      `);

      commands.insertText(' edited', { from: 11 });
      expect(helpers.getAnnotations()).toMatchInlineSnapshot(`
        [
          {
            "from": 19,
            "id": "1",
            "text": "annotated",
            "to": 28,
          },
        ]
      `);

      expect(view.state.doc).toEqualRemirrorDocument(doc(p('This is my edited annotated text.')));
    });

    it('removes delete annotations', () => {
      const {
        add,
        helpers,
        nodes: { p, doc },
        commands,
        view,
      } = create();

      add(doc(p('This is my <start>annotated<end> text.')));
      commands.addAnnotation({ id: '1' });
      expect(helpers.getAnnotations()).toMatchInlineSnapshot(`
        [
          {
            "from": 12,
            "id": "1",
            "text": "annotated",
            "to": 21,
          },
        ]
      `);

      commands.delete({ from: 11, to: 21 });
      expect(helpers.getAnnotations()).toEqual([]);

      expect(view.state.doc).toEqualRemirrorDocument(doc(p('This is my text.')));
    });

    it('removes delete annotations permanently', () => {
      const {
        add,
        helpers,
        nodes: { p, doc },
        commands,
      } = create();

      add(doc(p('This is my <start>annotated<end> text.')));
      commands.addAnnotation({ id: '1' });

      // Remove annotation by deleting it from the document
      commands.delete({ from: 11, to: 21 });

      commands.selectText({ from: 1, to: 5 });
      commands.addAnnotation({ id: '2' });

      expect(helpers.getAnnotations()).toMatchInlineSnapshot(`
        [
          {
            "from": 1,
            "id": "2",
            "text": "This",
            "to": 5,
          },
        ]
      `);
    });
  });

  describe('#getAnnotationsAt', () => {
    let {
      add,
      helpers,
      nodes: { p, doc },
      commands,
    } = create();

    beforeEach(() => {
      ({
        add,
        helpers,
        nodes: { p, doc },
        commands,
      } = create());
      add(doc(p('An <start>important<end> note')));
      commands.addAnnotation({ id: '1' });
    });

    it('default', () => {
      expect(helpers.getAnnotationsAt()).toEqual([
        {
          id: '1',
          from: 4,
          to: 13,
          text: 'important',
        },
      ]);
    });

    it('pos', () => {
      expect(helpers.getAnnotationsAt(5)).toEqual([
        {
          id: '1',
          from: 4,
          to: 13,
          text: 'important',
        },
      ]);
    });

    it('edge pos', () => {
      expect(helpers.getAnnotationsAt(13)).toEqual([
        {
          id: '1',
          from: 4,
          to: 13,
          text: 'important',
        },
      ]);
    });

    it('no annotation', () => {
      expect(helpers.getAnnotationsAt(2)).toEqual([]);
    });

    it('default, includeEdges = false', () => {
      expect(helpers.getAnnotationsAt(undefined, false)).toEqual([]);
    });

    it('pos, includeEdges = false', () => {
      expect(helpers.getAnnotationsAt(5, false)).toEqual([
        {
          id: '1',
          from: 4,
          to: 13,
          text: 'important',
        },
      ]);
    });

    it('edge pos, includeEdges = false', () => {
      expect(helpers.getAnnotationsAt(13, false)).toEqual([]);
    });

    it('no annotation, includeEdges = false', () => {
      expect(helpers.getAnnotationsAt(2, false)).toEqual([]);
    });
  });
});

describe('custom annotations', () => {
  interface MyAnnotation extends Annotation {
    tag: string;
  }

  it('should support custom annotations', () => {
    const extension = new AnnotationExtension<MyAnnotation>();
    type Extension = typeof extension;
    const {
      add,
      helpers,
      nodes: { p, doc },
      commands,
    } = renderEditor<Extension>([extension]);

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
    const extension = new AnnotationExtension<MyAnnotation>();
    type Extension = typeof extension;
    const {
      dom,
      selectText,
      add,
      nodes: { p, doc },
      commands,
    } = renderEditor<Extension>([extension]);

    add(doc(p('<start>Hello<end> my friend')));

    commands.addAnnotation({ id: '1', tag: 'tag' });
    selectText({ from: 5, to: 14 });
    commands.addAnnotation({ id: '2', tag: 'awesome', className: 'custom' });

    expect(dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        <span style="background: rgb(215, 215, 255);">
          Hell
        </span>
        <span
          class="custom"
          style="background: rgb(175, 175, 255);"
        >
          o
        </span>
        <span
          class="custom"
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
    const getStyle = (annotations: Array<Omit<ColoredAnnotation, 'text'>>) =>
      `background: ${annotations[0]?.color}`;

    const extension = new AnnotationExtension<ColoredAnnotation>({ getStyle });
    type Extension = typeof extension;
    const {
      dom,
      add,
      nodes: { p, doc },
      commands,
    } = renderEditor<Extension>([extension]);

    add(doc(p('<start>Hello<end> my friend')));

    commands.addAnnotation({ id: '1', color: 'red' });

    expect(dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        <span style="background: red;">
          Hello
        </span>
        my friend
      </p>
    `);
  });
});

describe('custom store', () => {
  it('should use the provided store', () => {
    const myStore = new (class extends MapLikeAnnotationStore<Annotation> {
      public get innerMap() {
        return this.map;
      }
    })();
    const options = {
      getStore: () => myStore,
    };
    const {
      add,
      nodes: { p, doc },
      commands,
      helpers,
    } = create(options);

    add(doc(p('Hello <start>again<end> my friend')));

    commands.addAnnotation({ id: 'an-id' });

    expect(myStore.innerMap.size).toBe(1);
    expect(myStore.innerMap.get('an-id')).toEqual({
      id: 'an-id',
      from: 7,
      to: 12,
    });

    expect(helpers.getAnnotations()).toEqual([
      {
        id: 'an-id',
        from: 7,
        to: 12,
        text: 'again',
      },
    ]);
  });
});

describe('custom map like via getMap', () => {
  it('should use the provided map like object passed via `getMap`', () => {
    const myMap = new Map();
    const options = {
      getStore: undefined,
      getMap: () => myMap,
    };
    const {
      add,
      nodes: { p, doc },
      commands,
      helpers,
    } = create(options);

    add(doc(p('Hello <start>again<end> my friend')));

    commands.addAnnotation({ id: 'an-id' });

    expect(myMap.size).toBe(1);
    expect(myMap.get('an-id')).toEqual({
      id: 'an-id',
      from: 7,
      to: 12,
    });

    expect(helpers.getAnnotations()).toEqual([
      {
        id: 'an-id',
        from: 7,
        to: 12,
        text: 'again',
      },
    ]);
  });
});

describe('custom positions', () => {
  it('should use the provided map like object passed via `getMap`', () => {
    const myMap = new Map();
    const options = {
      getStore: undefined,
      getMap: () => myMap,
      transformPosition: (pos: number) => ({ pos, meta: { mock: 'data' } }),
      transformPositionBeforeRender: (obj: any) => obj.pos,
    };
    const {
      add,
      nodes: { p, doc },
      commands,
      helpers,
    } = create(options);

    add(doc(p('Hello <start>transforms<end> my old friend')));

    commands.addAnnotation({ id: 'some-id' });

    expect(myMap.size).toBe(1);
    expect(myMap.get('some-id')).toStrictEqual({
      id: 'some-id',
      from: { pos: 7, meta: { mock: 'data' } },
      to: { pos: 17, meta: { mock: 'data' } },
    });

    expect(helpers.getAnnotations()).toEqual([
      {
        id: 'some-id',
        from: 7,
        to: 17,
        text: 'transforms',
      },
    ]);
  });
});

describe('multiple editors', () => {
  it('different editors should have different collections of annotations', () => {
    const {
      add: add1,
      nodes: { p: p1, doc: doc1 },
      commands: commands1,
      helpers: helpers1,
    } = create();

    add1(doc1(p1('Some text in <start>editor 1<end>')));
    commands1.addAnnotation({ id: 'editor-1-annotation' });

    const {
      add: add2,
      nodes: { p: p2, doc: doc2 },
      commands: commands2,
      helpers: helpers2,
    } = create();

    add2(doc2(p2('Some other text in <start>editor 2<end>')));
    commands2.addAnnotation({ id: 'editor-2-annotation' });

    expect(helpers1.getAnnotations()).toEqual([
      {
        id: 'editor-1-annotation',
        from: 14,
        to: 22,
        text: 'editor 1',
      },
    ]);

    expect(helpers2.getAnnotations()).toEqual([
      {
        id: 'editor-2-annotation',
        from: 20,
        to: 28,
        text: 'editor 2',
      },
    ]);
  });
});
