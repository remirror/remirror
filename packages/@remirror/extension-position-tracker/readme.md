# @remirror/extension-position-tracker

> Attach a placeholder to positions in your editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts) ![MIT License][license]

[version]: https://flat.badgen.net/npm/v/@remirror/extension-position-tracker
[npm]: https://npmjs.com/package/@remirror/extension-position-tracker
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-position-tracker
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-position-tracker
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-position-tracker/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-position-tracker@next @remirror/pm@next

# pnpm
pnpm add @remirror/extension-position-tracker@next @remirror/pm@next

# npm
npm install @remirror/extension-position-tracker@next @remirror/pm@next
```

## Usage

The following code creates an instance of this extension.

```ts
import { PositionTrackerExtension } from '@remirror/extension-position-tracker';

const extension = new PositionTrackerExtension();
```
