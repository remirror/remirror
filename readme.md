<div align="center">
	<br />
	<div align="center">
		<img width="300" height="300" src="support/assets/logo.svg" alt="remirror" />
	</div>
    <br />
    <br />
    <br />
</div>

<p align="center">

<a href="https://dev.azure.com/remirror/remirror/_build/latest?definitionId=1&amp;branchName=master"><img src="https://dev.azure.com/remirror/remirror/_apis/build/status/ifiokjr.remirror?branchName=canary" alt="Azure DevOps builds" /></a>
<a href="https://travis-ci.com/ifiokjr/remirror"><img src="https://travis-ci.com/ifiokjr/remirror.svg?branch=canary" alt="Travis (.com)" /></a>
<a href="https://codeclimate.com/github/ifiokjr/remirror/maintainability"><img src="https://api.codeclimate.com/v1/badges/cfd42ff63704a1cbe232/maintainability" /></a>
<a href="https://codeclimate.com/github/ifiokjr/remirror/test_coverage"><img src="https://api.codeclimate.com/v1/badges/cfd42ff63704a1cbe232/test_coverage" /></a>
<a href="https://github.com/ifiokjr/remirror/commits/master"><img src="https://img.shields.io/github/commit-activity/m/ifiokjr/remirror.svg?amp;logo=github" alt="GitHub commit activity"></a>
<a href="https://github.com/ifiokjr/remirror/commits/master"><img src="https://img.shields.io/github/last-commit/ifiokjr/remirror.svg?amp;logo=github" alt="GitHub last commit" /></a>
<a href="https://github.com/ifiokjr/remirror/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc"><img src="https://img.shields.io/github/issues-raw/ifiokjr/remirror.svg?amp;logo=github" alt="GitHub issues" /></a>
<a href="https://github.com/ifiokjr/remirror/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc"><img src="https://img.shields.io/github/issues-pr/ifiokjr/remirror.svg?amp;logo=github" alt="GitHub pull requests" /></a>
<a href="https://github.com/ifiokjr/remirror"><img src="https://img.shields.io/github/stars/ifiokjr/remirror.svg?amp;logo=github" alt="GitHub stars" /></a>
<a href="https://github.com/ifiokjr/remirror/tags"><img src="https://img.shields.io/github/tag-date/ifiokjr/remirror.svg?amp;logo=github" alt="GitHub tag (latest SemVer)" /></a>
<a href="https://github.com/ifiokjr/remirror/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/remirror.svg" alt="LICENSE" /></a>
<a href="https://app.netlify.com/sites/remirror/deploys"><img src="https://api.netlify.com/api/v1/badges/f59cbf02-798f-45dd-a78c-93ec52b08d20/deploy-status" alt="Netlify Status" /></a>

</p>

<br />

> Remirror is your toolkit for building world-class text-editors which run on the web, mobile and desktop.

<br />

- [Introduction]
- [Installation]
- [Getting started]

<br />

### Features

- Full support for **Server Side Rendering (SSR)** with **zero config**.
- **Top quality** prebuilt editors for immediate use in your next application.
- Almost 30 ready-made extensions for adding your own flavour and functionality to build your dream editor.
- CSS-in-JS support (can be switched off).

### Prerequisites

- Typescript `>= 3.5`
- React `>= 16.8`
- Yarn `>= 1.13`

### Testing

From the root of this repository run the following to trigger a full typecheck, linting and jest tests.

```bash
yarn checks
```

By default these checks are not run automatically. To enable automatic precommit and
prepush hooks use the following command:

```bash
yarn start:checks
```

To stop per-commit / per-push checks run:

```bash
yarn stop:checks
```

### Built With

- [Typescript]
- [React]
- [Prosemirror]
- [Theme UI]

### Contributing

Please read [contributing.md](docs/pages/contributing.md) for details on our code of conduct, and the process for submitting pull requests.

### Versioning

This project uses [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/ifiokjr/remirror/tags).

### License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

[introduction]: https://docs.remirror.org
[installation]: https://docs.remirror.org/installation
[getting started]: https://docs.remirror.org/guides/quickstart
[typescript]: https://github.com/microsoft/Typescript
[react]: https://github.com/facebook/react
[prosemirror]: https://prosemirror.net
[theme ui]: https://github.com/system-ui/theme-ui
