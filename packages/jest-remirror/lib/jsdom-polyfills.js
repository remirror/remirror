"use strict";

/**
 * Polyfill DOMElement.innerText because JSDOM lacks support for it.
 * @link https://github.com/tmpvar/jsdom/issues/1245
 */
if (!('innerText' in document.createElement('a'))) {
  const getInnerText = node => Array.prototype.slice.call(node.childNodes).reduce((text, child) => {
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
      const textNodes = Array.prototype.slice.call(this.childNodes).filter(node => node.nodeType === node.TEXT_NODE); // If there's only one child that is a text node, update it

      if (textNodes.length === 1) {
        textNodes[0].textContent = text;
        return;
      } // Remove all child nodes as per WHATWG LS Spec


      Array.prototype.slice.call(this.childNodes).forEach(node => this.removeChild(node)); // Append a single text child node with the text

      this.appendChild(this.ownerDocument.createTextNode(text));
    }

  });
}

if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = () => {
    if (!window.hasWarnedAboutCancelAnimationFramePolyfill) {
      window.hasWarnedAboutCancelAnimationFramePolyfill = true;
      console.warn('Warning! Test uses DOM cancelAnimationFrame API which is not available in JSDOM/Node environment.');
    }
  };
}
//# sourceMappingURL=jsdom-polyfills.js.map