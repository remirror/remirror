# @remirror/showcase

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/showcase.svg?style=for-the-badge)](https://bundlephobia.com/result?p=@remirror/showcase) [![npm](https://img.shields.io/npm/dm/@remirror/showcase.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@remirror/showcase) [![Dependencies (path)](https://img.shields.io/david/ifiokjr/remirror.svg?logo=npm&path=@remirror%2Fshowcase&style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/@remirror/showcase/package.json) [![NPM](https://img.shields.io/npm/l/@remirror/showcase.svg?style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/LICENSE) [![GitHub issues by-label](https://img.shields.io/github/issues/ifiokjr/remirror/@remirror/showcase.svg?label=Open%20Issues&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%40remirror%2Fshowcase) [![GitHub pull requests by-label](https://img.shields.io/github/issues-pr/ifiokjr/remirror/@remirror/showcase.svg?label=Open%20Pull%20Requests&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/pulls?utf8=%E2%9C%93&q=is%3Apr+is%3Aopen+sort%3Aupdated-desc+label%3A%40remirror%2Fshowcase)

A collection of demonstrations for quick usage of the codebase. Every UI package has an associated demonstration showcasing how it can be used.

## Installation

```bash
yarn add @remirror/showcase
```

The recommendation is to import from the direct files.

```tsx
import { SocialEditorDemo, SocialEditorDemoProps } from '@remirror/showcase/lib/editor-social';

const MyEditor = () => <SocialEditorDemo />;
```
