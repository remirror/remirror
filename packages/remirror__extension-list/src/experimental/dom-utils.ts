import { DOMOutputSpec, isEqual, isObject } from '@remirror/core';
import { Attrs, DOMSerializer } from '@remirror/pm/model';

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  attributes: Record<string, string>,
  ...children: HTMLElement[]
): HTMLElementTagNameMap[K];
export function createElement(
  tagName: string,
  attributes: Record<string, string>,
  ...children: HTMLElement[]
): HTMLElement {
  const element = document.createElement(tagName);

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }

  for (const child of children) {
    element.append(child);
  }

  return element;
}

/**
 * A simple virtual DOM renderer.
 *
 * @remarks
 *
 * Returns `false` if no changes were made or all changes were able to be
 * applied to the passed `dom` element.
 */
export function patchRender(
  prevSpec: DOMOutputSpec,
  nextSpec: DOMOutputSpec,
  dom?: Element | null,
): false | { dom: Node; contentDOM?: HTMLElement } {
  if (!dom) {
    return DOMSerializer.renderSpec(document, nextSpec);
  }

  if (prevSpec === nextSpec) {
    return false;
  }

  if (
    !(
      Array.isArray(prevSpec) &&
      Array.isArray(nextSpec) &&
      prevSpec.length === nextSpec.length &&
      prevSpec[0] === nextSpec[0]
    )
  ) {
    return DOMSerializer.renderSpec(document, nextSpec);
  }

  const holeIndex = (nextSpec as any).indexOf(0);

  if ((prevSpec as any).indexOf(0) !== holeIndex) {
    return DOMSerializer.renderSpec(document, nextSpec);
  }

  const prevAttrs: Attrs | null = isObject(prevSpec[1]) ? prevSpec[1] : null;
  const nextAttrs: Attrs | null = isObject(nextSpec[1]) ? nextSpec[1] : null;

  if (!!prevAttrs !== !!nextAttrs) {
    return DOMSerializer.renderSpec(document, nextSpec);
  }

  if (prevAttrs && nextAttrs && !isEqual(prevAttrs, nextAttrs)) {
    for (const name of Object.keys(prevAttrs)) {
      if (prevAttrs[name] != null && nextAttrs[name] == null) {
        const space = name.indexOf(' ');

        if (space > 0) {
          dom.removeAttributeNS(name.slice(0, space), name.slice(space + 1));
        } else {
          dom.removeAttribute(name);
        }
      }
    }

    for (const [name, value] of Object.entries(nextAttrs)) {
      if (nextAttrs[name] != null && nextAttrs[name] !== prevAttrs[name]) {
        const space = name.indexOf(' ');

        if (space > 0) {
          dom.setAttributeNS(name.slice(0, space), name.slice(space + 1), value);
        } else {
          dom.setAttribute(name, value);
        }
      }
    }
  }

  if (holeIndex !== -1) {
    return isEqual(prevSpec, nextSpec) ? false : { dom, contentDOM: dom as HTMLElement };
  }

  let contentDOM: HTMLElement | undefined;
  const start = nextAttrs ? 2 : 1;
  let changed = false;

  for (let i = start; i < nextSpec.length; i++) {
    const child = dom.children[i - start];
    const diff = patchRender(prevSpec[i] as DOMOutputSpec, nextSpec[i] as DOMOutputSpec, child);

    if (diff) {
      changed = true;

      if (child != null) {
        dom.replaceChild(diff.dom, child);
      } else {
        dom.append(diff.dom);
      }

      if (diff.contentDOM) {
        contentDOM = diff.contentDOM;
      }
    }
  }

  return changed ? { dom, contentDOM } : false;
}
