<div align="center">
  <br />
  <div align="center">
    <a href="https://docs.remirror.org"><img width="300" height="300" src="https://raw.githubusercontent.com/remirror/remirror/next/support/assets/logo-animated-light.svg?sanitize=true" alt="animated remirror logo" /></a>
  </div>
    <br />
    <br />
    <br />
</div>

<p align="center">

<a href="https://github.com/remirror/remirror/actions?query=workflow%3A%22Node+CI%22?branch=next"><img src="https://github.com/remirror/remirror/workflows/Node%20CI/badge.svg?branch=next" alt="Build And Release" /></a>
<a href="https://github.com/remirror/remirror/actions?query=workflow%3A%22Deploy+Docs%22?branch=next"><img src="https://github.com/remirror/remirror/workflows/Deploy%20Docs/badge.svg?branch=next" alt="Deploy Docs" /></a>
<a href="https://dev.azure.com/remirror/remirror/_build/latest?definitionId=2&amp;branchName=next"><img src="https://dev.azure.com/remirror/remirror/_apis/build/status/remirror.remirror?branchName=next" alt="Azure DevOps builds" /></a>
<a href="https://github.com/remirror/remirror/commits/next"><img src="https://img.shields.io/github/commit-activity/m/remirror/remirror.svg?amp;logo=github" alt="GitHub commit activity"></a>

</p>

<br />

<div align="center">
  <div align="center">
    <img width="600"  src="https://media.githubusercontent.com/media/remirror/remirror/next/support/assets/wysiwyg.png" alt="remirror" />
  </div>
    <br />
</div>

> Remirror is a toolkit for building accessible editors which run on the web and desktop.

<br />

### Status

This is the `next` version of remirror. It is undergoing heavy development at the moment and
documentation is still being rewritten to capture the updated API.

### Documentation

View our documentation website at https://docs.remirror.org/

- [Introduction]
- [Getting started]

<br />

### Features

- A11y focused and ARIA compatible.
- **3** prebuilt editors, [markdown](./@remirror/editor-markdown),
  [social](./@remirror/react-social) and [wysiwyg](./@remirror/react-wysiwyg).
- Extensions available for adding your own flavour to your own custom editor editor.
- Zero config support **Server Side Rendering (SSR)**.

<br />

### Prerequisites

- [Typescript](https://www.typescriptlang.org/) `>= 3.9`
- [React](https://reactjs.org/) `>= 16.9`
- [pnpm](https://pnpm.js.org/en/installation) `>= 5`

<br />

### Editors

![A gif showing mentions being suggested as the user types with editing supported](https://media.githubusercontent.com/media/ifiokjr/assets/master/remirror/repo-banner.gif 'A gif showing mentions being suggested as the user types with editing supported')

To add this editor to your codebase, first install the required dependencies.

```bash
# yarn
yarn add remirror @remirror/pm

# pnpm
pnpm add remirror @remirror/pm

# npm
npm install remirror @remirror/pm
```

`@remirror/pm` is a peer dependency which manages all the prosemirror packages for you.

```tsx
import {
  ActiveTagData,
  ActiveUserData,
  MentionChangeParameter,
  SocialEditor,
  UserData,
} from 'remirror/editor/social';

const tags = ['NeedsStylingSoon', 'LondonHits', 'Awesome'];

const users = [
  {
    avatarUrl: 'https://source.unsplash.com/random/100x100',
    displayName: 'Tolu',
    id: '1234',
    username: 'tolu',
    href: '/u/tolu',
  },
  {
    avatarUrl: 'https://source.unsplash.com/random/100x100',
    displayName: 'Timi',
    id: '5678',
    username: 'timi',
    href: '/u/timi',
  },
];

const MySocialEditor = () => {
  const [mention, setMention] = useState<MentionChangeParameter>();

  const onChange = useCallback((parameter?: MentionChangeParameter) => {
    setMention(parameter);
  }, []);

  const userData: ActiveUserData[] = useMemo(
    () =>
      mention?.name === 'at' && (mention.query.length)
        ? users.filter(user => user.username.includes(mention.query) : [],
    [mention],
  );

  const tagData: ActiveTagData[] = useMemo(
    () => mention?.name === 'tag' && mention.query.length ? tags.filter(tag => tag.includes(mention.query)) : [],
    [mention],
  );

  return (
    <SocialEditor
      {...props}
      userData={userData}
      tagData={tagData}
      onMentionChange={onChange}
    />
  );
};
```

### Testing

From the root of this repository run the following to trigger a full typecheck, linting and jest
tests.

```bash
pnpm run checks
```

By default these checks are not run automatically. To enable automatic precommit and prepush hooks
use the following command:

```bash
pnpm run start:checks
```

To stop per-commit / per-push checks run:

```bash
pnpm run stop:checks
```

<br />

### Built With

- [Typescript]
- [Prosemirror]
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

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

[introduction]: https://docs.remirror.org
[installation]: https://docs.remirror.org/installation
[getting started]: https://docs.remirror.org/guides/quickstart
[typescript]: https://github.com/microsoft/Typescript
[react]: https://github.com/facebook/react
[prosemirror]: https://prosemirror.net
