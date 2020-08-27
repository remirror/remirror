# @remirror/extension-epic-mode

> Epic (power) mode extension for the remirror wysiwyg editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts) ![MIT License][license]

[version]: https://flat.badgen.net/npm/v/@remirror/extension-epic-mode
[npm]: https://npmjs.com/package/@remirror/extension-epic-mode
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-epic-mode
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-epic-mode
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-epic-mode/red?icon=npm

## Installation

```bash
yarn add @remirror/extension-epic-mode@next # yarn
pnpm add @remirror/extension-epic-mode@next # pnpm
npm install @remirror/extension-epic-mode@next # npm
```

## Usage

The following code sample will create a limited editor and run the available commands from this extension.

```ts
import { RemirrorManager, ExtensionPriority } from '@remirror/core';
import { CorePreset } from '@remirror/preset-core';
import { EpicModeExtension } from '@remirror/extension-epic-mode';

// Create the codeBlock extension
const epicModeExtension = new EpicModeExtension();
const corePreset = new CorePreset();

// Create the Editor Manager with the codeBlock extension passed through.
const manager = RemirrorManager.create([epicModeExtension, corePreset]);

// Pass the dom element to the editor. If you are using `@remirror/react` or
// other framework wrappers then this is handled for you.
const element = document.createElement('div');
document.body.appendChild(element);

// Add the view to the editor manager.
manager.addView(element);

// Make the epic mode extension active.
epicModeExtension.setOptions({ active: true });
```

When using with react you can update the properties with the `useExtensionProperties` hook.

```ts
import { EpicModeExtension } from '@remirror/extension-epic-mode';
import { useExtensionProperties, useRemirror } from '@remirror/react';

const InternalEditor = () => {
  useExtensionProperties(EpicModeExtension, { active: true });

  return <div />;
};
```
