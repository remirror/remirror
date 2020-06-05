# @remirror/styles

> Styles for every remirror package.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm]
[![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts)
![MIT License][license]

[version]: https://flat.badgen.net/npm/v/@remirror/styles
[npm]: https://npmjs.com/package/@remirror/styles
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/styles
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/styles
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/styles/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/styles

# pnpm
pnpm add @remirror/styles

# npm
npm install @remirror/styles
```

## Usage

After installation you can select the css files that you need for your project.

```scss
@import '@remirror/styles/extension-placeholder.css';
@import '@remirror/styles/core.css';
```

Or if your build system allows it.

```ts
import '@remirror/styles/core.css';
```

If you're not worried about bundle size you can also import all styles.

```ts
import '@remirror/styles/all.css';
```

## Credits

This package was bootstrapped with [monots].

[monots]: https://github.com/monots/monots
