import {
  Attrs,
  Cast,
  CommandFunction,
  EditorSchema,
  NodeExtension,
  NodeExtensionSpec,
  SchemaNodeTypeParams,
} from '@remirror/core';
import { ResolvedPos } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';

const hasCursor = <T extends {}>(arg: T): arg is T & { $cursor: ResolvedPos } => {
  return Boolean(Cast(arg).$cursor);
};

export class Image extends NodeExtension {
  get name(): 'image' {
    return 'image';
  }

  get schema(): NodeExtensionSpec {
    return {
      inline: true,
      attrs: {
        src: {},
        alt: {
          default: null,
        },
        title: {
          default: null,
        },
        ...this.extraAttrs(),
      },
      group: 'inline',
      draggable: true,
      parseDOM: [
        {
          tag: 'img[src]',
          getAttrs: dom => ({
            src: Cast<Element>(dom).getAttribute('src'),
            title: Cast<Element>(dom).getAttribute('title'),
            alt: Cast<Element>(dom).getAttribute('alt'),
          }),
        },
      ],
      toDOM: node => ['img', node.attrs],
    };
  }

  public commands({ type }: SchemaNodeTypeParams) {
    return (attrs?: Attrs): CommandFunction => (state, dispatch) => {
      if (!dispatch) {
        return false;
      }
      const { selection } = state;
      const position = hasCursor(selection) ? selection.$cursor.pos : selection.$to.pos;
      const node = type.create(attrs);
      const transaction = state.tr.insert(position, node);
      dispatch(transaction);
      return true;
    };
  }

  public plugins() {
    return [
      new Plugin<EditorSchema>({
        props: {
          handleDOMEvents: {
            drop(view, e) {
              const event = Cast<DragEvent>(e);
              const hasFiles =
                event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length;

              if (!hasFiles) {
                return false;
              }

              const images = Array.from(event.dataTransfer!.files).filter(file => /image/i.test(file.type));

              if (images.length === 0) {
                return false;
              }

              event.preventDefault();

              const { schema } = view.state;
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });

              images.forEach(image => {
                const reader = new FileReader();

                reader.onload = readerEvent => {
                  const node = schema.nodes.image.create({
                    src: readerEvent && readerEvent.target && Cast(readerEvent.target).result,
                  });
                  const transaction = view.state.tr.insert(coordinates!.pos, node);
                  view.dispatch(transaction);
                };
                reader.readAsDataURL(image);
              });
              return true;
            },
          },
        },
      }),
    ];
  }
}
