<p align="center">
  <a href="https://remirror.io"><img width="300" height="300" src="https://raw.githubusercontent.com/remirror/remirror/next/support/assets/logo-animated-light.svg?sanitize=true" alt="animated remirror logo" /></a>
</p>

<p align="center">
  A React <em>toolkit</em> for building <em>cross-platform</em> text editors, based on <a href="https://github.com/ProseMirror/prosemirror">ProseMirror</a>.
</p>

<br />

<p align="center">
  <a href="#motivation"><strong>Motivation</strong></a> ·
  <a href="#status"><strong>Status</strong></a> ·
  <a href="https://remirror.io/docs"><strong>Documentation</strong></a> ·
  <a href="https://remirror.vercel.app"><strong>Storybook</strong></a> ·
  <a href="https://remirror.io/docs/contributing"><strong>Contributing</strong></a>
</p>

<br />

<p align="center">
  <a href="https://unpkg.com/@remirror/core/dist/core.browser.esm.js">
    <img src="https://img.shields.io/bundlephobia/minzip/@remirror/core/next" alt="Bundled sized of core library" title="@remirror/core bundle size">
  </a>
  <a href="https://github.com/remirror/remirror/actions?query=workflow:ci">
    <img src="https://github.com/remirror/remirror/workflows/ci/badge.svg?branch=next" alt="Continuous integration badge for automatic releases" title="GitHub Actions CI Badge" />
  </a>
  <a href="https://github.com/remirror/remirror/actions?query=workflow:docs">
    <img src="https://github.com/remirror/remirror/workflows/docs/badge.svg?branch=next" alt="Continuous integration badge for docs deployment" title="Docs Deployment CI Badge" />
  </a>
  <a href="https://codeclimate.com/github/remirror/remirror/maintainability">
    <img src="https://api.codeclimate.com/v1/badges/f4d8dcd5c2228524a53a/maintainability" alt="Project maintainability provided by CodeClimate" title="Maintainability score"/>
  </a>
  <a href="https://codeclimate.com/github/remirror/remirror/test_coverage">
    <img src="https://api.codeclimate.com/v1/badges/f4d8dcd5c2228524a53a/test_coverage" alt="Unit test coverage for the codebase" title="Code coverage" />
  </a>
  <a href="https://remirror.io/chat">
    <img alt="Discord" src="https://img.shields.io/discord/726035064831344711" alt="Join our discord server" title="Discord server link" />
  </a>
  <a href="./packages/remirror/package.json">
    <img src="https://img.shields.io/npm/v/remirror?style=flat" alt="Version" />
  </a>
  <a href="https://github.com/sponsors/remirror">
    <img src="https://img.shields.io/badge/-Sponsor-7963d2" alt="Sponsor" />
  </a>
</p>

<br />

## Introduction

```jsx
import React from 'react';
import { BoldExtension, ItalicExtension, UnderlineExtension } from 'remirror/extensions';
import { Remirror, useRemirror, OnChangeJSON } from '@remirror/react';

const extensions = () => [new BoldExtension(), new ItalicExtension(), new UnderlineExtension()];

const Editor = ({ onChange }) => {
  const { manager, state } = useRemirror({
    extensions,
    content: '<p>Hi <strong>Friend</strong></p>',
    stringHandler: 'html',
    selection: 'end',
  });

  return (
    <Remirror manager={manager} initialContent={state}>
      <OnChangeJSON onChange={onChange} />
    </Remirror>
  );
};
```

With this code snippet your editor now supports basic editing functionality.

Alternatively, take a look at our [5 minute tutorial](https://remirror.io/docs/5-min-tutorial) to get up and running with an out-of-the-box WYSIWYG editor.

<br />

## Installation

```bash
npm add remirror @remirror/react @remirror/pm
```

If you run into any issues we recommend any of the following:

- Open an issue in our [github repo](https://github.com/remirror/remirror/issues).
- [Join our discord server](https://remirror.io/chat) and discuss the problem with our community.
- Create a pull request with your proposed improvement by clicking the edit button on the relevant page.

Whatever you decide thanks for taking the time to explore the **remirror** project.

<br />

## Our community

### Sponsors

<table>
  <tr>
    <td align="center">
      <a href="https://www.nextapp.co/" rel="nofollow">
        <img src="https://user-images.githubusercontent.com/2003804/170265084-f3f7a605-612d-4799-86dc-2f8f0b4a3c21.png" height="100" style="max-width: 100%;" alt="NEXT logo"><br>
        <strong>NEXT</strong>
      </a>
    </td>
    <td align="center">
      <a href="https://reflect.app/" rel="nofollow">
        <img src="https://user-images.githubusercontent.com/2003804/170265087-fb7bf84e-0413-49d5-8a30-15b71bc9055b.png" height="100" style="max-width: 100%;" alt="Reflect logo"><br>
        <strong>Reflect</strong>
      </a>
    </td>
  </tr>
</table>

**[Become a sponsor!](https://github.com/sponsors/remirror)**

### Community spotlight

<table>
  <tr>
    <td align="center">
      <a href="https://www.hellobenefex.com/" rel="nofollow">
        <img src="https://user-images.githubusercontent.com/2003804/170766938-b915e2a7-1b8c-47d3-861d-6037922416a9.jpeg" width="50" style="max-width: 100%;" alt="Benefex logo"><br>
        <strong>Benefex</strong>
      </a>
    </td>
    <td align="center">
      <a href="https://cobudget.com/" rel="nofollow">
        <img src="https://user-images.githubusercontent.com/2003804/170274003-89c8ff79-c5b7-4a59-b78b-b540f2fe308e.jpeg" width="50" style="max-width: 100%;" alt="Cobudget logo"><br>
        <strong>Cobudget</strong>
      </a>
    </td>
    <td align="center">
      <a href="https://eftax.co.jp/" rel="nofollow">
        <img src="https://user-images.githubusercontent.com/2003804/170274006-133e9f20-1d01-47a1-92af-7cac9a8c2fb6.png" width="80" style="max-width: 100%;" alt="eftax logo"><br>
        <strong>eftax Co., Ltd.</strong>
      </a>
    </td>
    <td align="center">
      <a href="https://www.labkey.com/" rel="nofollow">
        <img src="https://user-images.githubusercontent.com/2003804/170284116-672d0048-31aa-4b3c-8889-648ecc6e01b9.png" width="50" style="max-width: 100%;" alt="LabKey logo"><br>
        <strong>LabKey</strong>
      </a>
    </td>
    <td align="center">
      <a href="https://www.onethread.app/" rel="nofollow">
        <img src="https://user-images.githubusercontent.com/2003804/170278624-631b4030-1f5e-4fb9-832f-783d0806dd61.jpeg" width="50" style="max-width: 100%;" alt="Onethread logo"><br>
        <strong>Onethread</strong>
      </a>
    </td>
  </tr>
</table>

## Documentation

View our documentation website [**here**][introduction].

- [Introduction]
- [Use an out-of-the-box editor](https://remirror.io/docs/5-min-tutorial)
- [Create your own editor](https://remirror.io/docs/getting-started/installation)
- [Extensions](https://remirror.io/docs/extensions/)
- [Storybook]
- [CodeSandbox starter](https://codesandbox.io/s/github/remirror/remirror-starter)

<br />

## Features

- A11y focused and ARIA compatible.
- I18n support via [lingui](https://github.com/lingui/js-lingui).
- Great support for mobile devices.
- Out-of-the-box editors, or create own by composing extensions.
- Create your own extensions for bare-metal ProseMirror integration.
- Collaborative editing with [yjs](https://github.com/yjs/yjs) or [prosemirror-collab](https://github.com/ProseMirror/prosemirror-collab).
- 30+ extensions for creating fully customized editing experiences.
- TypeScript as a first class citizen for great developer experience.

<br />

## Getting Started

See our [5 minute tutorial](https://remirror.io/docs/5-min-tutorial) to get started!

## Contributing

Please read our [contribution guide] for details on our code of conduct, and the process for submitting pull requests. It also outlines the project structure so you can find help when navigating your way around the codebase.

<br />

## Versioning

This project uses [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/remirror/remirror/tags).

<br />

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

[introduction]: https://remirror.io/docs
[contribution guide]: https://remirror.io/docs/contributing
[projects]: https://remirror.io/projects
[installation]: https://remirror.io/docs/installation
[storybook]: https://remirror.vercel.app
[typescript]: https://github.com/microsoft/Typescript
[react]: https://github.com/facebook/react
[prosemirror]: https://prosemirror.net
