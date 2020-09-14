# @remirror/extension-strike

> Add strikethrough formatting to your text editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-strike/next
[npm]: https://npmjs.com/package/@remirror/extension-strike/v/next
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-strike@next
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-strike@next
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-strike/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-strike@next @remirror/pm@next

# pnpm
pnpm add @remirror/extension-strike@next @remirror/pm@next

# npm
npm install @remirror/extension-strike@next @remirror/pm@next
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extension/strike`.

## Usage

The following code creates an instance of this extension.

```ts
import { StrikeExtension } from 'remirror/extension/strike';

const extension = new StrikeExtension();
```
