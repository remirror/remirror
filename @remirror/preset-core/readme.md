# @remirror/preset-core

> The core preset providing the functionality you need and want.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm]
[![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts)
![MIT License][license]

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
yarn add @remirror/preset-core
```

<br />

## Usage

When added to your editor it will provide the required nodes, marks to your editor.

```ts
import { EditorManager } from '@remirror/core';
import { ParagraphExtension } from '@remirror/extension-paragraph';
import { CorePreset } from '@remirror/preset-core';

// Create the preset
const corePreset = CorePreset.of({ rootContent: });

// Create the Editor Manager with the required preset.
const manager = EditorManager.of([corePreset]);

// Pass the dom element to the editor. If you are using `@remirror/react` this is done for you.
const element = document.createElement('div');
document.body.appendChild(element);

// Add the view to the editor manager.
manager.addView(element);

// You now have a basic working editor.
```

Granted the above won't do much but it'll type and what else do you really need in an editor.

## Credits

This package was bootstrapped with [monots].

[monots]: https://github.com/monots/monots
