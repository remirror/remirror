# prosemirror-resizable-view

> A ProseMirror node view that make your node resizable

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/prosemirror-resizable-view
[npm]: https://npmjs.com/package/prosemirror-resizable-view
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=prosemirror-resizable-view
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/prosemirror-resizable-view
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/prosemirror-resizable-view/red?icon=npm

## Installation

```bash
# yarn
yarn add prosemirror-resizable-view

# pnpm
pnpm add prosemirror-resizable-view

# npm
npm install prosemirror-resizable-view
```

## Usage

The following code creates an resizable image node view.

```ts
import { ResizableNodeView } from 'prosemirror-resizable-view';

const createInnerImage = ({ node }: { node: ProsemirrorNode }) => {
  const inner = document.createElement('img');
  inner.setAttribute('src', node.attrs.src);
  inner.style.width = '100%';
  inner.style.minWidth = '50px';
  inner.style.objectFit = 'contain'; // maintain image's aspect ratio
  return inner;
};

/**
 * ResizableImageView is a NodeView for image. You can resize the image by
 * dragging the handle over the image.
 */
export class ResizableImageView extends ResizableNodeView implements NodeView {
  constructor(node: ProsemirrorNode, view: EditorView, getPos: () => number) {
    super({ node, view, getPos, createElement: createInnerImage });
  }
}
```
