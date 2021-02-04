# @remirror/extension-horizontal-rule

> Allow your users to divide their content with horizontal lines. Nice!

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-horizontal-rule
[npm]: https://npmjs.com/package/@remirror/extension-horizontal-rule
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-horizontal-rule
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-horizontal-rule
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-horizontal-rule/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-horizontal-rule

# pnpm
pnpm add @remirror/extension-horizontal-rule

# npm
npm install @remirror/extension-horizontal-rule
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extensions`.

## Usage

The following code creates an instance of this extension.

```ts
import { HorizontalRuleExtension } from 'remirror/extensions';

const extension = new HorizontalRuleExtension();
```
