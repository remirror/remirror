---
'@remirror/theme': minor
'@remirror/extension-react-tables': patch
'@remirror/extension-text-color': patch
---

Deprecate `getTheme` and `getThemeProps` in favour of new methods `getThemeVar` and `getThemeVarName`.

This removes a code path that used an ES6 Proxy, which cannot be polyfilled.

```
getTheme((t) => t.color.primary.text) => `var(--rmr-color-primary-text)`

getThemeProps((t) => t.color.primary.text) => `--rmr-color-primary-text`
```

```
getThemeVar('color', 'primary', 'text') => `var(--rmr-color-primary-text)`

getThemeVarName('color', 'primary', 'text') => `--rmr-color-primary-text`
```
