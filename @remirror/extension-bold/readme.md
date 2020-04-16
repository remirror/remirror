# @remirror/extension-bold

> Make your text bold. Make it courageous.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm]
[![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts)
![MIT License][license]

[version]: https://flat.badgen.net/npm/v/@remirror/extension-bold
[npm]: https://npmjs.com/package/@remirror/extension-bold
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-bold
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-bold
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-bold/red?icon=npm

## Installation

```bash
yarn add @remirror/extension-bold
```

## Usage

When added to your editor it will provide the `bold` command which makes the text under the cursor /
or at the provided position range bold.

```ts
import { EditorManager } from '@remirror/core';
import { BoldExtension } from '@remirror/extension-bold';

// Create the extension
const boldExtension = BoldExtension.of({ weight: '500' });

// Create the Editor Manager with the bold extension passed through.
const manager = EditorManager.of([boldExtension]);

// Pass the dom element to the editor. If you are using `@remirror/react` this is done for you.
const element = document.createElement('div');
document.body.appendChild(element);

// Add the view to the editor manager.
manager.addView(element);

// Access the commands.
manager.commands.bold(); // Make selection bold.

manager.commands.bold({ from: 1, to: 7 }); // Make provided range bold.
```

## Credits

This package was bootstrapped with [monots].

[monots]: https://github.com/monots/monots
