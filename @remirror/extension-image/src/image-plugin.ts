import { Cast } from '@remirror/core';
import { Plugin } from 'prosemirror-state';

export const createImageExtensionPlugin = () => {
  return new Plugin({
    props: {
      handleDOMEvents: {
        drop(view, e) {
          const event = Cast<DragEvent>(e);
          const hasFiles = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length;

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
  });
};
