# @remirror/extension-callout

> Add callouts to your text editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-callout
[npm]: https://npmjs.com/package/@remirror/extension-callout
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-callout@next
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-callout@next
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-callout/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-callout

# pnpm
pnpm add @remirror/extension-callout

# npm
npm install @remirror/extension-callout
```

## Usage

The following code creates an instance of this extension.

```ts
import { CalloutExtension } from '@remirror/extension-callout';

const extension = new CalloutExtension();
```

To render a emoji at the front.

```ts
import { CalloutExtension } from '@remirror/extension-callout';

const basicExtensions = () => [new CalloutExtension({ renderEmoji, defaultEmoji: '💡' })];

/**
 *  If you want to update the emoji to a new one,
 * you can dispatch a transaction to update the `emoji` attrs inside this function.
 */
const renderEmoji = (node: ProsemirrorNode) => {
  const emoji = document.createElement('span');
  emoji.textContent = node.attrs.emoji;
  return emoji;
};
```
