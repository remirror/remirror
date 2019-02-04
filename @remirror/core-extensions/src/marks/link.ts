import {
  Attrs,
  Cast,
  getMarkRange,
  MarkExtension,
  MarkExtensionSpec,
  pasteRule,
  removeMark,
  SchemaMarkTypeParams,
  updateMark,
} from '@remirror/core';
import { Plugin, TextSelection } from 'prosemirror-state';

export class Link extends MarkExtension {
  get name() {
    return 'link';
  }

  get schema(): MarkExtensionSpec {
    return {
      attrs: {
        href: {
          default: null,
        },
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs: dom => ({
            href: Cast<Element>(dom).getAttribute('href'),
          }),
        },
      ],
      toDOM: node => [
        'a',
        {
          ...node.attrs,
          rel: 'noopener noreferrer nofollow',
        },
        0,
      ],
    };
  }

  public commands({ type }: SchemaMarkTypeParams) {
    return (attrs?: Attrs) => {
      if (attrs && attrs.href) {
        return updateMark(type, attrs);
      }

      return removeMark(type);
    };
  }

  public pasteRules({ type }: SchemaMarkTypeParams) {
    return [
      pasteRule(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g,
        type,
        url => ({ href: url as string }),
      ),
    ];
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          handleClick(view, pos) {
            const { schema, doc, tr } = view.state;
            const range = getMarkRange(doc.resolve(pos), schema.marks.link);

            if (!range) {
              return false;
            }

            const $start = doc.resolve(range.from);
            const $end = doc.resolve(range.to);
            const transaction = tr.setSelection(new TextSelection($start, $end));

            view.dispatch(transaction);
            return true;
          },
        },
      }),
    ];
  }
}
