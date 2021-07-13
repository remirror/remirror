import { readFileSync } from 'fs';
import sanitizeHtml from 'sanitize-html';
import warning from 'tiny-warning';
import { environment, isFunction, noop } from '@remirror/core';

/**
 * Polyfill DOMElement.innerText because JSDOM lacks support for it. See
 * {@link https://github.com/tmpvar/jsdom/issues/1245}
 */

export function jsdomPolyfill(): void {
  // Do nothing if not in a jsdom environment
  if (!environment.isJSDOM) {
    return;
  }

  supportBoundingClientRect();
  supportMutationObserver();
  supportCancelAnimationFrame();
  supportInnerTextInAnchors();
  supportRanges();
  supportAdjustableSizes();
}

/**
 * There are a few warnings about unsupported JSDOM APIS. Calling this function
 * with true turns them all off.
 *
 * @param shouldIgnore - whether to ignore. Defaults to `true`.
 */
export function ignoreJSDOMWarnings(shouldIgnore = true): void {
  if (!environment.isJSDOM) {
    return;
  }

  window.ignoreAllJSDOMWarnings = shouldIgnore;
}

/**
 * This method adds fixes to the jsdom environment so that `jest-remirror`
 * tests can be run.
 *
 * @deprecated - Use `jsdomPolyfill` instead.
 */
export function jsdomExtras(): void {
  // Will be removed in the beta release.
}

/**
 * Add pseudo support for bounding client rects.
 */
function supportBoundingClientRect() {
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect.bind(
    Element.prototype,
  );

  if (!window.DOMRect) {
    global.DOMRect = window.DOMRect = class DOMRect {
      public left: number;
      public right: number;
      public top: number;
      public bottom: number;
      constructor(
        public x: number = 0,
        public y: number = 0,
        public width: number = 0,
        public height: number = 0,
      ) {
        this.left = 0;
        this.right = 0;
        this.top = 0;
        this.bottom = 0;
      }

      fromRect(_?: DOMRect) {
        return new DOMRect();
      }
    } as any;
  }

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

  Element.prototype.getClientRects = function (): DOMRectList {
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
}

/**
 * Add a fake mutation observer when none is available via jsdom.
 */
function supportMutationObserver(): void {
  if (window.MutationObserver) {
    return;
  }

  // Taken from
  // https://github.com/jsdom/jsdom/issues/639#issuecomment-371278152
  const mutationObserver = readFileSync(require.resolve('mutationobserver-shim'), {
    encoding: 'utf-8',
  });

  const mutationObserverScript = window.document.createElement('script');
  mutationObserverScript.textContent = mutationObserver;

  window.document.head.append(mutationObserverScript);
}

/**
 * Add pseudo support for cancelling animation frames.
 */
function supportCancelAnimationFrame() {
  if (isFunction(window.cancelAnimationFrame)) {
    return;
  }

  window.cancelAnimationFrame = () => {
    if (!window.ignoreAllJSDOMWarnings && !window.hasWarnedAboutCancelAnimationFramePolyfill) {
      window.hasWarnedAboutCancelAnimationFramePolyfill = true;
      warning(
        true,
        'Warning! Test uses DOM cancelAnimationFrame API which is not available in JSDOM/Node environment.',
      );
    }
  };
}

/**
 * Add support for inner text within anchor tags.
 */
function supportInnerTextInAnchors() {
  if ('innerText' in document.createElement('a')) {
    return;
  }

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

/**
 * Support ranges in jsdom.
 */
function supportRanges() {
  // Fix breaking configuration for `jsdom < 16`
  if (window.Range) {
    window.Range.prototype.getClientRects = Element.prototype.getClientRects;
    window.Range.prototype.getBoundingClientRect = Element.prototype.getBoundingClientRect;
  }

  function fakeCreateRange() {
    return {
      setStart: noop,
      setEnd: noop,
      commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document,
      } as Node,
    } as any;
  }

  // Create a fake range for selections.
  document.createRange = document.createRange ?? fakeCreateRange;
}

/**
 * Add support overriding document size properties so they can be controlled and
 * mocked when running tests which depend on them.
 *
 * Credit to `react-beautiful-dnd`
 * https://github.com/atlassian/react-beautiful-dnd/blob/ec06fa266e1617cab2402e0613b36d88b9547f7f/test/env-setup.js
 */
function supportAdjustableSizes() {
  Object.defineProperties(document.documentElement, {
    clientWidth: {
      writable: true,
      value: document.documentElement.clientWidth ?? window.innerWidth,
    },
    clientHeight: {
      writable: true,
      value: document.documentElement.clientHeight ?? window.innerHeight,
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
}
