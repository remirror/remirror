# @remirror/dom

> Use remirror directly in the dom.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/dom
[npm]: https://npmjs.com/package/@remirror/dom
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/dom
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/dom
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/dom/red?icon=npm

## Why

You've heard great things about prosemirror and would like to use it in your app, but you're slightly intimidated by some of the moving parts. You don't really want to deal with Schema, Nodes, Marks, Plugins, Decorations. You just want an editor.

This library provides an abstraction that might be right for you.

The functionality of the prosemirror library is wrapped up into extensions which manage the work for you.

## Installation

```bash
# yarn
yarn add @remirror/dom

# pnpm
pnpm add @remirror/dom

# npm
npm install @remirror/dom
```

## Usage

The following code is a guide to get you started.

```ts
import { createDomEditor, createDomManager } from 'remirror/dom';
import { BoldExtension } from 'remirror/extensions';

const element = document.querySelector('#editor');
const manager = createDomManager([new BoldExtension()]);
const editor = createDomEditor({ manager, element });

editor.addHandler('change', () => log('your editor has changed'));

// Make selected text bold.
editor.commands.toggleBold();
```
