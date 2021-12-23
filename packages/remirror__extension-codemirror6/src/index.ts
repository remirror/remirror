import _objectSpread from '@babel/runtime/helpers/esm/objectSpread2';
import { oneDark } from '@codemirror/theme-one-dark';
import { extension, NodeExtension, isElementDomNode } from '@remirror/core';
import _defineProperty from '@babel/runtime/helpers/esm/defineProperty';
import { defaultKeymap } from '@codemirror/commands';
import { EditorState, Prec } from '@codemirror/state';
import { keymap, EditorView } from '@codemirror/view';
import { exitCode } from '@remirror/pm/commands';
import { Selection, TextSelection } from '@remirror/pm/state';

class CodeMirror6NodeView {
  constructor(_ref) {
    var node = _ref.node,
        view = _ref.view,
        getPos = _ref.getPos,
        extensions = _ref.extensions;

    _defineProperty(this, "updating", false);

    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.schema = node.type.schema;
    var changeFilter = EditorState.changeFilter.of(tr => {
      if (!tr.docChanged && !this.updating) {
        this.forwardSelection();
      }

      return true;
    }); // Create the initial CodeMirror state

    var startState = EditorState.create({
      doc: this.node.textContent,
      extensions: [keymap.of(defaultKeymap), // We give the following keymap a higher precedence so that it can
      // override the default `ArrowUp` and `ArrowDown` keymaps
      Prec.high(keymap.of(this.codeMirrorKeymap())), changeFilter, ...(extensions !== null && extensions !== void 0 ? extensions : [])]
    }); // Create a CodeMirror instance

    this.cm = new EditorView({
      state: startState,
      dispatch: this.valueChanged.bind(this)
    }); // The editor's outer node is our DOM representation

    this.dom = this.cm.dom;
  }

  update(node) {
    if (node.type !== this.node.type) {
      return false;
    }

    this.node = node;
    var change = computeChange(this.cm.state.doc.toString(), node.textContent);

    if (change) {
      this.updating = true;
      this.cm.dispatch({
        changes: {
          from: change.from,
          to: change.to,
          insert: change.text
        }
      });
      this.updating = false;
    }

    return true;
  }
  /**
   * Synchronize the selections from ProseMirror to CodeMirrror
   */


  setSelection(anchor, head) {
    this.cm.focus();
    this.updating = true;
    this.cm.dispatch({
      selection: {
        anchor,
        head
      }
    });
    this.updating = false;
  }

  selectNode() {
    this.focus();
  }

  focus() {
    this.cm.focus();
    this.forwardSelection();
  }

  stopEvent() {
    return true;
  }

  destroy() {
    this.cm.destroy();
  }
  /**
   * When the code editor is focused, we can keep the selection of the outer
   * editor synchronized with the inner one, so that any commands executed on
   * the outer editor see an accurate selection.
   */


  forwardSelection() {
    if (!this.cm.hasFocus) {
      return;
    }

    var state = this.view.state;
    var selection = this.asProseMirrorSelection(state.doc);

    if (!selection.eq(state.selection)) {
      this.view.dispatch(state.tr.setSelection(selection));
    }
  }
  /**
   * This helper function translates from a CodeMirror selection to a
   * ProseMirror selection.
   */


  asProseMirrorSelection(doc) {
    var start = this.getPos() + 1;
    var _this$cm$state$select = this.cm.state.selection.main,
        anchor = _this$cm$state$select.anchor,
        head = _this$cm$state$select.head;
    return TextSelection.create(doc, anchor + start, head + start);
  }
  /**
   * A somewhat tricky aspect of nesting editor like this is handling cursor
   * motion across the edges of the inner editor. This node view will have to
   * take care of allowing the user to move the selection out of the code
   * editor. For that purpose, it binds the arrow keys to handlers that check if
   * further motion would ‘escape’ the editor, and if so, return the selection
   * and focus to the outer editor.
   *
   * The keymap also binds ctrl-enter, which, in ProseMirror's base keymap,
   * creates a  new paragraph after a code block.
   */


  codeMirrorKeymap() {
    return [{
      key: 'ArrowUp',
      run: this.maybeEscape('line', -1)
    }, {
      key: 'ArrowLeft',
      run: this.maybeEscape('char', -1)
    }, {
      key: 'ArrowDown',
      run: this.maybeEscape('line', 1)
    }, {
      key: 'ArrowRight',
      run: this.maybeEscape('char', 1)
    }, {
      key: 'Ctrl-Enter',
      run: () => {
        if (exitCode(this.view.state, this.view.dispatch)) {
          this.view.focus();
          return true;
        }

        return false;
      }
    }];
  }
  /**
   * When the actual content of the code editor is changed, the event handler
   * registered in the node view's constructor calls this method. It'll compare
   * the code block node's current value to the value in the editor, and
   * dispatch a transaction if there is a difference.
   */


  valueChanged(tr) {
    this.cm.update([tr]);

    if (!tr.docChanged || this.updating) {
      return;
    }

    var change = computeChange(this.node.textContent, tr.state.doc.toString());

    if (change) {
      var start = this.getPos() + 1;

      var _tr = this.view.state.tr.replaceWith(start + change.from, start + change.to, change.text ? this.schema.text(change.text) : []);

      this.view.dispatch(_tr);
    }
  }

  maybeEscape(unit, dir) {
    return view => {
      var state = view.state; // Exit if the selection is not empty

      if (state.selection.ranges.some(range => !range.empty)) {
        return false;
      }

      var anchor = state.selection.main.anchor;
      var line = state.doc.lineAt(anchor);
      var lineOffset = anchor - line.from;

      if (line.number !== (dir < 0 ? 1 : state.doc.lines) || unit === 'char' && lineOffset !== (dir < 0 ? 0 : line.length)) {
        return false;
      }

      var targetPos = this.getPos() + (dir < 0 ? 0 : this.node.nodeSize);
      var selection = Selection.near(this.view.state.doc.resolve(targetPos), dir);
      this.view.dispatch(this.view.state.tr.setSelection(selection).scrollIntoView());
      this.view.focus();
      return true;
    };
  }

}
/**
 * Compare two strings and find the minimal change between them
 *
 * It iterates from the start and end of the strings, until it hits a difference, and returns an object
 * giving the change's start, end, and replacement text, or null if there was no change.
 */


function computeChange(oldVal, newVal) {
  if (oldVal === newVal) {
    return null;
  }

  var start = 0;
  var oldEnd = oldVal.length;
  var newEnd = newVal.length;

  while (start < oldEnd && oldVal.charCodeAt(start) === newVal.charCodeAt(start)) {
    ++start;
  }

  while (oldEnd > start && newEnd > start && oldVal.charCodeAt(oldEnd - 1) === newVal.charCodeAt(newEnd - 1)) {
    oldEnd--;
    newEnd--;
  }

  return {
    from: start,
    to: oldEnd,
    text: newVal.slice(start, newEnd)
  };
}
/**
 * Handling cursor motion from the outer to the inner editor must be done with a
 * keymap on the outer editor. The `arrowHandler` function uses the
 * `endOfTextblock` method to determine, in a bidi-text-aware way, whether the
 * cursor is at the end of a given textblock. If it is, and the next block is a
 * code block, the selection is moved into it.
 *
 * Adapted from https://prosemirror.net/examples/codemirror/
 */


function arrowHandler(dir) {
  return _ref => {
    var dispatch = _ref.dispatch,
        view = _ref.view,
        tr = _ref.tr;

    if (!view) {
      return false;
    }

    if (!(tr.selection.empty && view.endOfTextblock(dir))) {
      return false;
    }

    var side = dir === 'left' || dir === 'up' ? -1 : 1;
    var $head = tr.selection.$head;
    var nextPos = Selection.near(tr.doc.resolve(side > 0 ? $head.after() : $head.before()), side);

    if (nextPos.$head && nextPos.$head.parent.type.name === 'codeMirror') {
      dispatch === null || dispatch === void 0 ? void 0 : dispatch(tr.setSelection(nextPos));
      return true;
    }

    return false;
  };
}

var _dec, _class;

var CodeMirrorExtension = (_dec = extension({
  defaultOptions: {
    extensions: [oneDark],
    languages: null
  }
}), _dec(_class = class CodeMirrorExtension extends NodeExtension {
  get name() {
    return 'codeMirror';
  }

  createNodeSpec(extra, override) {
    var _override$parseDOM;

    return _objectSpread(_objectSpread({
      group: 'block',
      content: 'text*',
      marks: '',
      defining: true
    }, override), {}, {
      code: true,
      attrs: _objectSpread(_objectSpread({}, extra.defaults()), {}, {
        codeMirrorConfig: {
          default: undefined
        },
        language: {
          default: undefined
        }
      }),
      parseDOM: [{
        tag: 'pre',
        getAttrs: node => isElementDomNode(node) ? extra.parse(node) : false
      }, ...((_override$parseDOM = override.parseDOM) !== null && _override$parseDOM !== void 0 ? _override$parseDOM : [])],

      toDOM() {
        return ['pre', ['code', 0]];
      },

      isolating: true
    });
  }

  createNodeViews() {
    return (node, view, getPos) => {
      return new CodeMirror6NodeView({
        node,
        view,
        getPos: getPos,
        extensions: this.options.extensions
      });
    };
  }

  createKeymap() {
    return {
      ArrowLeft: arrowHandler('left'),
      ArrowRight: arrowHandler('right'),
      ArrowUp: arrowHandler('up'),
      ArrowDown: arrowHandler('down')
    };
  }

}) || _class);

export { CodeMirrorExtension };
arrowHandler('up'),
      ArrowDown: arrowHandler('down')
    };
  }

}) || _class);

exports.CodeMirrorExtension = CodeMirrorExtension;
