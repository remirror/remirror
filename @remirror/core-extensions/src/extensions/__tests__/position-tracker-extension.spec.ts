import { ExtensionMap } from '@remirror/test-fixtures';
import { renderEditor } from 'jest-remirror';
import { PositionTrackerExtension, PositionTrackerExtensionOptions } from '../position-tracker-extension';

const { heading: headingNode, blockquote: blockquoteNode } = ExtensionMap.nodes;
const create = (params: Partial<PositionTrackerExtensionOptions> = {}) =>
  renderEditor({
    plainNodes: [headingNode, blockquoteNode],
    others: [new PositionTrackerExtension(params)],
  });

describe('plugin', () => {
  let {
    add,

    nodes: { doc, p, heading: h, blockquote },
  } = create();

  beforeEach(() => {
    ({
      add,
      nodes: { doc, p, heading: h },
    } = create());
  });

  it('tracks the correct position when text is added', () => {
    add(doc(p('Yo<cursor>')))
      .actionsCallback(actions => actions.addPositionTracker({ id: 'test' }))
      .helpersCallback(helpers => {
        expect(helpers.findPositionTracker('test')).toBe(3);
      })
      .insertText(' new text')
      .helpersCallback(helpers => {
        expect(helpers.findPositionTracker('test')).toBe(12);
      });
  });

  it('tracks position across nodes', () => {
    add(doc(p('Yo <cursor>')))
      .actionsCallback(actions => actions.addPositionTracker({ id: 'test' }))
      .replace(blockquote('<cursor>'))
      .insertText(' new text')
      .helpersCallback(helpers => {
        expect(helpers.findPositionTracker('test')).toBe(13);
      });
  });

  it('can track multiple positions', () => {
    add(doc(p('H<cursor>ello')))
      .actionsCallback(actions => actions.addPositionTracker({ id: 'test1' }))
      .jumpTo(3)
      .actionsCallback(actions => actions.addPositionTracker({ id: 'test2' }))
      .jumpTo('end')
      .actionsCallback(actions => actions.addPositionTracker({ id: 'test3' }))
      .helpersCallback(helpers => {
        expect(helpers.findAllPositionTrackers()).toEqual({
          test1: 2,
          test2: 3,
          test3: 6,
        });
      })
      .insertText(' world')
      .helpersCallback(helpers => {
        expect(helpers.findAllPositionTrackers()).toEqual({
          test1: 2,
          test2: 3,
          test3: 12,
        });
      });
  });

  it('loses the position when overwritten', () => {
    add(doc(p('Yo<cursor>')))
      .actionsCallback(actions => actions.addPositionTracker({ id: 'test' }))
      .overwrite(doc(h('awesome'), p('<cursor>')))
      .insertText(' new text')
      .helpersCallback(helpers => {
        expect(helpers.findPositionTracker('test')).toBe(undefined);
      });
  });

  it('removes a position', () => {
    add(doc(p('Yo<cursor>')))
      .actionsCallback(actions => actions.addPositionTracker({ id: 'test' }))

      .insertText(' new text')
      .actionsCallback(actions => actions.removePositionTracker({ id: 'test' }))
      .helpersCallback(helpers => {
        expect(helpers.findPositionTracker('test')).toBe(undefined);
      });
  });

  it('removes all positions', () => {
    add(doc(p('H<cursor>ello')))
      .actionsCallback(actions => actions.addPositionTracker({ id: 'test1' }))
      .jumpTo(3)
      .actionsCallback(actions => actions.addPositionTracker({ id: 'test2' }))
      .jumpTo('end')
      .actionsCallback(actions => actions.addPositionTracker({ id: 'test3' }))
      .actionsCallback(actions => actions.clearPositionTrackers())
      .insertText(' world')
      .helpersCallback(helpers => {
        expect(helpers.findAllPositionTrackers()).toEqual({});
      });
  });
});
