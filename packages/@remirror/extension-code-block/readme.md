# @remirror/extension-code-block

> Unleash the inner coder with code blocks for your remirror editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts) ![MIT License][license]

[version]: https://flat.badgen.net/npm/v/@remirror/extension-code-block
[npm]: https://npmjs.com/package/@remirror/extension-code-block
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-code-block
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-code-block
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-code-block/red?icon=npm

## Installation

```bash
yarn add refractor @remirror/extension-code-block@next @remirror/pm@next # yarn
pnpm add refractor @remirror/extension-code-block@next @remirror/pm@next # pnpm
npm install refractor @remirror/extension-code-block@next @remirror/pm@next # npm
```

Refractor is a peer dependency and is needed when adding extra language support.

## Usage

The following code sample will create a limited editor and run the available commands from this extension.

```ts
import jsx from 'refractor/lang/jsx';
import typescript from 'refractor/lang/typescript';

import { RemirrorManager, ExtensionPriority } from '@remirror/core';
import { CorePreset } from '@remirror/preset-core';
import { CodeBlockExtension } from '@remirror/extension-code-block';

// Create the codeBlock extension
const codeBlockExtension = new CodeBlockExtension({ supportedLanguages: [typescript, jsx] });
const corePreset = new CorePreset();

// Create the Editor Manager with the codeBlock extension passed through.
const manager = RemirrorManager.create([codeBlockExtension, corePreset]);

// Pass the dom element to the editor. If you are using `@remirror/react` or
// other framework wrappers then this is handled for you.
const element = document.createElement('div');
document.body.appendChild(element);

// Add the view to the editor manager.
manager.addView(element);

// Access the code block commands
manager.store.commands.createCodeBlock({ language: 'markdown' });

// Also supports chaining
manager.store.chain.updateCodeBlock({ language: 'js' }).formatCodeBlock().run();
```
