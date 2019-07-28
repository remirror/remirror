import { Plugin } from 'prosemirror-state';
import { dropPoint } from 'prosemirror-transform';

export function createDropCursorPlugin(options = {}) {
  return new Plugin({
    view(editorView) {
      return new DropCursorView(editorView, options);
    },
    props: {
      handleDOMEvents: {
        dragover: (view, event) => {},
      },
    },
  });
}

class DropCursorView {
  constructor(editorView, options) {
    this.editorView = editorView;
    this.width = options.width || 1;
    this.color = options.color || 'black';
    this.cursorPos = null;
    this.element = null;
    this.timeout = null;

    this.handlers = ['dragover', 'dragend', 'drop', 'dragleave'].map(name => {
      const handler = e => this[name](e);
      editorView.dom.addEventListener(name, handler);
      return { name, handler };
    });
  }

  public destroy() {
    this.handlers.forEach(({ name, handler }) => this.editorView.dom.removeEventListener(name, handler));
  }

  public update(editorView, prevState) {
    if (this.cursorPos != null && prevState.doc != editorView.state.doc) {
      this.updateOverlay();
    }
  }

  public setCursor(pos) {
    if (pos == this.cursorPos) {
      return;
    }
    this.cursorPos = pos;
    if (pos == null) {
      this.element.remove();
      this.element = null;
    } else {
      this.updateOverlay();
    }
  }

  public updateOverlay() {
    let $pos = this.editorView.state.doc.resolve(this.cursorPos),
      rect;
    if (!$pos.parent.inlineContent) {
      const before = $pos.nodeBefore,
        after = $pos.nodeAfter;
      if (before || after) {
        const nodeRect = this.editorView
          .nodeDOM(this.cursorPos - (before ? before.nodeSize : 0))
          .getBoundingClientRect();
        let top = before ? nodeRect.bottom : nodeRect.top;
        if (before && after) {
          top = (top + this.editorView.nodeDOM(this.cursorPos).getBoundingClientRect().top) / 2;
        }
        rect = {
          left: nodeRect.left,
          right: nodeRect.right,
          top: top - this.width / 2,
          bottom: top + this.width / 2,
        };
      }
    }
    if (!rect) {
      const coords = this.editorView.coordsAtPos(this.cursorPos);
      rect = {
        left: coords.left - this.width / 2,
        right: coords.left + this.width / 2,
        top: coords.top,
        bottom: coords.bottom,
      };
    }

    const parent = this.editorView.dom.offsetParent;
    if (!this.element) {
      this.element = parent.appendChild(document.createElement('div'));
      this.element.style.cssText =
        'position: absolute; z-index: 50; pointer-events: none; background-color: ' + this.color;
    }
    const parentRect =
      parent == document.body && getComputedStyle(parent).position == 'static'
        ? { left: -pageXOffset, top: -pageYOffset }
        : parent.getBoundingClientRect();
    this.element.style.left = rect.left - parentRect.left + 'px';
    this.element.style.top = rect.top - parentRect.top + 'px';
    this.element.style.width = rect.right - rect.left + 'px';
    this.element.style.height = rect.bottom - rect.top + 'px';
  }

  public scheduleRemoval(timeout) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.setCursor(null), timeout);
  }

  public dragover(event) {
    const pos = this.editorView.posAtCoords({ left: event.clientX, top: event.clientY });
    if (pos) {
      let target = pos.pos;
      if (this.editorView.dragging && this.editorView.dragging.slice) {
        target = dropPoint(this.editorView.state.doc, target, this.editorView.dragging.slice);
        if (target == null) {
          target = pos.pos;
        }
      }
      this.setCursor(target);
      this.scheduleRemoval(5000);
    }
  }

  public dragend() {
    this.scheduleRemoval(20);
  }

  public drop() {
    this.scheduleRemoval(20);
  }

  public dragleave(event) {
    if (event.target == this.editorView.dom || !this.editorView.dom.contains(event.relatedTarget)) {
      this.setCursor(null);
    }
  }
}
