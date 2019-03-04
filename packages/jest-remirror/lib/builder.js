"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.text = text;
exports.offsetRefs = offsetRefs;
exports.sequence = sequence;
exports.coerce = coerce;
exports.nodeFactory = nodeFactory;
exports.markFactory = markFactory;
exports.clean = exports.slice = exports.fragment = exports.RefsTracker = void 0;

var _flatten2 = _interopRequireDefault(require("lodash/flatten"));

var _core = require("@remirror/core");

var _prosemirrorModel = require("prosemirror-model");

var _testSchema = require("./test-schema");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * ProseMirror doesn't support empty text nodes, which can be quite
 * inconvenient when you want to capture a position ref without introducing
 * text.
 *
 * Take a couple of examples:
 *
 *     p('{<>}')
 *     p('Hello ', '{<>}', 'world!')
 *
 * After the ref syntax is stripped you're left with:
 *
 *     p('')
 *     p('Hello ', '', 'world!')
 *
 * This violates the rule of text nodes being non-empty. This class solves the
 * problem by providing an alternative data structure that *only* stores refs,
 * and can be used in scenarios where an empty text would be forbidden.
 *
 * This is done under the hood when using `text()` factory, and instead of
 * always returning a text node, it'll instead return one of two things:
 *
 * - a text node -- when given a non-empty string
 * - a refs tracker -- when given a string that *only* contains refs.
 */
class RefsTracker {}
/**
 * A standard ProseMirror Node that also tracks refs.
 */


exports.RefsTracker = RefsTracker;

/**
 * Create a text node.
 *
 * Special markers called "refs" can be put in the text. Refs provide a way to
 * declaratively describe a position within some text, and then access the
 * position in the resulting node.
 */
function text(value, schema) {
  let stripped = '';
  let textIndex = 0;
  const refs = {}; // Helpers

  const isEven = n => n % 2 === 0;

  for (const match of (0, _core.findMatches)(value, /([\\]+)?{(\w+|<|>|<>|<cell|cell>)}/g)) {
    const [refToken, skipChars, refName] = match;
    let {
      index
    } = match;
    const skipLen = skipChars && skipChars.length;

    if (skipLen) {
      if (isEven(skipLen)) {
        index += skipLen / 2;
      } else {
        stripped += value.slice(textIndex, index + (skipLen - 1) / 2);
        stripped += value.slice(index + skipLen, index + refToken.length);
        textIndex = index + refToken.length;
        continue;
      }
    }

    stripped += value.slice(textIndex, index);
    refs[refName] = stripped.length;
    textIndex = match.index + refToken.length;
  }

  stripped += value.slice(textIndex);
  const node = stripped === '' ? new RefsTracker() : schema.text(stripped);
  node.refs = refs;
  return node;
}
/**
 * Offset ref position values by some amount.
 */


function offsetRefs(refs, offset) {
  const result = {};

  for (const name in refs) {
    if (refs.hasOwnProperty(name)) {
      result[name] = refs[name] + offset;
    }
  }

  return result;
}
/**
 * Given a collection of nodes, sequence them in an array and return the result
 * along with the updated refs.
 */


function sequence(...content) {
  let position = 0;
  let refs = {};
  const nodes = []; // It's bizarre that this is necessary. An if/else in the for...of should have
  // sufficient but it did not work at the time of writing.

  const isRefsTracker = n => n instanceof RefsTracker;

  const isRefsNode = n => !isRefsTracker(n);

  for (const node of content) {
    if (isRefsTracker(node)) {
      refs = _objectSpread({}, refs, offsetRefs(node.refs, position));
    }

    if (isRefsNode(node)) {
      const thickness = node.isText ? 0 : 1;
      refs = _objectSpread({}, refs, offsetRefs(node.refs, position + thickness));
      position += node.nodeSize;
      nodes.push(node);
    }
  }

  return {
    nodes,
    refs
  };
}
/**
 * Coerce builder content into ref nodes.
 */


function coerce(content, schema) {
  const refsContent = content.map(item => typeof item === 'string' ? text(item, schema) : item(schema));
  return sequence(...(0, _flatten2.default)(refsContent));
}
/**
 * Create a factory for nodes.
 */


function nodeFactory(type, attrs = {}, marks) {
  return (...content) => {
    return schema => {
      const {
        nodes,
        refs
      } = coerce(content, schema);
      const nodeBuilder = schema.nodes[type.name];

      if (!nodeBuilder) {
        throw new Error(`Node: "${type.name}" doesn't exist in schema. It's usually caused by lacking of a plugin that contributes this node. Schema contains following nodes: ${Object.keys(schema.nodes).join(', ')}`);
      }

      const node = nodeBuilder.createChecked(attrs, nodes, marks);
      node.refs = refs;
      return node;
    };
  };
}
/**
 * Create a factory for marks.
 */


function markFactory(type, attrs = {}, allowDupes = false) {
  return (...content) => {
    return schema => {
      const markBuilder = schema.marks[type.name];

      if (!markBuilder) {
        throw new Error(`Mark: "${type.name}" doesn't exist in schema. It's usually caused by lacking of a plugin that contributes this mark. Schema contains following marks: ${Object.keys(schema.marks).join(', ')}`);
      }

      const mark = markBuilder.create(attrs);
      const {
        nodes
      } = coerce(content, schema);
      return nodes.map(node => {
        if (!allowDupes && mark.type.isInSet(node.marks)) {
          return node;
        } else {
          const refNode = node.mark(mark.addToSet(node.marks));
          refNode.refs = node.refs;
          return refNode;
        }
      });
    };
  };
}

const fragment = (...content) => (0, _flatten2.default)(content);

exports.fragment = fragment;

const slice = (...content) => new _prosemirrorModel.Slice(_prosemirrorModel.Fragment.from(coerce(content, _testSchema.testSchema).nodes), 0, 0);
/**
 * Builds a 'clean' version of the nodes, without Refs or RefTrackers
 */


exports.slice = slice;

const clean = content => schema => {
  const node = content(schema);

  if (Array.isArray(node)) {
    return node.reduce((acc, next) => {
      if (next instanceof _prosemirrorModel.Node) {
        acc.push(_prosemirrorModel.Node.fromJSON(schema, next.toJSON()));
      }

      return acc;
    }, []);
  }

  return node instanceof _prosemirrorModel.Node ? _prosemirrorModel.Node.fromJSON(schema, node.toJSON()) : undefined;
};

exports.clean = clean;
//# sourceMappingURL=builder.js.map