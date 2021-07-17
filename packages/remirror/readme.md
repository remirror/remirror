# remirror

> One package to rule them all, one entry point to bind them.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/remirror
[npm]: https://npmjs.com/package/remirror
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=remirror
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/remirror
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/remirror/red?icon=npm

## Installation

```bash
# yarn
yarn add remirror @remirror/pm

# pnpm
pnpm add remirror @remirror/pm

# npm
npm install remirror @remirror/pm
```

The `remirror` package will automatically install the `@remirror/pm` package for you. You only need to install it yourself if you'd like to ensure consistent versions of the `prosemirror-*` libraries when importing from `@remirror/pm/state` instead of `prosemirror-state` or `@remirror/pm/model` instead of `prosemirror-model`.

## Usage

Rather than installing multiple scoped packages, the `remirror` package is a gateway to using all the goodness that remirror provides while minimising your bundle size.

The following creates a controlled editor with React.

```tsx
import React from 'react';
import { socialPreset } from 'remirror/extensions';
import { Remirror, SocialEmojiComponent, useRemirror } from '@remirror/react';

const EditorWrapper = () => {
  const socialPreset = new SocialPreset();
  const { state, onChange } = useRemirror({ extensions: () => [...socialPreset()] });

  return (
    <Remirror state={state} onChange={onChange} manager={manager} autoRender={true}>
      <SocialEmojiComponent />
    </Remirror>
  );
};
```

These are the entry points available through the `remirror` package.

- `remirror` - All the core functionality available through `@remirror/core`.
- `remirror/extensions` - All the core extensions and presets made available through the main `remirror` repository. This doesn't include any framework specific extensions and presets.
- `remirror/dom` - The dom framework implementation of via `createDomEditor`.
