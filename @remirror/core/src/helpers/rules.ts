import { InputRule } from 'prosemirror-inputrules';
import { Fragment, MarkType, Node as PMNode, Slice } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { Attrs, GetAttrs, InputRuleCreator } from '../types';
import { findMatches, isFunction } from './base';

/**
 * Creates an input rule based on the provided regex for the provided mark type
 *
 * @param regex - the regex matcher
 * @param type - the mark type
 * @param getAttrs - the attributes or attribute creating function
 *
 * @public
 */
export const markInputRule = (
  regex: RegExp,
  type: MarkType,
  getAttrs?: ((attrs: string[]) => Attrs) | Attrs,
) => {
  return new InputRule(regex, (state, match, start, end) => {
    const attrs = isFunction(getAttrs) ? getAttrs(match) : getAttrs;
    const { tr } = state;
    let markEnd = end;

    if (match[1]) {
      const startSpaces = match[0].search(/\S/);
      const textStart = start + match[0].indexOf(match[1]);
      const textEnd = textStart + match[1].length;
      if (textEnd < end) {
        tr.delete(textEnd, end);
      }
      if (textStart > start) {
        tr.delete(start + startSpaces, textStart);
      }
      markEnd = start + startSpaces + match[1].length;
    }

    tr.addMark(start, markEnd, type.create(attrs));
    tr.removeStoredMark(type); // Do not continue with mark.
    return tr;
  });
};

/**
 * Creates a paste rule based on the provided regex for the provided mark type
 *
 * @param regex - the regex matcher
 * @param type - the mark type
 * @param getAttrs - the attributes or attribute creating function
 *
 * @public
 */
export const markPasteRule = (regexp: RegExp, type: MarkType, getAttrs?: GetAttrs) => {
  const handler = (fragment: Fragment) => {
    const nodes: PMNode[] = [];

    fragment.forEach(child => {
      if (child.isText) {
        const text = child.text || '';
        let pos = 0;

        // ? For some reason including the index param makes this work. I'm not sure why...?
        findMatches(text, regexp).forEach((match, _) => {
          if (match[1]) {
            const start = match.index;
            const end = start + match[0].length;
            const attrs = isFunction(getAttrs) ? getAttrs(match) : getAttrs;

            if (start > 0) {
              nodes.push(child.cut(pos, start));
            }

            nodes.push(child.cut(start, end).mark(type.create(attrs).addToSet(child.marks)));

            pos = end;
          }
        });

        if (text && pos < text.length) {
          nodes.push(child.cut(pos));
        }
      } else {
        nodes.push(child.copy(handler(child.content)));
      }
    });

    return Fragment.fromArray(nodes);
  };

  return new Plugin({
    props: {
      transformPasted: slice => new Slice(handler(slice.content), slice.openStart, slice.openEnd),
    },
  });
};

/**
 * Creates an node input rule based on the provided regex for the provided node type
 *
 * @param regex - the regex matcher
 * @param type - the node type
 * @param getAttrs - the attributes or attribute creating function
 *
 * @public
 */
export const nodeInputRule: InputRuleCreator = (regexp, type, getAttrs) => {
  return new InputRule(regexp, (state, match, start, end) => {
    const attrs = isFunction(getAttrs) ? getAttrs(match) : getAttrs;
    const { tr } = state;

    if (match[0]) {
      tr.replaceWith(start - 1, end, type.create(attrs!));
    }

    return tr;
  });
};

/**
 * Creates an enhanced node input rule based on the provided regex for the provided node type.
 *
 * @remarks
 * This is different from the node input rule in that it checks that the start end end are both
 * valid and replaces from the start position.
 *
 * @param regex - the regex matcher
 * @param type - the node type
 * @param getAttrs - the attributes or attribute creating function
 *
 * @public
 */
export const enhancedNodeInputRule: InputRuleCreator = (regexp, type, getAttrs) => {
  return new InputRule(regexp, (state, match, start, end) => {
    end = start > end ? start : end;
    const attrs = isFunction(getAttrs) ? getAttrs(match) : getAttrs;
    const { tr } = state;

    const str = match[0];

    if (str) {
      tr.replaceWith(start, end, type.create(attrs!));
    }

    return tr;
  });
};
