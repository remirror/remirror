import { Attrs } from '@remirror/core';
import { CSS_ROTATE_PATTERN, EMPTY_CSS_VALUE } from '@remirror/core-extensions';
import { IMAGE_FILE_TYPES } from './image-constants';

/**
 * Whether the file is an image file
 */
export const isImageFileType = (file: File) => {
  return file && IMAGE_FILE_TYPES.has(file.type);
};

export const getAttrs = (extraAttrs: Attrs) => (domNode: HTMLElement) => {
  const { cssFloat, display, marginTop, marginLeft } = domNode.style;
  let { width, height } = domNode.style;
  let align = domNode.getAttribute('data-align') || domNode.getAttribute('align');
  if (align) {
    align = /(left|right|center)/.test(align) ? align : null;
  } else if (cssFloat === 'left' && !display) {
    align = 'left';
  } else if (cssFloat === 'right' && !display) {
    align = 'right';
  } else if (!cssFloat && display === 'block') {
    align = 'block';
  }

  width = width || domNode.getAttribute('width');
  height = height || domNode.getAttribute('height');

  let crop = null;
  let rotate = null;
  const { parentElement } = domNode;
  if (parentElement instanceof HTMLElement) {
    // Special case for Google doc's image.
    const ps = parentElement.style;
    if (
      ps.display === 'inline-block' &&
      ps.overflow === 'hidden' &&
      ps.width &&
      ps.height &&
      marginLeft &&
      !EMPTY_CSS_VALUE.has(marginLeft) &&
      marginTop &&
      !EMPTY_CSS_VALUE.has(marginTop)
    ) {
      crop = {
        width: parseInt(ps.width, 10) || 0,
        height: parseInt(ps.height, 10) || 0,
        left: parseInt(marginLeft, 10) || 0,
        top: parseInt(marginTop, 10) || 0,
      };
    }
    if (ps.transform) {
      // example: `rotate(1.57rad) translateZ(0px)`;
      const mm = ps.transform.match(CSS_ROTATE_PATTERN);
      if (mm && mm[1]) {
        rotate = parseFloat(mm[1]) || null;
      }
    }
  }

  return {
    ...extraAttrs,
    align,
    alt: domNode.getAttribute('alt') || null,
    crop,
    height: parseInt(height || '0', 10) || null,
    rotate,
    src: domNode.getAttribute('src') || null,
    title: domNode.getAttribute('title') || null,
    width: parseInt(width || '0', 10) || null,
  };
};
