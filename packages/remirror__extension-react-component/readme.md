# @remirror/extension-react-component

> Create prosemirror node views from your react components

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-react-component
[npm]: https://npmjs.com/package/@remirror/extension-react-component
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-react-component
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-react-component
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-react-component/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-react-component

# pnpm
pnpm add @remirror/extension-react-component

# npm
npm install @remirror/extension-react-component
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extensions`.

## Usage

This extension allows you to use react Components within the editor.

The following code creates an instance of this extension.

```ts
import { ReactComponentExtension } from 'remirror/extensions';

const extension = new ReactComponentExtension();
```
