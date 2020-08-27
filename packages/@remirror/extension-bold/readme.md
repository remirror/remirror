# @remirror/extension-bold

> Make your text bold. Make it courageous.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts) ![MIT License][license]

[version]: https://flat.badgen.net/npm/v/@remirror/extension-bold
[npm]: https://npmjs.com/package/@remirror/extension-bold
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-bold
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-bold
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-bold/red?icon=npm

<br />

## Installation

```bash
yarn add @remirror/extension-bold@next @remirror/pm@next # yarn
pnpm add @remirror/extension-bold@next @remirror/pm@next # pnpm
npm install @remirror/extension-bold@next @remirror/pm@next # npm
```

<br />

## Usage

When added to your editor it will provide the `toggleBold` command which makes the text under the cursor / or at the provided position range bold.

```ts
import { RemirrorManager, ExtensionPriority } from '@remirror/core';
import { CorePreset } from '@remirror/preset-core';
import { BoldExtension } from '@remirror/extension-bold';

// Create the bold extension
const boldExtension = new BoldExtension({ weight: '500' });
const corePreset = new CorePreset();

// Create the Editor Manager with the bold extension passed through.
const manager = RemirrorManager.create([boldExtension, corePreset]);

// Pass the dom element to the editor. If you are using `@remirror/react` this is done for you.
const element = document.createElement('div');
document.body.appendChild(element);

// Add the view to the editor manager.
manager.addView(element);

// Access the commands and toggleBoldness
manager.commands.toggleBold();

// Toggle at the provided range
manager.commands.toggleBold({ from: 1, to: 7 });
```

<br />
