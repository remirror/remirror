# remirror

> One package to rule them all, one entry point to bind them.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/remirror/next
[npm]: https://npmjs.com/package/remirror/v/next
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=remirror@next
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/remirror@next
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/remirror/red?icon=npm

## Installation

```bash
# yarn
yarn add remirror@next

# pnpm
pnpm add remirror@next

# npm
npm install remirror@next
```

The `remirror` package will automatically install the `@remirror/pm` package for you. You only need to install it yourself if you'd like to ensure consistent versions of the `prosemirror-*` libraries when importing from `@remirror/pm/state` instead of `prosemirror-state` or `@remirror/pm/model` instead of `prosemirror-model`.

## Usage

Rather than installing multiple scoped packages, the `remirror` package is a gateway to using all the goodness that remirror provides while minimising your bundle size.

The following creates a React based remirror editor.

```tsx
import React from 'react';
import { SocialPreset } from 'remirror/preset/social';
import { RemirrorProvider, useManager, useRemirror } from 'remirror/react';
import { SocialEmojiComponent } from 'remirror/react/social';

const EditorWrapper = () => {
  const socialPreset = new SocialPreset();
  const manager = useManager([socialPreset]);

  return (
    <RemirrorProvider manager={manager}>
      <SocialEmojiComponent />
      <Editor />
    </RemirrorProvider>
  );
};

const Editor = () => {
  const { getRootProps } = useRemirror();

  return <div {...getRootProps()} />;
};
```
