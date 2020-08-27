# remirror

> One package to rule them all, one entry point to bind them.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts) ![MIT License][license]

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
yarn add remirror@next @remirror/pm@next

# pnpm
pnpm add remirror@next @remirror/pm@next

# npm
npm install remirror@next @remirror/pm@next
```

## Usage

Rather than installing multiple scoped packages, the `remirror` package is a gateway to using all the goodness that remirror provides while minimising your bundle size.

The following creates a dom based remirror editor.

```ts
import { SocialPreset } from 'remirror/preset/social';
import { SocialEmojiComponent } from 'remirror/react/social';
import { RemirrorProvider, useRemirror, useManager } from 'remirror/react';

const EditorWrapper = () => {
  const socialPreset = new SocialPreset();
  const manager = useManager([socialPreset]);

  return (
    <RemirrorProvider manager={manager}>
      <div>
        <SocialEmojiComponent />
        <Editor />
      <div/>
    </RemirrorProvider>
  )
}

const Editor = () => {
  const { getRootProps } = useRemirror();

  return <div {...getRootProps()}>
}
```
