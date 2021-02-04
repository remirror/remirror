# @remirror/extension-events

> Manage your remirror editor dom events.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-events
[npm]: https://npmjs.com/package/@remirror/extension-events
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-events
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-events
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-events/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-events @remirror/core

# pnpm
pnpm add @remirror/extension-events @remirror/core

# npm
npm install @remirror/extension-events @remirror/core
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extensions`.

## Usage

The following code creates an instance of this extension.

```ts
import { EventsExtension } from 'remirror/extensions';

const extension = new EventsExtension();

extension.addCustomHandler('focus', () => {
  // Do something.
});
```

This extension is included by default in the `CorePreset` from `remirror/presets`.
