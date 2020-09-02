# @remirror/extension-image

> Add images to your editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts) ![MIT License][license]

[version]: https://flat.badgen.net/npm/v/@remirror/extension-image
[npm]: https://npmjs.com/package/@remirror/extension-image
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-image
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-image
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-image/red?icon=npm

## Installation

```bash
yarn add @remirror/extension-image@next @remirror/pm@next # yarn
pnpm add @remirror/extension-image@next @remirror/pm@next # pnpm
npm install @remirror/extension-image@next @remirror/pm@next # npm
```

## Usage

The following code sample will create a limited editor and run the available commands from this extension.

```ts
import { RemirrorManager, ExtensionPriority } from '@remirror/core';
import { CorePreset } from '@remirror/preset-core';
import { ImageExtension } from '@remirror/extension-image';

// Create the codeBlock extension
const imageExtension = new ImageExtension();
const corePreset = new CorePreset();

// Create the Editor Manager with the codeBlock extension passed through.
const manager = RemirrorManager.create([imageExtension, corePreset]);

// Pass the dom element to the editor. If you are using `@remirror/react` or
// other framework wrappers then this is handled for you.
const element = document.createElement('div');
document.body.appendChild(element);

// Add the view to the editor manager.
manager.addView(element);

// Insert an image at the current selection.
manager.store.commands.insertImage({ src: `https://images.com/awesome.jpg` });
```
