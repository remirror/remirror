# @remirror/extension-drop-cursor

> A cursor for the ages. Drag and drop content in your editor with class.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-drop-cursor
[npm]: https://npmjs.com/package/@remirror/extension-drop-cursor
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-drop-cursor
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-drop-cursor
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-drop-cursor/red?icon=npm

## Installation

```bash
yarn add @remirror/extension-drop-cursor # yarn
pnpm add @remirror/extension-drop-cursor # pnpm
npm install @remirror/extension-drop-cursor # npm
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extensions`.

## Usage

The following code sample will create a limited editor and run the available commands from this extension.

```ts
import { ExtensionPriority, RemirrorManager } from 'remirror';
import { CorePreset, DropCursorExtension } from 'remirror/extensions';

// Create the codeBlock extension
const dropCursorExtension = new DropCursorExtension({ supportedLanguages: [typescript, jsx] });
const corePreset = new CorePreset();

// Create the Editor Manager with the codeBlock extension passed through.
const manager = RemirrorManager.create([dropCursorExtension, corePreset]);

// Pass the dom element to the editor. If you are using `@remirror/react` or
// other framework wrappers then this is handled for you.
const element = document.createElement('div');
document.body.append(element);

// Add the view to the editor manager.
manager.addView(element);
```
