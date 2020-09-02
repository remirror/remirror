# @remirror/extension-auto-link

> Automatic linking for url like matches in your editor. Great for social experiences.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts) ![MIT License][license]

[version]: https://flat.badgen.net/npm/v/@remirror/extension-auto-link
[npm]: https://npmjs.com/package/@remirror/extension-auto-link
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-auto-link
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-auto-link
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-auto-link/red?icon=npm

<br />

## Installation

```bash
yarn add @remirror/extension-auto-link@next # yarn
pnpm add @remirror/extension-auto-link@next # pnpm
npm install @remirror/extension-auto-link@next # npm
```

<br />

## Usage

When added to your editor the auto link extension will automatically add links to any url like pattern that matches the default regex.

```ts
import { RemirrorManager, ExtensionPriority } from '@remirror/core';
import { CorePreset } from '@remirror/preset-core';
import { AutoLinkExtension } from '@remirror/extension-auto-link';

// Create the auto link extension
const autoLinkExtension = new AutoLinkExtension();
const corePreset = new CorePreset();

// Create the Editor Manager with the extension passed through.
const manager = RemirrorManager.create([autoLinkExtension, corePreset]);

// Pass the dom element to the editor. If you are using `@remirror/react` this is done for you.
const element = document.createElement('div');
document.body.appendChild(element);

// Add the view to the editor manager.
manager.addView(element);
```

<br />
