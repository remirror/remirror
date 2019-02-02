import { Fragment, Mark, Node as PMNode, Slice } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { Cast } from '../helpers';
import { PluginCreator } from '../types';

export const markPasteRule: PluginCreator = (regexp, type, getAttrs) => {
  const handler = (fragment: Fragment) => {
    const nodes: PMNode[] = [];

    fragment.forEach(child => {
      if (child.isText) {
        const { text } = child;
        let pos = 0;
        let match: RegExpExecArray | null;

        // tslint:disable-next-line:no-conditional-assignment
        match = regexp.exec(text!);
        while (match !== null) {
          if (match[1]) {
            const start = match.index;
            const end = start + match[0].length;
            const textStart = start + match[0].indexOf(match[1]);
            const textEnd = textStart + match[1].length;
            const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;

            // adding text before markdown to nodes
            if (start > 0) {
              nodes.push(child.cut(pos, start));
            }

            // adding the markdown part to nodes
            nodes.push(
              child
                .cut(textStart, textEnd)
                .mark(Cast<Mark>(type.create(attrs!)).addToSet(child.marks)),
            );

            pos = end;
          }
          match = regexp.exec(text!);
        }

        // adding rest of text to nodes
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
