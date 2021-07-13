# @remirror/styles

> Styles for every remirror package.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

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

Depending on how you want to consume the styles there are some peer dependencies that might be required. Any additional packages are listed in their relevant section.

## Usage

The styles for this package can be used with plain css, the dom using `emotion`, react using `@emotion/styled` and `styled-components`.

### CSS

After installation you can select the css files that you need for your project.

```scss
@import '@remirror/styles/extension-placeholder.css';
@import '@remirror/styles/core.css';
```

Or if your build system allows it.

```ts
import '@remirror/styles/core.css';
```

If you're not worried about bundle size you can also import all styles for all the extensions and packages.

```ts
import '@remirror/styles/all.css';
```

### DOM

Install the addition required dependency.

```bash
# yarn
yarn add emotion

# pnpm
pnpm add emotion

# npm
npm install emotion
```

This is useful when using the pure dom to control styles.

```ts
import { createDomEditor, createDomManager } from 'remirror/dom';
import { BoldExtension } from 'remirror/extensions';
import { addStylesToElement, allStyles } from 'remirror/styles/dom';

const manager = createDomManager(() => [new BoldExtension()]);
const wrapperElement = document.createElement('div');
const editor = createDomEditor({ manager, element: wrapperElement });

addStylesToElement(wrapperElement, allStyles); // Styles added to element.
```

The above snippet will add all styles to the element and all elements it contains.

### `styled-component`

This is designed to be used in a react app that already consumes styled components and the components can be used to wrap your editor, providing automatically scoped styles.

Make sure you have `styled-components` installed. And then import either the styled css or the styled component.

```tsx
import React from 'react';
import { CoreStyledComponent, coreStyledCss } from '@remirror/styles/styled-components';

import { MyEditor } from './my-editor';

const StyledWrapper = () => (
  <CoreStyledComponent>
    <MyEditor />
  </CoreStyledComponent>
);
```

The above will provide the styles to your editor component and since it is a styled component you can use the `as` prop to define it as you wish.

### `@emotion/styled`

This is designed to be used in a react app that already consumes uses `@emotion/core` and `@emotion/styled`. Make sure both of these are installed before getting started

```tsx
import React from 'react';
import { CoreStyledComponent, coreStyledCss } from '@remirror/styles/emotion';

import { MyEditor } from './my-editor';

const StyledWrapper = () => (
  <CoreStyledComponent>
    <MyEditor />
  </CoreStyledComponent>
);
```

This is very similar to the `styled-components` entry point and will provide the styles to your editor component.
