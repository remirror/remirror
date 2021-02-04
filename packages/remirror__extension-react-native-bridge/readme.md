# @remirror/extension-react-native-bridge

> **Support for communication between the webview and native editor.**

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-react-native-bridge
[npm]: https://npmjs.com/package/@remirror/extension-react-native-bridge
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-react-native-bridge
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-react-native-bridge
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-react-native-bridge/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-react-native-bridge

# pnpm
pnpm add @remirror/extension-react-native-bridge

# npm
npm install @remirror/extension-react-native-bridge
```

## Usage

The following code creates an instance of this extension.

```ts
import { NativeBridgeExtension } from '@remirror/extension-react-native-bridge';

const extension = new NativeBridgeExtension();
```
