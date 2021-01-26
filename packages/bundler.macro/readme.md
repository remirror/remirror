# bundler.macro

> Bundle local JavaScript and TypeScript files with parcel.js.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/bundler.macro/next
[npm]: https://npmjs.com/package/bundler.macro/v/next
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=bundler.macro
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/bundler.macro
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/bundler.macro/red?icon=npm

<br />

## Installation

`json.macro` is designed to be used with [babel-plugin-macros](https://github.com/kentcdodds/babel-plugin-macros) to inline all your json file imports.

<br />

First, install the plugin and it's peer dependency (`babel-plugin-macros`). Since the macro is compiled away during the build, it should be installed as a development dependency.

```bash
# yarn
yarn add bundler.macro babel-plugin-macros

# pnpm
pnpm add bundler.macro babel-plugin-macros

# npm
npm install bundler.macro babel-plugin-macros
```

Once installed make sure to add the 'babel-plugin-macros' to your `babel.config.js` (or `.babelrc`) file.

**`.babelrc`**

```diff
{
  "plugins": [
    "other-plugins",
+   "macros",
  ]
}
```

**`babel.config.js`**

```diff
module.exports = {
  // rest of config...,
  plugins: [
    ...otherPlugins,
+   'macros',
  ]
}
```

<br /

## Usage

<br />

### Code Example

```ts
import { bundler } from 'bundler.macro';

// The file is bundled with `parcel.js` and provided as a string.
const bundledFile: string = bundler('./main.ts');
```
