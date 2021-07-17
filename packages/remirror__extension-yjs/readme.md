# @remirror/extension-yjs

> Realtime collaboration with yjs

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-yjs
[npm]: https://npmjs.com/package/@remirror/extension-yjs
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-yjs
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-yjs
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-yjs/red?icon=npm

## Installation

```bash
# yarn
yarn add yjs @remirror/extension-yjs

# pnpm
pnpm add yjs @remirror/extension-yjs

# npm
npm install yjs @remirror/extension-yjs
```

You will also need to install your preferred [`YjsRealtimeProvider`](https://github.com/yjs/yjs#providers).

Due to the required peer dependencies this package is not included by default when installing `remirror`.

You will also need to install your preferred yjs protocol

```bash
# yarn
yarn add y-webrtc

# pnpm
pnpm add y-webrtc

# npm
npm install y-webrtc
```

## Usage

The following code creates an instance of this extension.

```ts
import { WebrtcProvider } from 'y-webrtc';
import { Doc } from 'yjs';
import { YjsExtension } from '@remirror/extension-yjs';

const extension = new YjsExtension({
  getProvider: () => new WebrtcProvider('global', new Doc()),
});
```
