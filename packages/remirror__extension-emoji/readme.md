# @remirror/extension-emoji

> Add flavor to your editor with emoji's that make the heart sing.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-emoji
[npm]: https://npmjs.com/package/@remirror/extension-emoji
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-emoji
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-emoji
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-emoji/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-emoji

# pnpm
pnpm add @remirror/extension-emoji

# npm
npm install @remirror/extension-emoji
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extensions`.

## Usage

The following code sample will create a limited editor and run the available commands from this extension.

```ts
import { ExtensionPriority, RemirrorManager } from 'remirror';
import { CorePreset, EmojiExtension } from 'remirror/extensions';

// Create the codeBlock extension
const emojiExtension = new EmojiExtension({ supportedLanguages: [typescript, jsx] });
const corePreset = new CorePreset();

// Create the Editor Manager with the codeBlock extension passed through.
const manager = RemirrorManager.create([emojiExtension, corePreset]);

// Pass the dom element to the editor. If you are using `@remirror/react` or
// other framework wrappers then this is handled for you.
const element = document.createElement('div');
document.body.append(element);

// Add the view to the editor manager.
manager.addView(element);

manager.store.commands.insertEmojiByName('+1'); // Insert the thumbs up emoji.
manager.store.commands.suggestEmoji(); // Inserts the suggestion activation character.

manager.store.helpers.updateFrequentlyUsed(['heart', '+1', 'smile']);
```
