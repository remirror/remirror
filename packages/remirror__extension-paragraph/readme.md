# @remirror/extension-paragraph

> Group your words into paragraphs and render each statement a harmonious symphony.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-paragraph
[npm]: https://npmjs.com/package/@remirror/extension-paragraph
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-paragraph
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-paragraph
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-paragraph/red?icon=npm

<br />

## Installation

```bash
yarn add @remirror/extension-paragraph # yarn
pnpm add @remirror/extension-paragraph # pnpm
npm install @remirror/extension-paragraph # npm
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extensions`.

<br />

## Usage

When added to your editor it will provide the `insertParagraph` which inserts a paragraph into the editor.

```ts
import { ExtensionPriority, RemirrorManager } from 'remirror';
import { DocExtension, ParagraphExtension, TextExtension } from 'remirror/extensions';

// Create the extension
const paragraphExtension = new ParagraphExtension();
const docExtension = new DocExtension({ priority: ExtensionPriority.Low });
const textExtension = new TextExtension({ priority: ExtensionPriority.Low });

// Create the Editor Manager with the paragraph extension passed through.
const manager = RemirrorManager.create([paragraphExtension, docExtension, textExtension]);

// Pass the dom element to the editor. If you are using `@remirror/react` this is done for you.
const element = document.createElement('div');
document.body.append(element);

// Add the view to the editor manager.
manager.addView(element);

// Access the commands and insert a paragraph.
manager.commands.insertParagraph();
```

### Alternatives

There are several presets which contain this extension and make the installation process less verbose. As a result you probably won't ever need to manage it directly.

<br />
