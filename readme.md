<div align="center">
  <br />
  <div align="center">
    <img width="300" height="300" src="https://raw.githubusercontent.com/remirror/remirror/next/support/assets/logo-animated-light.svg?sanitize=true" alt="animated remirror logo" />
  </div>
    <br />
    <br />
    <br />
</div>

<p align="center">

<a href="https://dev.azure.com/remirror/remirror/_build/latest?definitionId=2&amp;branchName=master"><img src="https://dev.azure.com/remirror/remirror/_apis/build/status/remirror.remirror?branchName=master" alt="Azure DevOps builds" /></a>
<a href="https://github.com/remirror/remirror/actions?query=workflow%3A%22Node+CI%22?branch=master"><img src="https://github.com/remirror/remirror/workflows/Node%20CI/badge.svg?branch=master" alt="GitHub Actions CI" /></a>
<a href="https://codeclimate.com/github/remirror/remirror/test_coverage"><img src="https://api.codeclimate.com/v1/badges/f4d8dcd5c2228524a53a/test_coverage" /></a>
<a href="https://github.com/remirror/remirror/commits/master"><img src="https://img.shields.io/github/commit-activity/m/remirror/remirror.svg?amp;logo=github" alt="GitHub commit activity"></a>
<a href="https://github.com/remirror/remirror/commits/master"><img src="https://img.shields.io/github/last-commit/remirror/remirror.svg?amp;logo=github" alt="GitHub last commit" /></a>
<a href="https://github.com/remirror/remirror/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc"><img src="https://img.shields.io/github/issues-raw/remirror/remirror.svg?amp;logo=github" alt="GitHub issues" /></a>
<a href="https://github.com/remirror/remirror/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc"><img src="https://img.shields.io/github/issues-pr/remirror/remirror.svg?amp;logo=github" alt="GitHub pull requests" /></a>
<a href="https://github.com/remirror/remirror"><img src="https://img.shields.io/github/stars/remirror/remirror.svg?amp;logo=github" alt="GitHub stars" /></a>
<a href="https://github.com/remirror/remirror/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/remirror.svg" alt="LICENSE" /></a>
<a href="https://app.netlify.com/sites/remirror/deploys"><img src="https://api.netlify.com/api/v1/badges/f59cbf02-798f-45dd-a78c-93ec52b08d20/deploy-status" alt="Netlify Status" /></a>
<a href="https://spectrum.chat/remirror"><img alt="Join the community on Spectrum" src="https://withspectrum.github.io/badge/badge.svg" /></a>

</p>

<br />

<div align="center">
  <div align="center">
    <img width="600"  src="https://media.githubusercontent.com/media/remirror/remirror/master/support/assets/wysiwyg.png" alt="remirror" />
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
  <!-- - [Installation] -->
- [Getting started]

<br />

### Features

- A11y focused and ARIA compatible.
- **3** prebuilt editors, [markdown](./@remirror/editor-markdown),
  [social](./@remirror/editor-social) and [wysiwyg](./@remirror/editor-wysiwyg).
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
} from 'remirror/react/editor/social';

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
- [React]
- [Prosemirror]

<br />

### Contributing

Please read [contributing.md](docs/contributing.md) for details on our code of conduct, and the
process for submitting pull requests.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/remirror/remirror)

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

<br />

### Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://ifiokjr.com"><img src="https://avatars2.githubusercontent.com/u/1160934?v=4" width="100px;" alt=""/><br /><sub><b>Ifiok Jr.</b></sub></a><br /><a href="https://github.com/remirror/remirror/commits?author=ifiokjr" title="Documentation">📖</a> <a href="https://github.com/remirror/remirror/commits?author=ifiokjr" title="Code">💻</a> <a href="#example-ifiokjr" title="Examples">💡</a> <a href="https://github.com/remirror/remirror/commits?author=ifiokjr" title="Tests">⚠️</a> <a href="#maintenance-ifiokjr" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://graphile.org/sponsor"><img src="https://avatars2.githubusercontent.com/u/129910?v=4" width="100px;" alt=""/><br /><sub><b>Benjie Gillam</b></sub></a><br /><a href="https://github.com/remirror/remirror/commits?author=benjie" title="Documentation">📖</a> <a href="https://github.com/remirror/remirror/issues?q=author%3Abenjie" title="Bug reports">🐛</a> <a href="#example-benjie" title="Examples">💡</a> <a href="https://github.com/remirror/remirror/commits?author=benjie" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/aried3r"><img src="https://avatars1.githubusercontent.com/u/1301152?v=4" width="100px;" alt=""/><br /><sub><b>Anton Rieder</b></sub></a><br /><a href="https://github.com/remirror/remirror/commits?author=aried3r" title="Documentation">📖</a></td>
    <td align="center"><a href="https://aarongreenlee.com/"><img src="https://avatars0.githubusercontent.com/u/264508?v=4" width="100px;" alt=""/><br /><sub><b>Aaron Greenlee</b></sub></a><br /><a href="https://github.com/remirror/remirror/commits?author=aarongreenlee" title="Documentation">📖</a> <a href="https://github.com/remirror/remirror/commits?author=aarongreenlee" title="Code">💻</a></td>
    <td align="center"><a href="http://yellowbrim.com"><img src="https://avatars2.githubusercontent.com/u/1542740?v=4" width="100px;" alt=""/><br /><sub><b>Charley Bodkin</b></sub></a><br /><a href="https://github.com/remirror/remirror/commits?author=charlex" title="Code">💻</a> <a href="https://github.com/remirror/remirror/commits?author=charlex" title="Documentation">📖</a></td>
    <td align="center"><a href="https://ocavue.github.io/"><img src="https://avatars2.githubusercontent.com/u/24715727?v=4" width="100px;" alt=""/><br /><sub><b>ocavue</b></sub></a><br /><a href="https://github.com/remirror/remirror/commits?author=ocavue" title="Code">💻</a></td>
    <td align="center"><a href="https://hughboylan.com"><img src="https://avatars2.githubusercontent.com/u/2158740?v=4" width="100px;" alt=""/><br /><sub><b>Hugh Boylan</b></sub></a><br /><a href="https://github.com/remirror/remirror/commits?author=hboylan" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://splitinfinities.com"><img src="https://avatars0.githubusercontent.com/u/1245238?v=4" width="100px;" alt=""/><br /><sub><b>William M. Riley</b></sub></a><br /><a href="https://github.com/remirror/remirror/commits?author=splitinfinities" title="Code">💻</a> <a href="https://github.com/remirror/remirror/issues?q=author%3Asplitinfinities" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://www.thebabyboxco.com"><img src="https://avatars3.githubusercontent.com/u/1892132?v=4" width="100px;" alt=""/><br /><sub><b>Adam Lane</b></sub></a><br /><a href="https://github.com/remirror/remirror/commits?author=Enalmada" title="Code">💻</a> <a href="https://github.com/remirror/remirror/issues?q=author%3AEnalmada" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://pensight.com"><img src="https://avatars0.githubusercontent.com/u/5213953?v=4" width="100px;" alt=""/><br /><sub><b>Tomas Cerskus</b></sub></a><br /><a href="https://github.com/remirror/remirror/commits?author=tomas-c" title="Code">💻</a> <a href="https://github.com/remirror/remirror/issues?q=author%3Atomas-c" title="Bug reports">🐛</a> <a href="https://github.com/remirror/remirror/commits?author=tomas-c" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://lightpohl.me"><img src="https://avatars0.githubusercontent.com/u/4073684?v=4" width="100px;" alt=""/><br /><sub><b>Joshua Pohl</b></sub></a><br /><a href="https://github.com/remirror/remirror/commits?author=lightpohl" title="Code">💻</a> <a href="https://github.com/remirror/remirror/issues?q=author%3Alightpohl" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://newline.co"><img src="https://avatars2.githubusercontent.com/u/4318?v=4" width="100px;" alt=""/><br /><sub><b>Nate Murray</b></sub></a><br /><a href="https://github.com/remirror/remirror/commits?author=jashmenn" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/zhaoyao91"><img src="https://avatars3.githubusercontent.com/u/3808838?v=4" width="100px;" alt=""/><br /><sub><b>Yao Zhao</b></sub></a><br /><a href="https://github.com/remirror/remirror/issues?q=author%3Azhaoyao91" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://hennessyevan.com"><img src="https://avatars1.githubusercontent.com/u/16711653?v=4" width="100px;" alt=""/><br /><sub><b>Evan Hennessy</b></sub></a><br /><a href="https://github.com/remirror/remirror/commits?author=hennessyevan" title="Code">💻</a> <a href="https://github.com/remirror/remirror/issues?q=author%3Ahennessyevan" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/watlandc"><img src="https://avatars3.githubusercontent.com/u/6117504?v=4" width="100px;" alt=""/><br /><sub><b>Chris Watland</b></sub></a><br /><a href="https://github.com/remirror/remirror/issues?q=author%3Awatlandc" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/lanyusan"><img src="https://avatars3.githubusercontent.com/u/56706512?v=4" width="100px;" alt=""/><br /><sub><b>lanyusan</b></sub></a><br /><a href="https://github.com/remirror/remirror/commits?author=lanyusan" title="Code">💻</a> <a href="https://github.com/remirror/remirror/issues?q=author%3Alanyusan" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://twitter.com/ffloriel_"><img src="https://avatars1.githubusercontent.com/u/12745899?v=4" width="100px;" alt=""/><br /><sub><b>Floriel</b></sub></a><br /><a href="https://github.com/remirror/remirror/commits?author=Ffloriel" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/domq"><img src="https://avatars3.githubusercontent.com/u/1629585?v=4" width="100px;" alt=""/><br /><sub><b>domq</b></sub></a><br /><a href="https://github.com/remirror/remirror/commits?author=domq" title="Code">💻</a> <a href="https://github.com/remirror/remirror/issues?q=author%3Adomq" title="Bug reports">🐛</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
