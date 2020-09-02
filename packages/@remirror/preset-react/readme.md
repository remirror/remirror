# @remirror/preset-react

> The core preset providing the functionality you need and want.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts) ![MIT License][license]

[version]: https://flat.badgen.net/npm/v/@remirror/preset-react
[npm]: https://npmjs.com/package/@remirror/preset-react
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/preset-react
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/preset-react
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/preset-react/red?icon=npm

<br />

## Installation

```bash
# yarn
yarn add @remirror/preset-react@next @remirror/pm@next

# pnpm
pnpm add @remirror/preset-react@next @remirror/pm@next

# npm
npm install @remirror/preset-react@next @remirror/pm@next
```

<br />

## Usage

This preset adds

- Server side support for nodes and marks.
- Transformations for server side components.
- Placeholder support for the editor.

```ts
import { RemirrorManager } from '@remirror/core';
import { ReactPreset } from '@remirror/preset-react';
import { CorePreset } from '@remirror/preset-core';

const reactPreset = new ReactPreset({ rootContent: 'block*' });

// Create the preset
const reactPreset = new ReactPreset(transformers);

// Create the Editor Manager with the required preset.
const manager = RemirrorManager.create([reactPreset]);

// Pass the dom element to the editor. If you are using `@remirror/react` this is done for you.
const element = document.createElement('div');
document.body.appendChild(element);

// Add the view to the editor manager.
manager.addView(element);

// You now have a basic working editor.
```

Granted, the above won't do much. It will allow you to type, and what else do you really need in an editor.
