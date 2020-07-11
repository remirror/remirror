<div align="center">
  <br />
  <div align="center">
    <a href="https://remirror.io"><img width="300" height="300" src="https://raw.githubusercontent.com/remirror/remirror/next/support/assets/logo-animated-light.svg?sanitize=true" alt="animated remirror logo" /></a>
  </div>
  <br />
  <br />
  <br />
  <div align="center">
    <a href="https://github.com/remirror/remirror/actions?query=workflow%3A%22Node+CI%22?branch=next"><img src="https://github.com/remirror/remirror/workflows/Node%20CI/badge.svg?branch=next" alt="Build And Release" /></a>
    <a href="https://github.com/remirror/remirror/actions?query=workflow%3A%22Deploy+Docs%22?branch=next"><img src="https://github.com/remirror/remirror/workflows/Deploy%20Docs/badge.svg?branch=next" alt="Deploy Docs" /></a>
    <a href="https://dev.azure.com/remirror/remirror/_build/latest?definitionId=2&amp;branchName=next"><img src="https://dev.azure.com/remirror/remirror/_apis/build/status/remirror.remirror?branchName=next" alt="Azure DevOps builds" /></a>
    <a href="https://github.com/remirror/remirror/commits/next"><img src="https://img.shields.io/github/commit-activity/m/remirror/remirror.svg?amp;logo=github" alt="GitHub commit activity"></a>
    <a href="https://discord.gg/C4cfrMK"><img alt="Discord" src="https://img.shields.io/discord/726035064831344711" alt="Join our discord server"></a>
    </div>
</div>

<br />

<div align="center">
  <div align="center">
    <img width="600"  src="https://media.githubusercontent.com/media/remirror/remirror/next/support/assets/wysiwyg.png" alt="remirror" />
  </div>
    <br />
</div>

> Remirror is a toolkit for building accessible editors which run on the web and desktop.

<br />

### Motivation

I started `remirror` as a challenge to myself. Would it be possible to build an editor that combined
great performance with ease of use? I wanted something that allowed developers like myself to fall
in love and feel playful even when working through deeply complex concepts. The editor would need to
combine plug-and-play features, with ample room for customisation.

I also wanted to give users of all frameworks, the ability to build an editor by picking and
choosing their desired building blocks.

In order to meet my goals, I settled on [ProseMirror](https://prosemirror.net/) as the core editor
layer. The second decision was to base the structure of the editor on blocks of functionality called
`Extensions`. Each extension would add a slice of beauty to the editor, allowing users to craft
their masterpieces.

In this latest version, I believe I'm starting to see these goals come to fruition. Every single
part of the editor can be controlled by extensions. For example, the core (`Schema`) is managed by a
[built-in extension](https://github.com/remirror/remirror/blob/next/packages/@remirror/core/src/builtins/schema-extension.ts).
There's already a huge selection of extensions for users to choose from.

And the new API is beautiful. For React, this comes with a slew of drop-in components and hooks.
Many more are being worked on. It's almost magical how well it works.

For example, to add a drop down emoji picker to your react editor the following code will suffice.

```tsx
import React from 'react';
import { SocialEmojiComponent, SocialProvider } from 'remirror/react/social';

const Editor = () => {
  return <SocialProvider><SocialEmojiComponent></SocialProvider>
}

```

With this tiny snippet your editor now supports a really nice ui element. And it's all customisable
with ordinary `css`. No more fighting against yet another `CSS-in-JS` library.

There's so much more to come and I'm glad you're taking a look. I hope `remirror` proves to be
everything you need for your next text editor and more.

This documentation is still a work in progress. It is being updated in parallel with the `next`
branch and still has many iterations before it can be called ready.

While reading through this codebase, if you find errors or would like to suggest improvements there
are several options.

- Open an issue in our [github repo](https://github.com/remirror/remirror/issues).
- [Join our discord server](https://discord.gg/C4cfrMK) and discuss the problem with us.
- Create a pull request with your proposed improvement by clicking the edit button on the relevant
  page.
- Move on, because deadlines are looming and life is too short.

Whatever you decide I'm happy that you've taken the time to dive into the `remirror` project.

<br />

### Status

This is the `next` version of remirror. It is undergoing heavy development at the moment and
documentation is still being rewritten to capture the updated API.

### Documentation

View our documentation website at https://remirror.io/

- [Introduction]
- [Getting started]

<br />

### Features

- A11y focused and ARIA compatible.
- I18n support via [lingui](https://github.com/lingui/js-lingui).
- Collaborative editing with [yjs](https://github.com/yjs/yjs).
- Prebuilt editors [social](./@remirror/react-social) and [wysiwyg](./@remirror/react-wysiwyg) and a
  markdown option is coming soon.
- 30+ extensions and 8 presets available to create your very own editor.
- Zero configuration support for **Server Side Rendering (SSR)**.
- Cross platform and cross-framework, with an Angular solution coming later this year.

<br />

### Prerequisites

- [Typescript](https://www.typescriptlang.org/) `>= 3.9`
- [React](https://reactjs.org/) `>= 16.9`
- [pnpm](https://pnpm.js.org/en/installation) `>= 5.3`

<br />

### Editors

![A gif showing mentions being suggested as the user types with editing supported](https://media.githubusercontent.com/media/ifiokjr/assets/master/remirror/repo-banner.gif 'A gif showing mentions being suggested as the user types with editing supported').

You can see a guide on how to to add this exact editor to your codebase here.

To add this editor to your codebase, first install the required dependencies. Make sure to include
the `@next` distribution tag to ensure you install the correct version.

```bash
# yarn
yarn add remirror@next @remirror/pm@next

# pnpm
pnpm add remirror@next @remirror/pm@next

# npm
npm install remirror@next @remirror/pm@next
```

`@remirror/pm` is a peer dependency which manages all the prosemirror packages for you.

## Usage

Once installed you will be able to add the following code which creates an editor with the bold
extension active. Clicking the button when text is selected will toggle between bold and not bold.

```tsx
import React, { useCallback } from 'react';
import { BoldExtension } from 'remirror/extension/bold';
import { RemirrorProvider, useManager, useRemirror, useExtensionCreator } from 'remirror/react';

const Editor = () => {
  const { getRootProps, active, commands } = useRemirror();

  const toggleBold = useCallback(() => {
    commands.toggleBold();
  }, [commands]);

  return (
    <div>
      <div {...getRootProps()} />
      <button onClick={toggleBold} style={{ fontWeight: active.bold() ? 'bold' : undefined }}>
        Bold
      </button>
    </div>
  );
};

const EditorWrapper = () => {
  const manager = useManager([new BoldExtension()]);

  return (
    <RemirrorProvider manager={manager}>
      <Editor />
    </RemirrorProvider>
  );
};
```

<br />

### Built With

- [Typescript]
- [ProseMirror]
- Love ❤️

<br />

### Contributing

Please read [contributing.md](docs/contributing.md) for details on our code of conduct, and the
process for submitting pull requests.

<br />

### Versioning

This project uses [SemVer](http://semver.org/) for versioning. For the versions available, see the
[tags on this repository](https://github.com/remirror/remirror/tags).

<br />

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

[introduction]: https://remirror.io/docs/introduction
[installation]: https://remirror.io/docs/guide/installation
[typescript]: https://github.com/microsoft/Typescript
[react]: https://github.com/facebook/react
[prosemirror]: https://prosemirror.net
