---
'@remirror/core-types': major
'@remirror/core-utils': major
'@remirror/core': major
'@remirror/extension-bidi': major
'@remirror/extension-callout': major
'@remirror/extension-columns': major
'@remirror/extension-heading': major
'@remirror/extension-text-color': major
'@remirror/i18n': major
'@remirror/messages': major
'@remirror/react': major
'@remirror/react-components': major
'@remirror/react-core': major
'@remirror/react-editors': major
'@remirror/react-hooks': major
'remirror': major
---

Based on community feedback, we have decided to decouple the core of Remirror from Lingui, an internationalisation (a.k.a. i18n) library.

Thereby making it possible to use _any_ i18n solution with Remirror 🙌🙌🙌.

**N.B.** To use the translatable strings provided by Remirror, the i18n library you use needs to support [ICU message formatting](https://formatjs.io/docs/core-concepts/icu-syntax/).

This change aims to make it **easier to use Remirror in existing applications**, by not imposing _our_ architectural decisions on to you.

There are example integrations with many different i18n libraries [in our Storybook](https://pr2128-remirror-ocavue.vercel.app/?path=/story/i18n-format-js--basic).

### NOTE: "Out-of-the-box" editors unaffected

If you are using editors provided by the `@remirror/react-editors` package, you are unaffected by these changes. These editors have been updated to keep existing behaviour.

## 💥 BREAKING CHANGES! 💥

## `i18n` prop removed from the `<Remirror />` root component

In previous versions of Remirror, the `i18n` prop of the root Remirror component allowed you to pass a customised **Lingui** instance.

With this version, we want to allow _**any**_ i18n library to be used with Remirror, so the `i18n` prop has been removed, and **replaced with an `i18nFormat` _function_**.

This allows users to plug in _any_ i18n library, by implementing a definition for this function.

This function is described by the TypeScript type [`I18nFormatter`](https://github.com/remirror/remirror/blob/32d8d00587f2f0bce8c1fa59164e15b3569a7e96/packages/remirror__core-types/src/core-types.ts#L417-L453).

#### Example: Using `react-i18next`

```tsx
import { useTranslation } from 'react-i18next';
import { Remirror, useRemirror } from '@remirror/react';

const Editor: React.FC = () => {
  const { t } = useTranslation();

  const i18nFormat: I18nFormatter = useCallback(
    (message, values) => {
      // Note only using the message ID here, more on this later
      return t(message.id, values);
    },
    [t],
  );

  const { manager } = useRemirror({
    extensions: () => [
      // Some extensions here
    ],
  });

  return <Remirror manager={manager} i18nFormat={i18nFormat} />;
};
```

`react-i18next`, like many i18n solutions, requires you define your translatable strings up front, via key-value pairs.

To facilitate this, the `@remirror/messages` package **now exposes the translatable strings as JSON files**.

These messages are provided as key value pairs, so they can be loaded into your chosen i18n library.

Currently, only English locale (`en`) messages are provided.

```ts
import i18n from 'i18next';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';
import type { I18nFormatter } from 'remirror';
import allMessages from '@remirror/messages/en/all-messages.json';

// or messages for specific extension(s)
// import boldMessages from '@remirror/messages/en/extension-bold-messages.json';
// import italicMessages from '@remirror/messages/en/extension-italic-messages.json';

i18n
  .use(ICU) // Required if using the provided messages from @remirror/messages
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: allMessages,
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
```

You do not _have_ to use the messages in these key value pairs, you could replace them with your own. They are provided for convenience, and to expose the message IDs Remirror uses.

### Restoring the previous behaviour

If you wish to carry on using Remirror's default i18n solution (powered by Lingui), **you will need to install the `@remirror/i18n` package, as this is now an optional package**.

#### Example: Continue using `@remirror/i18n`

Install the i18n package, as it is now optional, and not installed by default.

```sh
npm add @remirror/i18n
```

```tsx
import { i18nFormat } from '@remirror/i18n';
import { Remirror, useRemirror } from '@remirror/react';

const Editor: React.FC = () => {
  const { manager } = useRemirror({
    extensions: () => [
      // Some extensions here
    ],
  });

  return <Remirror manager={manager} i18nFormat={i18nFormat} />;
};
```

## The `useI18n` hook has a different return value

As a consequence of the above, the `useI18n` no longer returns an _object_ containing the Lingui `i18n` instance.

It now returns the `i18nFormat` _function_ that was passed to the root `<Remirror />` component.

#### Before

```tsx
const { t, i18n } = useI18n();
```

#### After

```tsx
const t = useI18n();

// Where "t" is the same function that was passed via `i18nFormat`
```

## Feedback

As always, we value your feedback on how we can improve Remirror. Please raise your proposals via [issues on GitHub](https://github.com/remirror/remirror/issues) or via our [Discord server](https://remirror.io/chat).
