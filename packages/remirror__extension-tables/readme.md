# @remirror/extension-tables

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/extension-tables.svg?)](https://bundlephobia.com/result?p=@remirror/extension-tables) [![npm](https://img.shields.io/npm/dm/@remirror/extension-tables.svg?&logo=npm)](https://www.npmjs.com/package/@remirror/extension-tables)

## Installation

```bash
yarn add @remirror/extension-tables # yarn
pnpm add @remirror/extension-tables # pnpm
npm install @remirror/extension-tables # npm
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extensions`.

```ts
import { createCoreManager, TableExtension } from 'remirror/extensions';

const manager = createCoreManager(() => [TableExtension()]);
```
