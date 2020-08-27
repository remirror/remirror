# @remirror/preset-core

> The core preset providing the functionality you need and want.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts) ![MIT License][license]

[version]: https://flat.badgen.net/npm/v/@remirror/preset-core
[npm]: https://npmjs.com/package/@remirror/preset-core
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/preset-core
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/preset-core
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/preset-core/red?icon=npm

<br />

## Installation

```bash
yarn add @remirror/preset-core@next # yarn
pnpm add @remirror/preset-core@next # pnpm
npm install @remirror/preset-core@next # npm
```

<br />

## Usage

When added to your editor it will provide the required nodes, marks to your editor.

```ts
import { RemirrorManager } from '@remirror/core';
import { CorePreset } from '@remirror/preset-core';

// Create the preset
const corePreset = new CorePreset({ rootContent: 'block*' });

// Create the Editor Manager with the required preset.
const manager = RemirrorManager.create([corePreset]);

// Pass the dom element to the editor. If you are using `@remirror/react` this is done for you.
const element = document.createElement('div');
document.body.appendChild(element);

// Add the view to the editor manager.
manager.addView(element);

// You now have a basic working editor.
```

Granted, the above won't do much. It will allow you to type, and what else do you really need from an editor.
