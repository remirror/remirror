# @remirror/react-native

> Run your remirror editor for `React Native`

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/react-native.svg?)](https://bundlephobia.com/result?p=@remirror/react-native) [![npm](https://img.shields.io/npm/dm/@remirror/react-native.svg?&logo=npm)](https://www.npmjs.com/package/@remirror/react-native)

## Installation

```bash
yarn add @remirror/react-native # yarn
pnpm add @remirror/react-native # pnpm
npm install @remirror/react-native # npm
```

You will also need to have the following installed which are peer dependencies.

- `react-native-webview` - See the [getting started](https://github.com/react-native-webview/react-native-webview/blob/c5ae9193bd1082e97e739dba41db0db03213faa9/docs/Getting-Started.md) guide.
- `react-dom` (used for generating an ssr build which is used to prerender the webview).
- `react-native`
- `react`

To bundle the webview you can use the library `bundler.macro`.See the package for a setup guide. This is used to bundle the files used for the remirror editor into a single JS bundle which is injected into the webview.

## Getting started

There are two parts to a native editor. The webview component and the the native ui.

All the text and editor logic is stored in the usual `remirror` editor which runs in a webview. It can be controlled from the outside by
