import {
  ApplySchemaAttributes,
  bool,
  Cast,
  CommandFunction,
  CreatePluginReturn,
  CSS_ROTATE_PATTERN,
  EMPTY_CSS_VALUE,
  isElementDomNode,
  NodeExtension,
  NodeExtensionSpec,
  ProsemirrorAttributes,
} from '@remirror/core';
import { ResolvedPos } from '@remirror/pm/model';

/**
 * The image extension for placing images into your editor.
 *
 * TODO ->
 * - Captions https://glitch.com/edit/#!/pet-figcaption?path=index.js%3A27%3A1 into a preset
 * - Resizable https://glitch.com/edit/#!/toothsome-shoemaker?path=index.js%3A1%3A0
 */
export class ImageExtension extends NodeExtension {
  get name() {
    return 'image' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      inline: true,
      attrs: {
        ...extra.defaults(),
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
          getAttrs: (element) =>
            isElementDomNode(element) ? getImageAttributes({ element, parse: extra.parse }) : {},
        },
      ],
      toDOM: (node) => {
        return ['img', { ...extra.dom(node), ...node.attrs }];
      },
    };
  }

  createCommands = () => {
    return {
      insertImage: (
        attributes: ProsemirrorAttributes<ImageExtensionAttributes>,
      ): CommandFunction => ({ state, dispatch }) => {
        const { selection } = state;
        const position = hasCursor(selection) ? selection.$cursor.pos : selection.$to.pos;
        const node = this.type.create(attributes);
        const transaction = state.tr.insert(position, node);

        if (dispatch) {
          dispatch(transaction);
        }

        return true;
      },
    };
  };

  createPlugin = (): CreatePluginReturn => {
    return {
      props: {
        handleDOMEvents: {
          drop(view, e) {
            const event = Cast<DragEvent>(e);
            const hasFiles = event.dataTransfer?.files?.length;

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
    };
  };
}

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

export interface ImageExtensionOptions {}

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
 * Get the alignment of the text in the element.
 */
function getAlignment(element: HTMLElement) {
  const { cssFloat, display } = element.style;

  let align = element.getAttribute('data-align') ?? element.getAttribute('align');

  if (align) {
    align = /(left|right|center)/.test(align) ? align : null;
  } else if (cssFloat === 'left' && !display) {
    align = 'left';
  } else if (cssFloat === 'right' && !display) {
    align = 'right';
  } else if (!cssFloat && display === 'block') {
    align = 'block';
  }

  return align;
}

/**
 * Get the width and the height of the image.
 */
function getDimensions(element: HTMLElement) {
  let { width, height } = element.style;
  width = width ?? element.getAttribute('width') ?? '';
  height = height ?? element.getAttribute('height') ?? '';

  return { width, height };
}

/**
 * Get the rotation of the image from the parent element.
 */
function getRotation(element: HTMLElement) {
  const { parentElement } = element;

  if (!isElementDomNode(parentElement)) {
    return null;
  }

  if (!parentElement.style.transform) {
    return null;
  }

  // example text to match: `rotate(1.57rad) translateZ(0px)`;
  const matchingPattern = parentElement.style.transform.match(CSS_ROTATE_PATTERN);

  if (!matchingPattern?.[1]) {
    return null;
  }

  return Number.parseFloat(matchingPattern[1]) || null;
}

/**
 * Get the crop value for this element. Only applies to google doc images.
 */
function getCrop(element: HTMLElement) {
  const { parentElement } = element;

  if (!isElementDomNode(parentElement)) {
    return null;
  }

  const { marginTop, marginLeft } = element.style;

  const hasCropValue =
    parentElement.style.display === 'inline-block' &&
    parentElement.style.overflow === 'hidden' &&
    parentElement.style.width &&
    parentElement.style.height &&
    marginLeft &&
    !EMPTY_CSS_VALUE.has(marginLeft) &&
    marginTop &&
    !EMPTY_CSS_VALUE.has(marginTop);

  if (!hasCropValue) {
    return null;
  }

  return {
    width: Number.parseInt(parentElement.style.width, 10) || 0,
    height: Number.parseInt(parentElement.style.height, 10) || 0,
    left: Number.parseInt(marginLeft, 10) || 0,
    top: Number.parseInt(marginTop, 10) || 0,
  };
}

/**
 * Retrieve attributes from the dom for the image extension.
 */
function getImageAttributes({
  element,
  parse,
}: {
  element: HTMLElement;
  parse: ApplySchemaAttributes['parse'];
}) {
  const { width, height } = getDimensions(element);
  const align = getAlignment(element);
  const crop = getCrop(element);
  const rotate = getRotation(element);

  return {
    ...parse(element),
    align,
    alt: element.getAttribute('alt') ?? null,
    crop,
    height: Number.parseInt(height || '0', 10) || null,
    rotate,
    src: element.getAttribute('src') ?? null,
    title: element.getAttribute('title') ?? null,
    width: Number.parseInt(width || '0', 10) || null,
  };
}

function hasCursor<T extends object>(argument: T): argument is T & { $cursor: ResolvedPos } {
  return bool(Cast(argument).$cursor);
}
