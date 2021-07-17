# @remirror/extension-positioner

> Reposition your elements with every state update.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-positioner
[npm]: https://npmjs.com/package/@remirror/extension-positioner
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-positioner
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-positioner
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-positioner/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-positioner

# pnpm
pnpm add @remirror/extension-positioner

# npm
npm install @remirror/extension-positioner
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extensions`.

## Usage

An extension for tracking the position of the provided element relative to the prosemirror editor. Can be used to find the top / left position in order to position the element as a hover menu.

```ts
import { PositionerExtension } from 'remirror/extensions';

const extension = new PositionerExtension();

const dispose = extension.addCustomHandler({
  positioner: 'bubble',
  element,
  onChange: ({ isActive, top, left }) => {
    // do something
  },
});

// Later in the app
dispose(); // Remove the positioner.
```
