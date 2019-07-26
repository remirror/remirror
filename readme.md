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

[![Azure DevOps builds][azure-badge]][azure]
[![Travis(.com)][travis-badge]][travis]
[![Test Coverage][coverage-badge]][code-coverage]
[![Maintainability][maintainability]][code-coverage]
[![Technical Debt][issues-badge]][issues]
[![Commit Activity][activity-badge]][commits]
[![Last Commit][last-commit-badge]][last-commit]
[![GitHub issues][github-issues]][github-issues]
[![GitHub pull requests][github-pull-requests-badge]][github-pull-requests]
[![GitHub stars][github-stars-badge]][github-stars]
[![GitHub tags][github-tags-badge]][github-tags]
[![LICENSE][license-badge]][license]
[![Netlify Status][netlify-badge]][netlify]

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

By default these checks are run on every push. To prevent these hooks from running by default type:

```bash
yarn husky:stop
```

This copies `.config.sample.json` to `.config.json`. This file is read before hooks are run and can cancel checks when configured.

To resume per-commit / per-push checks run:

```bash
yarn husky:start
```

### Built With

- [Typescript]
- [React]
- [Prosemirror]

### Contributing

Please read [contributing.md](https://github.com/ifiokjr/remirror/blob/master/docs/pages/contributing.md) for details on our code of conduct, and the process for submitting pull requests.

### Versioning

This project uses [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/ifiokjr/remirror/tags).

### License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

[introduction]: https://remirror.io
[installation]: https://remirror.io/docs/installation
[getting started]: https://remirror.io/guides/quickstart
[typescript]: https://github.com/microsoft/Typescript
[react]: https://github.com/facebook/react
[prosemirror]: https://prosemirror.net
[azure-badge]: https://img.shields.io/azure-devops/build/remirror/1b12c364-8c17-4f7a-a215-b8e0d2c9b253/1.svg?label=Azure%20Pipeline&style=for-the-badge&logo=azuredevops
[azure]: https://dev.azure.com/remirror/remirror/_build/latest?definitionId=1&branchName=master
[travis-badge]: https://img.shields.io/travis/com/ifiokjr/remirror.svg?label=Travis%20Build&style=for-the-badge&logo=travis
[travis]: https://travis-ci.com/ifiokjr/remirror
[coverage-badge]: https://img.shields.io/codeclimate/coverage/ifiokjr/remirror.svg?logoColor=https%3A%2F%2Fimg.shields.io%2Fcodeclimate%2Fcoverage%2Fifiokjr%2Fremirror.svg%3Fstyle%3Dflat-square&style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDI0IDI0Ij48dGl0bGU+Q29kZSBDbGltYXRlIGljb248L3RpdGxlPjxwYXRoIGQ9Ik0gMTYuMDQ2ODc1IDUuMDM5MDYyIEwgMjQgMTIuOTkyMTg4IEwgMjEuMjkyOTY5IDE1LjcwMzEyNSBMIDE2LjA0Njg3NSAxMC40NTcwMzEgTCAxNC4yMDMxMjUgMTIuMzA4NTk0IEwgMTEuNDg4MjgxIDkuNTk3NjU2IFogTSAxMC42NTIzNDQgMTAuNDM3NSBMIDEzLjM1OTM3NSAxMy4xNTIzNDQgTCAxNS45MDYyNSAxNS42OTE0MDYgTCAxMy4xOTE0MDYgMTguMzk4NDM4IEwgNy45NTMxMjUgMTMuMTYwMTU2IEwgMy43NzczNDQgMTcuMzM1OTM4IEwgMi43MDcwMzEgMTguMzk4NDM4IEwgMCAxNS42OTE0MDYgTCA3Ljk1MzEyNSA3LjczODI4MSBaIE0gMTAuNjUyMzQ0IDEwLjQzNzUgIi8+PC9zdmc+
[code-coverage]: https://codeclimate.com/github/ifiokjr/remirror/maintainability
[maintainability-badge]: https://img.shields.io/codeclimate/maintainability/ifiokjr/remirror.svg?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDI0IDI0Ij48dGl0bGU+Q29kZSBDbGltYXRlIGljb248L3RpdGxlPjxwYXRoIGQ9Ik0gMTYuMDQ2ODc1IDUuMDM5MDYyIEwgMjQgMTIuOTkyMTg4IEwgMjEuMjkyOTY5IDE1LjcwMzEyNSBMIDE2LjA0Njg3NSAxMC40NTcwMzEgTCAxNC4yMDMxMjUgMTIuMzA4NTk0IEwgMTEuNDg4MjgxIDkuNTk3NjU2IFogTSAxMC42NTIzNDQgMTAuNDM3NSBMIDEzLjM1OTM3NSAxMy4xNTIzNDQgTCAxNS45MDYyNSAxNS42OTE0MDYgTCAxMy4xOTE0MDYgMTguMzk4NDM4IEwgNy45NTMxMjUgMTMuMTYwMTU2IEwgMy43NzczNDQgMTcuMzM1OTM4IEwgMi43MDcwMzEgMTguMzk4NDM4IEwgMCAxNS42OTE0MDYgTCA3Ljk1MzEyNSA3LjczODI4MSBaIE0gMTAuNjUyMzQ0IDEwLjQzNzUgIi8+PC9zdmc+
[issues-badge]: https://img.shields.io/codeclimate/tech-debt/ifiokjr/remirror.svg?style=for-the-badge&&logo=data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDI0IDI0Ij48dGl0bGU+Q29kZSBDbGltYXRlIGljb248L3RpdGxlPjxwYXRoIGQ9Ik0gMTYuMDQ2ODc1IDUuMDM5MDYyIEwgMjQgMTIuOTkyMTg4IEwgMjEuMjkyOTY5IDE1LjcwMzEyNSBMIDE2LjA0Njg3NSAxMC40NTcwMzEgTCAxNC4yMDMxMjUgMTIuMzA4NTk0IEwgMTEuNDg4MjgxIDkuNTk3NjU2IFogTSAxMC42NTIzNDQgMTAuNDM3NSBMIDEzLjM1OTM3NSAxMy4xNTIzNDQgTCAxNS45MDYyNSAxNS42OTE0MDYgTCAxMy4xOTE0MDYgMTguMzk4NDM4IEwgNy45NTMxMjUgMTMuMTYwMTU2IEwgMy43NzczNDQgMTcuMzM1OTM4IEwgMi43MDcwMzEgMTguMzk4NDM4IEwgMCAxNS42OTE0MDYgTCA3Ljk1MzEyNSA3LjczODI4MSBaIE0gMTAuNjUyMzQ0IDEwLjQzNzUgIi8+PC9zdmc+
[issues]: https://codeclimate.com/github/ifiokjr/remirror/issues
[activity-badge]: https://img.shields.io/github/commit-activity/m/ifiokjr/remirror.svg?style=for-the-badge&logo=github
[commits]: https://github.com/ifiokjr/remirror/commits/master
[last-commit-badge]: https://img.shields.io/github/last-commit/ifiokjr/remirror.svg?style=for-the-badge&logo=github
[last-commit]: https://github.com/ifiokjr/remirror/commits/master
[github-issues-badge]: https://img.shields.io/github/issues-raw/ifiokjr/remirror.svg?style=for-the-badge&logo=github
[github-issues]: https://github.com/ifiokjr/remirror/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc
[github-pull-requests-badge]: https://img.shields.io/github/issues-pr/ifiokjr/remirror.svg?style=for-the-badge&logo=github
[github-pull-requests]: https://github.com/ifiokjr/remirror/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc
[github-stars-badge]: https://img.shields.io/github/stars/ifiokjr/remirror.svg?style=for-the-badge&logo=github
[github-stars]: https://github.com/ifiokjr/remirror
[github-tags-badge]: https://img.shields.io/github/tag-date/ifiokjr/remirror.svg?style=for-the-badge&logo=github
[github-tags]: https://github.com/ifiokjr/remirror/tags
[license-badge]: https://img.shields.io/npm/l/remirror.svg?style=for-the-badge
[license]: https://github.com/ifiokjr/remirror/blob/master/LICENSE
[netlify]: https://app.netlify.com/sites/remirror/deploys
[netlify-badge]: https://api.netlify.com/api/v1/badges/f59cbf02-798f-45dd-a78c-93ec52b08d20/deploy-status
