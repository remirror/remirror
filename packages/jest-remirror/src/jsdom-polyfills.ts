import { readFileSync } from 'fs';
import sanitizeHtml from 'sanitize-html';

import { environment, isFunction, noop } from 'remirror/core';

/**
 * Polyfill DOMElement.innerText because JSDOM lacks support for it.
 * See {@link https://github.com/tmpvar/jsdom/issues/1245}
 */

export const jsdomPolyfill = () => {
  // Do nothing if not in a jsdom environment
  if (!environment.isJSDOM) {
    return;
  }

  if (!('innerText' in document.createElement('a'))) {
    Object.defineProperty(Element.prototype, 'innerText', {
      get() {
        return sanitizeHtml(this.textContent, {
          allowedTags: [], // remove all tags and return text content only
          allowedAttributes: {}, // remove all tags and return text content only
        });
      },
      configurable: true, // make it so that it doesn't blow chunks on re-running tests with things like --watch
    });
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = () => {
      if (!window.ignoreAllJSDOMWarnings && !window.hasWarnedAboutCancelAnimationFramePolyfill) {
        window.hasWarnedAboutCancelAnimationFramePolyfill = true;
        console.warn(
          'Warning! Test uses DOM cancelAnimationFrame API which is not available in JSDOM/Node environment.',
        );
      }
    };
  }
};

/** To fix Prosemirror tests in jsdom */
export const jsdomExtras = () => {
  // Do nothing if not in a jsdom environment
  if (!environment.isJSDOM) {
    return;
  }

  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect.bind(
    Element.prototype,
  );

  Element.prototype.getBoundingClientRect = function () {
    if (isFunction(originalGetBoundingClientRect)) {
      try {
        return originalGetBoundingClientRect();
      } catch {
        // Oh well...
      }
    }

    return {
      toJSON() {
        return {};
      },
      width: Number.parseFloat((this as HTMLElement).style?.width) ?? 0,
      height: Number.parseFloat((this as HTMLElement).style?.height) ?? 0,
      top: Number.parseFloat((this as HTMLElement).style?.marginTop) ?? 0,
      left: Number.parseFloat((this as HTMLElement).style?.marginLeft) ?? 0,
      x: Number.parseFloat((this as HTMLElement).style?.marginLeft) ?? 0,
      y: Number.parseFloat((this as HTMLElement).style?.marginTop) ?? 0,
      right: Number.parseFloat((this as HTMLElement).style?.width) ?? 0,
      bottom: Number.parseFloat((this as HTMLElement).style?.height) ?? 0,
    };
  };

  const originalGetClientRects = Element.prototype.getClientRects;

  Element.prototype.getClientRects = function () {
    if (isFunction(originalGetClientRects)) {
      try {
        return originalGetClientRects();
      } catch {
        // If at first you don't succeed, roll your own polyfill.
      }
    }

    const rects: DOMRectList = [] as any;
    rects.item = (_: number) => null;

    return rects;
  };

  Range.prototype.getClientRects = Element.prototype.getClientRects;
  Range.prototype.getBoundingClientRect = Element.prototype.getBoundingClientRect;

  // Copied from react-beautiful-dnd/test/setup.js
  // overriding these properties in jsdom to allow them to be controlled
  Object.defineProperties(document.documentElement, {
    clientWidth: {
      writable: true,
      value: document.documentElement.clientWidth,
    },
    clientHeight: {
      writable: true,
      value: document.documentElement.clientHeight,
    },
    scrollWidth: {
      writable: true,
      value: document.documentElement.scrollWidth,
    },
    scrollHeight: {
      writable: true,
      value: document.documentElement.scrollHeight,
    },
  });

  // Setting initial viewport
  // Need to set clientWidth and clientHeight as jsdom does not set these properties
  (document.documentElement as any).clientWidth = window.innerWidth;
  (document.documentElement as any).clientHeight = window.innerHeight;

  document.createRange =
    document.createRange ??
    (() =>
      ({
        setStart: noop,
        setEnd: noop,
        commonAncestorContainer: {
          nodeName: 'BODY',
          ownerDocument: document,
        } as Node,
      } as any));

  // Taken from https://github.com/jsdom/jsdom/issues/639#issuecomment-371278152
  const mutationObserver = readFileSync(require.resolve('mutationobserver-shim'), {
    encoding: 'utf-8',
  });
  const mutationObserverScript = window.document.createElement('script');
  mutationObserverScript.textContent = mutationObserver;

  window.document.head.append(mutationObserverScript);
};

/**
 * There are a few warnings about unsupported JSDOM APIS. Calling this function with
 * true turns them all off.
 */
export const ignoreJSDOMWarnings = (val = true) => {
  if (!environment.isJSDOM) {
    return;
  }
  window.ignoreAllJSDOMWarnings = val;
};
