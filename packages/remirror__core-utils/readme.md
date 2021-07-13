# @remirror/core-utils

> Provides core utility functions which are used throughout the remirror codebase.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/core-utils
[npm]: https://npmjs.com/package/@remirror/core-utils
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/core-utils
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/core-utils
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/core-utils/red?icon=npm

## Installation

This is included by default when you install the recommended `remirror` package. All exports are also available via `remirror/core/utils` and `remirror/core`.

## Usage

If you plan to support SSR and need to parse the html contents of the editor in an SSR environment then `min-document` is automatically added to all node environments.

However, `min-document` can't actually parse the content properly since the implementation is intentionally underpowered. To properly parse content from a html string you will need to install either `jsdom` or `domino`. These dependencies are only included within non-browser builds and won't bloat your bundle size in the browser.
