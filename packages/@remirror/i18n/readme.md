# @remirror/i18n

> Supported internationalization and locales for the remirror editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts) ![MIT License][license]

[version]: https://flat.badgen.net/npm/v/@remirror/i18n
[npm]: https://npmjs.com/package/@remirror/i18n
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/i18n
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/i18n
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/i18n/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/i18n@next

# pnpm
pnpm add @remirror/i18n@next

# npm
npm install @remirror/i18n@next
```

## Usage

The following code creates adds an `es` translation to your social editor.

```tsx
import { i18n } from '@remirror/i18n';
import es from '@remirror/i18n/es/messages';
import { SocialEditor } from '@remirror/react-social';
import { es as esPlurals } from 'make-plural/plurals';

i18n.loadLocaleData('es', { plurals: esPlurals });

i18n.load({
  es: es.messages,
});

const Editor = () => {
  <SocialEditor i18n={i18n} locale='en' />;
};
```
