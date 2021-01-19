# @remirror/extension-native-bridge

> **Support for communication between the webview and native editor.**

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-native-bridge/next
[npm]: https://npmjs.com/package/@remirror/extension-native-bridge/v/next
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-native-bridge
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-native-bridge
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-native-bridge/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-native-bridge @remirror/pm

# pnpm
pnpm add @remirror/extension-native-bridge @remirror/pm

# npm
npm install @remirror/extension-native-bridge @remirror/pm
```

## Usage

The following code creates an instance of this extension.

```ts
import { NativeBridgeExtension } from '@remirror/extension-native-bridge';

const extension = new NativeBridgeExtension();
```
