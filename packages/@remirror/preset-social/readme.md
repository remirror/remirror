# @remirror/preset-social

> The preset for the social editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/preset-social/next
[npm]: https://npmjs.com/package/@remirror/preset-social/v/next
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/preset-social
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/preset-social
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/preset-social/red?icon=npm

<br />

## Installation

```bash
# yarn
yarn add @remirror/preset-social @remirror/pm

# pnpm
pnpm add @remirror/preset-social @remirror/pm

# npm
npm install @remirror/preset-social @remirror/pm
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/presets`.

<br />

## Usage

The following adds the extensions from this preset to the editor.

```ts
import { createCoreManager, socialPreset } from 'remirror/extensions';

// Add the preset to the manager.
const manager = createCoreManager(() => socialPreset());
```
