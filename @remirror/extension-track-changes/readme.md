# @remirror/extension-track-changes

> Track user changes in your remirror editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm]
[![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts)
![MIT License][license]

[version]: https://flat.badgen.net/npm/v/@remirror/extension-track-changes
[npm]: https://npmjs.com/package/@remirror/extension-track-changes
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-track-changes
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-track-changes
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-track-changes/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-track-changes @remirror/pm

# pnpm
pnpm add @remirror/extension-track-changes @remirror/pm

# npm
npm install @remirror/extension-track-changes @remirror/pm
```

## Usage

The following code creates an instance of this extension.

```ts
import { TrackChangesExtension } from '@remirror/extension-track-changes';

const extension = new TrackChangesExtension();
```

## Credits

This package was bootstrapped with [monots].

[monots]: https://github.com/monots/monots
