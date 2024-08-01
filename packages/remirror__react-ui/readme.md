# @remirror/react-ui

> A selection of optional react components for your remirror editor, powered by `@mui/material`.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/react-ui
[npm]: https://npmjs.com/package/@remirror/react-ui
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/react-ui
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/react-ui
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/react-ui/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/react-ui @remirror/react

# pnpm
pnpm add @remirror/react-ui @remirror/react

# npm
npm install @remirror/react-ui @remirror/react
```

This is **NOT** included by default when you install the recommended `@remirror/react` package.

## Translations

The components used here expect a translation library to be present to render tooltips etc.

This can be provided via the `i18nFormat` prop to the root `Remirror` component.

You can use the provided `@remirror/i18n` package, or you can provide your own i18n library (see the [i18n examples in Storybook](https://remirror.vercel.app/?path=/story/i18n-react-i18next--basic))

```tsx
import { i18nFormat } from '@remirror/i18n';
import { Remirror, useRemirror } from '@remirror/react';
import { TopToolbar } from '@remirror/react';

const Editor: React.FC = () => {
  const { manager } = useRemirror({
    extensions: () => [
      // Some extensions here
    ],
  });

  return (
    <Remirror manager={manager} i18nFormat={i18nFormat} autoRender='end'>
      <TopToolbar />
    </Remirror>
  );
};
```
