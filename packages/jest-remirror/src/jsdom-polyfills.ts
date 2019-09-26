import { environment, isTextDOMNode } from '@remirror/core';
import { readFileSync } from 'fs';

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
    const getInnerText = (node: Node): string =>
      Array.prototype.slice.call(node.childNodes).reduce((text, child) => {
        if (child.nodeType === child.TEXT_NODE) {
          return `${text}${child.textContent}`;
        }

        if (child.childNodes.length) {
          return `${text}${getInnerText(child)}`;
        }

        return text;
      }, '');

    Object.defineProperty(HTMLElement.prototype, 'innerText', {
      configurable: false,
      enumerable: true,
      get() {
        return getInnerText(this);
      },
      set(text) {
        const textNodes = Array.prototype.slice.call(this.childNodes).filter(node => isTextDOMNode(node));

        // If there's only one child that is a text node, update it
        if (textNodes.length === 1) {
          textNodes[0].textContent = text;
          return;
        }

        // Remove all child nodes as per WHATWG LS Spec
        Array.prototype.slice.call(this.childNodes).forEach(node => this.removeChild(node));

        // Append a single text child node with the text
        this.appendChild(this.ownerDocument.createTextNode(text));
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

  document.getSelection = window.getSelection = () => {
    return {
      addRange: _ => {},
      removeAllRanges: () => {},
    } as Selection;
  };

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

  document.createRange = () =>
    ({
      setStart: () => {},
      setEnd: () => {},
      commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document,
      } as Node,
    } as any);

  // Taken from https://github.com/jsdom/jsdom/issues/639#issuecomment-371278152
  const mutationObserver = readFileSync(require.resolve('mutationobserver-shim'), { encoding: 'utf-8' });
  const mutationObserverScript = window.document.createElement('script');
  mutationObserverScript.textContent = mutationObserver;

  window.document.head.appendChild(mutationObserverScript);
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
