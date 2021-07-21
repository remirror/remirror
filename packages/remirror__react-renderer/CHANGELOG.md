# @remirror/react-renderer

## 1.0.2

> 2021-07-21

### Patch Changes

- [#1010](https://github.com/remirror/remirror/pull/1010) [`0464a6810`](https://github.com/remirror/remirror/commit/0464a68101bc4f64fe31a87dbba937008e17358b) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add support for `react@18` in peer dependencies.

## 1.0.1

> 2021-07-17

### Patch Changes

- [#1002](https://github.com/remirror/remirror/pull/1002) [`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Use carets `^` for versioning of `remirror` packages.

- Updated dependencies [[`b3ea6f10d`](https://github.com/remirror/remirror/commit/b3ea6f10d4917f933971236be936731f75a69a70)]:
  - @remirror/core@1.0.1

## 1.0.0

> 2021-07-17

##### Major Changes

For information on what's changed in this release see the [`v1.0.0` release](https://github.com/remirror/remirror/releases/tag/v1.0.0).

### Minor Changes

- [#886](https://github.com/remirror/remirror/pull/886) [`ce3bd9b06`](https://github.com/remirror/remirror/commit/ce3bd9b069f9d587958c0fc73c8a1d02109e4677) Thanks [@ronnyroeller](https://github.com/ronnyroeller)! - Render horizontalRule by default

* [#881](https://github.com/remirror/remirror/pull/881) [`0ba71790f`](https://github.com/remirror/remirror/commit/0ba71790fcd0b69fb835e744c6dccace120e6ee7) Thanks [@ronnyroeller](https://github.com/ronnyroeller)! - Make react-renderer composable. Before, it was hard to add further node renderer to RemirrorRenderer. Users couldn't use the existing node renderer like `TextHandler` and `CodeBlock` because they weren't exported. This commit simplifies composing a static renderer for the user's needs by exporting the renderers and the interface required to write custom node renderers. As part of the commit, the complex renderer file is split into smaller - easier to understand and test - units.

- [#887](https://github.com/remirror/remirror/pull/887) [`f848ba64b`](https://github.com/remirror/remirror/commit/f848ba64ba686c868c651e004cbbe25e2d405957) Thanks [@ronnyroeller](https://github.com/ronnyroeller)! - Support callout nodes in react-renderer

* [#882](https://github.com/remirror/remirror/pull/882) [`1982aa447`](https://github.com/remirror/remirror/commit/1982aa447706850093d1d544db2c6de2aefa478b) Thanks [@ronnyroeller](https://github.com/ronnyroeller)! - Support static rendering of heading, iframe, link. Added support for some common node types and marks. The iframe and link handler can be parameterized to change the visualization vs the node attributes in RemirrorJSON. For example, it allows to open links in a new tab or set the iframe to a specific width/height (independently of how this was entered in the editor).

### Patch Changes

- [#884](https://github.com/remirror/remirror/pull/884) [`838a2942d`](https://github.com/remirror/remirror/commit/838a2942df854be80bc74dfdae39786a8bae863b) Thanks [@ronnyroeller](https://github.com/ronnyroeller)! - Expose renderer for heading, link, and iframe

- Updated dependencies [[`8202b65ef`](https://github.com/remirror/remirror/commit/8202b65efbce5a8338c45fd34b3efb676b7e54e7), [`adfb12a4c`](https://github.com/remirror/remirror/commit/adfb12a4cee7031eec4baa10830b0fc0134ebdc8), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`b4dfcad36`](https://github.com/remirror/remirror/commit/b4dfcad364a0b41d321fbd26a97377f2b6d4047c), [`6ab7d2224`](https://github.com/remirror/remirror/commit/6ab7d2224d16ba821d8510e0498aaa9c420922c4), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`270edd91b`](https://github.com/remirror/remirror/commit/270edd91ba6badf9468721e35fa0ddc6a21c6dd2), [`7024de573`](https://github.com/remirror/remirror/commit/7024de5738a968f2914a999e570d723899815611), [`03d0ae485`](https://github.com/remirror/remirror/commit/03d0ae485079a166a223b902ea72cbe62504b0f0)]:
  - @remirror/core@1.0.0

## 1.0.0-next.1

> 2020-07-16

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.

## 1.0.0-next.0

> 2020-07-05

### Major Changes

- b3153b4c: Deprecate unused packages in the latest version.
- 5fc78bd0: This package is **deprecated** and it's functionality is included by default with the `@remirror/react` package.

  It is now accessible with the following installation.

  ```bash
  # Yarn
  yarn add @remirror/react

  # PNPM
  pnpm add @remirror/react

  # npm
  npm install @remirror/react
  ```

## 0.11.0

### Patch Changes

- Updated dependencies [c2237aa0]
  - @remirror/core@0.11.0

## 0.7.6

### Patch Changes

- Updated dependencies [0300d01c]
  - @remirror/core@0.9.0
  - @remirror/react-utils@0.7.6

## 0.7.5

### Patch Changes

- Updated dependencies [24f83413]
- Updated dependencies [24f83413]
  - @remirror/core@0.8.0
  - @remirror/react-utils@0.7.5

## 0.7.4

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub organisation.
- Updated dependencies [7380e18f]
  - @remirror/core@0.7.4
  - @remirror/react-utils@0.7.4

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core@0.7.3
  - @remirror/react-utils@0.7.3
