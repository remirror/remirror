<div align="center">
	<br />
	<div align="center">
		<img width="300" height="300" src="https://rawcdn.githack.com/ifiokjr/remirror/f94e6c63e555f65ad5f3f13a3f343204cdc92dff/support/assets/logo.svg?sanitize=true" alt="remirror" />
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

> Remirror is a toolkit for building accessibility focused editors which run on the web and desktop.

<br />

- [Introduction]
- [Installation]
- [Getting started]

<br />

### Features

- A11y focused and ARIA compatible.
- **3** prebuilt editors, [markdown](./@remirror/editor-markdown), [social](./@remirror/editor-social) and [wysiwyg](./@remirror/editor-wysiwyg).
- Extensions available for adding your own flavour to your own custom editor editor.
- Zero config support **Server Side Rendering (SSR)**.

### Prerequisites

- Typescript `>= 3.6`
- React `>= 16.9`
- Yarn `>= 1.17`

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

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/ifiokjr/remirror)

### Versioning

This project uses [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/ifiokjr/remirror/tags).

Currently all versions within the repo are locked and this will continue until `v1.0.0` is. At this point versions will be updated independently.

### License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

[introduction]: https://docs.remirror.org
[installation]: https://docs.remirror.org/installation
[getting started]: https://docs.remirror.org/guides/quickstart
[typescript]: https://github.com/microsoft/Typescript
[react]: https://github.com/facebook/react
[prosemirror]: https://prosemirror.net
[theme ui]: https://github.com/system-ui/theme-ui
