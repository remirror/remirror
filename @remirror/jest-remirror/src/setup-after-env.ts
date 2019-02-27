// function transformDoc(fn) {
//   return doc => {
//     const walk = fn => node => {
//       const { content = [], ...rest } = node;
//       const transformedNode = fn(rest);
//       const walkWithFn = walk(fn);
//       if (content.length) {
//         transformedNode.content = content.map(walkWithFn);
//       }
//       return transformedNode;
//     };
//     return walk(fn)(doc);
//   };
// }

// const hasLocalId = type =>
//   type === 'status' ||
//   type === 'taskItem' ||
//   type === 'taskList' ||
//   type === 'decisionItem' ||
//   type === 'decisionList';

// const removeIdsFromDoc = transformDoc(node => {
//   /**
//    * Replace `id` of media nodes with a fixed id
//    * @see https://regex101.com/r/FrYUen/1
//    */
//   if (node.type === 'media') {
//     const replacedNode = {
//       ...node,
//       attrs: {
//         ...node.attrs,
//         id: node.attrs.id.replace(
//           /(temporary:)?([a-z0-9\-]+)(:.*)?$/,
//           '$11234-5678-abcd-efgh$3',
//         ),

//         __fileName: 'example.png',
//       },
//     };

//     if (node.attrs.__key) {
//       replacedNode.attrs.__key = node.attrs.__key.replace(
//         /(temporary:)?([a-z0-9\-]+)(:.*)?$/,
//         '$11234-5678-abcd-efgh$3',
//       );
//     }

//     return replacedNode;
//   }
//   if (hasLocalId(node.type)) {
//     return {
//       ...node,
//       attrs: {
//         ...node.attrs,
//         localId: node.attrs.localId.replace(/([a-z0-9\-]+)/, () => 'abc-123'),
//       },
//     };
//   }
//   return node;
// });

// /* eslint-disable no-undef */
// expect.extend({
//   toEqualDocument(actual, expected) {
//     // Because schema is created dynamically, expected value is a function (schema) => PMNode;
//     // That's why this magic is necessary. It simplifies writing assertions, so
//     // instead of expect(doc).toEqualDocument(doc(p())(schema)) we can just do:
//     // expect(doc).toEqualDocument(doc(p())).
//     //
//     // Also it fixes issues that happens sometimes when actual schema and expected schema
//     // are different objects, making this case impossible by always using actual schema to create expected node.
//     expected =
//       typeof expected === 'function' && actual.type && actual.type.schema
//         ? expected(actual.type.schema)
//         : expected;

//     if (
//       !(expected instanceof pmModel.Node) ||
//       !(actual instanceof pmModel.Node)
//     ) {
//       return {
//         pass: false,
//         actual,
//         expected,
//         name: 'toEqualDocument',
//         message:
//           'Expected both values to be instance of prosemirror-model Node.',
//       };
//     }

//     if (expected.type.schema !== actual.type.schema) {
//       return {
//         pass: false,
//         actual,
//         expected,
//         name: 'toEqualDocument',
//         message: 'Expected both values to be using the same schema.',
//       };
//     }

//     const pass = this.equals(actual.toJSON(), expected.toJSON());
//     const message = pass
//       ? () =>
//           `${this.utils.matcherHint('.not.toEqualDocument')}\n\n` +
//           `Expected JSON value of document to not equal:\n  ${this.utils.printExpected(
//             expected,
//           )}\n` +
//           `Actual JSON:\n  ${this.utils.printReceived(actual)}`
//       : () => {
//           const diffString = diff(expected, actual, {
//             expand: this.expand,
//           });
//           return (
//             `${this.utils.matcherHint('.toEqualDocument')}\n\n` +
//             `Expected JSON value of document to equal:\n${this.utils.printExpected(
//               expected,
//             )}\n` +
//             `Actual JSON:\n  ${this.utils.printReceived(actual)}` +
//             `${diffString ? `\n\nDifference:\n\n${diffString}` : ''}`
//           );
//         };

//     return {
//       pass,
//       actual,
//       expected,
//       message,
//       name: 'toEqualDocument',
//     };
//   },

//   toMatchDocSnapshot(actual) {
//     const { currentTestName, snapshotState } = this;

//     const removeFirstWord = sentence =>
//       sentence
//         .split(' ')
//         .slice(1)
//         .join(' ');

//     // this change is to ensure we are mentioning test file name only once in snapshot file
//     // for integration tests only
//     const newTestName = removeFirstWord(currentTestName);

//     // remove ids that may change from the document so snapshots are repeatable
//     const transformedDoc = removeIdsFromDoc(actual);

//     // since the test runner fires off multiple browsers for a single test, map each snapshot to the same one
//     // (otherwise we'll try to create as many snapshots as there are browsers)
//     const oldCounters = snapshotState._counters;
//     snapshotState._counters = Object.create(oldCounters, {
//       set: {
//         value: key => oldCounters.set(key, 1),
//       },
//       get: {
//         value: key => oldCounters.get(key),
//       },
//     });
