<div align="center">
  <br />
  <div align="center">
    <a href="https://remirror.io"><img width="300" height="300" src="https://raw.githubusercontent.com/remirror/remirror/next/support/assets/logo-animated-light.svg?sanitize=true" alt="animated remirror logo" /></a>
  </div>
  <br />
  <br />
  <br />
  <div align="center">
    <a href="https://github.com/remirror/remirror/actions?query=workflow:ci"><img src="https://github.com/remirror/remirror/workflows/ci/badge.svg?branch=next" alt="Continuous integration badge for github actions" /></a>
    <a href="https://github.com/remirror/remirror/actions?query=workflow:docs"><img src="https://github.com/remirror/remirror/workflows/docs/badge.svg?branch=next" alt="Badge outline whether documentation deployed successfully" /></a>
    <a href="https://codeclimate.com/github/remirror/remirror/maintainability"><img src="https://api.codeclimate.com/v1/badges/f4d8dcd5c2228524a53a/maintainability" alt="Project maintainability" /></a>
    <a href="https://codeclimate.com/github/remirror/remirror/test_coverage"><img src="https://api.codeclimate.com/v1/badges/f4d8dcd5c2228524a53a/test_coverage" alt="Code coverage" /></a>
    <a href="https://remirror.io/chat"><img alt="Discord" src="https://img.shields.io/discord/726035064831344711" alt="Join our discord server"></a>
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

## Motivation

`remirror` was started as a personal challenge. Would it be possible to build an editor that combined great performance with ease of use? It was also important to give users of all frameworks, the ability to build an editor by picking and choosing their desired building blocks.

In order to meet these goals, [ProseMirror](https://prosemirror.net/) was picked as the core editor layer. The second decision was to base the structure of the editor on blocks of functionality called `Extensions`. Each extension would add a slice of beauty to the editor, allowing users to craft their masterpieces.

In the latest version, some of the initial goals of `remirror` are bearing fruit. Every single part of the editor can be controlled by extensions. For example, the core (`Schema`) is managed by a [built-in extension](https://github.com/remirror/remirror/blob/HEAD/packages/@remirror/core/src/builtins/schema-extension.ts).

And the new API is so much better. For React, this comes with a bunch of drop-in components and hooks. Many more are being worked on.

To add a drop down emoji picker to your react editor the following code will suffice.

```tsx
import React from 'react';
import { SocialEmojiComponent, SocialProvider } from 'remirror/react/social';

const Editor = () => {
  return (
    <SocialProvider>
      <SocialEmojiComponent />
    </SocialProvider>
  );
};
```

With this tiny snippet your editor now supports a really nice ui element. And it's all customisable with ordinary `css`. No more fighting against a `CSS-in-JS` library as in previous versions.

There's so much more to come and I'm glad you're taking a look. I hope `remirror` proves to be everything you need for your next text editor project.

<br />

## Status

This is the `next` version of remirror. It is undergoing heavy development at the moment and documentation is still being rewritten to capture the updated API.

While exploring this project, if you find errors or would like to suggest improvements there are several options.

- Open an issue in our [github repo](https://github.com/remirror/remirror/issues).
- [Join our discord server](https://remirror.io/chat) and discuss the problem with our community.
- Create a pull request with your proposed improvement by clicking the edit button on the relevant page.
- Move on, because deadlines are looming and life is too short.

Whatever you decide I'm happy that you've taken the time to dive into the `remirror` project.

<br />

## Documentation

View our documentation website at https://remirror.io

- [Introduction]
- [Create an editor](https://remirror.io/docs/guide/create-editor)
- [Extensions](https://remirror.io/docs/concepts/extension)

<br />

## Features

- A11y focused and ARIA compatible.
- I18n support via [lingui](https://github.com/lingui/js-lingui).
- Collaborative editing with [yjs](https://github.com/yjs/yjs).
- Prebuilt editors [social](./@remirror/react-social) and [wysiwyg](./@remirror/react-wysiwyg) and a markdown option is coming soon.
- 30+ extensions and 8 presets available to create your very own editor.
- Zero configuration support for **Server Side Rendering (SSR)**.
- Cross platform and cross-framework, with an Angular solution coming later this year.

<br />

## Prerequisites

- [Typescript](https://www.typescriptlang.org/) `>= 4`
- [React](https://reactjs.org/) `>= 16.9`
- [pnpm](https://pnpm.js.org/en/installation) `>= 5.5`

<br />

## Editors

![A gif showing mentions being suggested as the user types with editing supported](https://media.githubusercontent.com/media/ifiokjr/assets/master/remirror/repo-banner.gif 'A gif showing mentions being suggested as the user types with editing supported').

You can see a guide on how to to add this exact editor to your codebase here.

To add this editor to your codebase, first install the required dependencies. Make sure to include the `@next` distribution tag to ensure you install the correct version.

```bash
# yarn
yarn add remirror@next @remirror/pm@next

# pnpm
pnpm add remirror@next @remirror/pm@next

# npm
npm install remirror@next @remirror/pm@next
```

`@remirror/pm` is a peer dependency which manages all the ProseMirror packages for you.

## Usage

Once installed you will be able to add the following code which creates an editor with the bold extension active. Clicking the button when text is selected will toggle between bold and not bold.

```tsx
import React, { useCallback } from 'react';
import { BoldExtension } from 'remirror/extension/bold';
import { RemirrorProvider, useManager, useRemirror, useExtensionCreator } from 'remirror/react';

const Editor = () => {
  const { getRootProps, active, commands } = useRemirror({ autoUpdate: true });

  return (
    <div>
      <div {...getRootProps()} />
      <button
        onClick={() => commands.toggleBold()}
        style={{ fontWeight: active.bold() ? 'bold' : undefined }}
      >
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

## Built With

- [Typescript]
- [ProseMirror]
- Love ❤️

<br />

## Contributing

Please read our [contribution guide] for details on our code of conduct, and the process for submitting pull requests. It also outlines the project structure so you can find help when navigating your way around the codebase.

In addition each folder in this codebase a readme describing why it exists.

You might also notice there are surprisingly few files in the root directory of this project. All the configuration files have been moved to the `support/root` directory and are symlinked to the root directory in a `preinstall` hook. For more information take a look at [folder](support/root) and [readme](support/root/readme.md).

Finally you can keep track on what's being worked on via the [projects].

<br />

## Versioning

This project uses [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/remirror/remirror/tags).

<br />

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

[introduction]: https://remirror.io/docs
[contribution guide]: https://remirror.io/docs/contributing
[projects]: https://remirror.io/projects
[installation]: https://remirror.io/docs/guide/installation
[typescript]: https://github.com/microsoft/Typescript
[react]: https://github.com/facebook/react
[prosemirror]: https://prosemirror.net
