import { Plugin } from 'prosemirror-state';

import { Cast } from '@remirror/core';

export const createImageExtensionPlugin = () => {
  return new Plugin({
    props: {
      handleDOMEvents: {
        drop(view, e) {
          const event = Cast<DragEvent>(e);
          const hasFiles =
            event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length;

          if (!hasFiles || !event.dataTransfer) {
            return false;
          }

          const images = Array.from(event.dataTransfer.files).filter((file) =>
            /image/i.test(file.type),
          );

          if (images.length === 0) {
            return false;
          }

          const { schema } = view.state;
          const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });

          if (!coordinates) {
            return false;
          }

          event.preventDefault();

          images.forEach((image) => {
            const reader = new FileReader();

            reader.onload = (readerEvent) => {
              const node = schema.nodes.image.create({
                src: readerEvent.target && Cast(readerEvent.target).result,
              });
              const transaction = view.state.tr.insert(coordinates.pos, node);

              view.dispatch(transaction);
            };
            reader.readAsDataURL(image);
          });
          return true;
        },
      },
    },
  });
};
