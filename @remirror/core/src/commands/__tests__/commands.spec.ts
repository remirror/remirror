import { pm } from '@test-utils';
// import { Mark, Schema } from 'prosemirror-model';
import { insertText, toggleWrap } from '..';
// import { PMNode } from '../../types';

// const baseSchema = pm.schema

const { p, doc: d, h3, hard_break } = pm;

test('insertText', () => {
  const text = 'insert me ';
  const from = d(p('Something <a>is here'));
  const to = d(p(`Something ${text}<a>is here`));
  expect(insertText(text)).transformsNode({ from, to });
});

// ! This test does nothing right now. Need better understanding on how to test ProseMirror
test('toggleWrap', () => {
  const type = h3().type;
  const from = d(
    p('This is<a>', hard_break(), p('This should be wrapped'), '<b> block based selection'),
  );
  const command = toggleWrap(type);
  expect(command).transformsNode({ from });
});

// const schema = new Schema({
//   nodes: {
//     doc: { content: 'head? block* sect* closing?' },
//     para: { content: 'text*', group: 'block' },
//     head: { content: 'text*', marks: '' },
//     figure: { content: 'caption figureimage', group: 'block' },
//     quote: { content: 'block+', group: 'block' },
//     figureimage: {},
//     caption: { content: 'text*', marks: '' },
//     sect: { content: 'head block* sect*' },
//     closing: { content: 'text*' },
//     text: baseSchema.spec.nodes.get('text'),

//     fixed: { content: 'head para closing', group: 'block' },
//   },
//   marks: {
//     em: {},
//   },
// });

// function n(name: string, ...content: PMNode[]) {
//   return schema.nodes[name].create(undefined, content);
// }
// function t(str: string, em?: Mark) {
//   return schema.text(str, em ? [schema.mark('em')] : undefined);
// }

// const doc = n(
//   'doc', // 0
//   n('head', t('Head')), // 6
//   n('para', t('Intro')), // 13
//   n(
//     'sect', // 14
//     n('head', t('Section head')), // 28
//     n(
//       'sect', // 29
//       n('head', t('Subsection head')), // 46
//       n('para', t('Subtext')), // 55
//       n(
//         'figure', // 56
//         n('caption', t('Figure caption')), // 72
//         n('figureimage'),
//       ), // 74
//       n('quote', n('para', t('!'))),
//     ),
//   ), // 81
//   n(
//     'sect', // 82
//     n('head', t('S2')), // 86
//     n('para', t('Yes')),
//   ), // 92
//   n('closing', t('fin')),
// ); // 97

// function range(pos, end) {
//   return doc.resolve(pos).blockRange(end == null ? undefined : doc.resolve(end));
// }

// function findWrapping(range, nodeType, attrs, innerRange = range) {
//   const around = findWrappingOutside(range, nodeType);
//   const inner = around && findWrappingInside(innerRange, nodeType);
//   if (!inner) {
//     return null;
//   }
//   return around
//     .map(withAttrs)
//     .concat({ type: nodeType, attrs })
//     .concat(inner.map(withAttrs));
// }

// function withAttrs(type) {
//   return { type, attrs: null };
// }

// function findWrappingOutside(range, type) {
//   const { parent, startIndex, endIndex } = range;
//   const around = parent.contentMatchAt(startIndex).findWrapping(type);
//   if (!around) {
//     return null;
//   }
//   const outer = around.length ? around[0] : type;
//   return parent.canReplaceWith(startIndex, endIndex, outer) ? around : null;
// }

// function findWrappingInside(range, type) {
//   const { parent, startIndex, endIndex } = range;
//   const inner = parent.child(startIndex);
//   const inside = type.contentMatch.findWrapping(inner.type);
//   if (!inside) {
//     return null;
//   }
//   const lastType = inside.length ? inside[inside.length - 1] : type;
//   let innerMatch = lastType.contentMatch;
//   for (let i = startIndex; innerMatch && i < endIndex; i++) {
//     innerMatch = innerMatch.matchType(parent.child(i).type);
//   }
//   if (!innerMatch || !innerMatch.validEnd) {
//     return null;
//   }
//   return inside;
// }

// describe('findWrapping', () => {
//   function yes(pos, end, type) {
//     return () => {
//       const r = range(pos, end);
//       expect(findWrapping(r, schema.nodes[type])).toBeTruthy();
//     };
//   }
//   function no(pos, end, type) {
//     return () => {
//       const r = range(pos, end);
//       expect(!findWrapping(r, schema.nodes[type])).toBeTruthy();
//     };
//   }

//   it('can wrap the whole doc in a section', yes(0, 92, 'sect'));
//   it("can't wrap a head before a para in a section", no(4, 4, 'sect'));
//   it('can wrap a top paragraph in a quote', yes(8, 8, 'quote'));
//   it("can't wrap a section head in a quote", no(18, 18, 'quote'));
//   it('can wrap a figure in a quote', yes(55, 74, 'quote'));
//   it("can't wrap a head in a figure", no(90, 90, 'figure'));
// });
