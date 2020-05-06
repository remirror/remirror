# @remirror/pm

> All the bundled prosemirror dependencies which are required for the remirror core libraries.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm]
[![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts)
![MIT License][license]

[version]: https://flat.badgen.net/npm/v/@remirror/pm
[npm]: https://npmjs.com/package/@remirror/pm
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/pm
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/pm
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/pm/red?icon=npm

## Installation

```bash
yarn add @remirror/pm
```

## Usage

This bundles up the prosemirror libaries into one package to prevent multiple installs. Tree shaking
with rollup and webpack means that the compiled code only picks out what is used.

While you should install this alongside other `remirror` libraries (it is a peer dependency) you
will probably never need to use it. However if you decide you would like to to the following can
serve as a guide.

```ts
import { View } from '@remirror/pm/lib/view';
import { } from '@remirror/pm/lib/state;

// Top level
import {} from '@remirror/pm';
```

And that is'

## Credits

This package was bootstrapped with [monots].

[monots]: https://github.com/monots/monots
