# @remirror/extension-position-tracker

> Attach a placeholder to positions in your editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-position-tracker/next
[npm]: https://npmjs.com/package/@remirror/extension-position-tracker/v/next
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-position-tracker@next
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-position-tracker@next
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

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extension/position-tracker`.

## Usage

The following code creates an instance of this extension.

```ts
import { PositionTrackerExtension } from 'remirror/extension/position-tracker';

const extension = new PositionTrackerExtension();
```
