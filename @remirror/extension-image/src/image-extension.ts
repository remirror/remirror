import {
  bool,
  Cast,
  createTypedExtension,
  CSS_ROTATE_PATTERN,
  EMPTY_CSS_VALUE,
  isElementDOMNode,
  NodeExtensionSpec,
  ProsemirrorAttributes,
} from '@remirror/core';
import { ResolvedPos } from '@remirror/pm/model';
import { Plugin } from '@remirror/pm/state';

/**
 * The image extension for placing images into your editor.
 *
 * TODO integrate https://glitch.com/edit/#!/pet-figcaption?path=index.js%3A27%3A1
 */
export const ImageExtension = createTypedExtension().node({
  name: 'image',
  createNodeSchema(): NodeExtensionSpec {
    return {
      inline: true,
      attrs: {
        align: { default: null },
        alt: { default: '' },
        crop: { default: null },
        height: { default: null },
        width: { default: null },
        rotate: { default: null },
        src: { default: null },
        title: { default: '' },
      },
      group: 'inline',
      draggable: true,
      parseDOM: [
        {
          tag: 'img[src]',
          getAttrs: (domNode) => (isElementDOMNode(domNode) ? getAttributes(domNode) : {}),
        },
      ],
      toDOM: (node) => {
        return ['img', node.attrs];
      },
    };
  },

  createCommands(parameter) {
    const { type } = parameter;

    return {
      insertImage: (attributes: ProsemirrorAttributes<ImageExtensionAttributes>) => ({
        state,
        dispatch,
      }) => {
        const { selection } = state;
        const position = hasCursor(selection) ? selection.$cursor.pos : selection.$to.pos;
        const node = type.create(attributes);
        const transaction = state.tr.insert(position, node);

        if (dispatch) {
          dispatch(transaction);
        }

        return true;
      },
    };
  },

  createPlugin() {
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

            const images = [...event.dataTransfer.files].filter((file) => /image/i.test(file.type));

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

              reader.addEventListener('load', (readerEvent) => {
                const node = schema.nodes.image.create({
                  src: readerEvent.target && Cast(readerEvent.target).result,
                });
                const transaction = view.state.tr.insert(coordinates.pos, node);

                view.dispatch(transaction);
              });
              reader.readAsDataURL(image);
            });
            return true;
          },
        },
      },
    });
  },
});

export interface ImageExtensionAttributes {
  align?: 'center' | 'end' | 'justify' | 'left' | 'match-parent' | 'right' | 'start';
  alt?: string;
  crop?: {
    width: number;
    height: number;
    left: number;
    top: number;
  };
  height?: string;
  width?: string;
  rotate?: string;
  src?: string;
  title?: string;
}

export interface ImageExtensionProperties {}

export interface ImageExtensionSettings {}

/**
 * The set of valid image files.
 */
const IMAGE_FILE_TYPES = new Set(['image/jpeg', 'image/gif', 'image/png', 'image/jpg']);

/**
 * True when the provided file is an image file.
 */
export function isImageFileType(file: File) {
  return IMAGE_FILE_TYPES.has(file.type);
}

/**
 * Retrieve attributes from the dom for the image extension.
 */
function getAttributes(domNode: HTMLElement, extraAttributes: ProsemirrorAttributes = {}) {
  const { cssFloat, display, marginTop, marginLeft } = domNode.style;
  let { width, height } = domNode.style;
  let align = domNode.getAttribute('data-align') ?? domNode.getAttribute('align');
  if (align) {
    align = /(left|right|center)/.test(align) ? align : null;
  } else if (cssFloat === 'left' && !display) {
    align = 'left';
  } else if (cssFloat === 'right' && !display) {
    align = 'right';
  } else if (!cssFloat && display === 'block') {
    align = 'block';
  }

  width = (width || domNode.getAttribute('width')) ?? '';
  height = (height || domNode.getAttribute('height')) ?? '';

  let crop = null;
  let rotate = null;
  const { parentElement } = domNode;
  if (parentElement instanceof HTMLElement) {
    // Special case for Google doc's image.
    if (
      parentElement.style.display === 'inline-block' &&
      parentElement.style.overflow === 'hidden' &&
      parentElement.style.width &&
      parentElement.style.height &&
      marginLeft &&
      !EMPTY_CSS_VALUE.has(marginLeft) &&
      marginTop &&
      !EMPTY_CSS_VALUE.has(marginTop)
    ) {
      crop = {
        width: Number.parseInt(parentElement.style.width, 10) || 0,
        height: Number.parseInt(parentElement.style.height, 10) || 0,
        left: Number.parseInt(marginLeft, 10) || 0,
        top: Number.parseInt(marginTop, 10) || 0,
      };
    }
    if (parentElement.style.transform) {
      // example: `rotate(1.57rad) translateZ(0px)`;
      const mm = parentElement.style.transform.match(CSS_ROTATE_PATTERN);
      if (mm?.[1]) {
        rotate = Number.parseFloat(mm[1]) || null;
      }
    }
  }

  return {
    ...extraAttributes,
    align,
    alt: domNode.getAttribute('alt') ?? null,
    crop,
    height: Number.parseInt(height || '0', 10) || null,
    rotate,
    src: domNode.getAttribute('src') ?? null,
    title: domNode.getAttribute('title') ?? null,
    width: Number.parseInt(width || '0', 10) || null,
  };
}

function hasCursor<T extends object>(argument: T): argument is T & { $cursor: ResolvedPos } {
  return bool(Cast(argument).$cursor);
}
